import { db } from '../../lib/neon';
import { localDb, OfflineAssessment, OfflineAttempt } from './localDb';
import toast from 'react-hot-toast';

class SyncEngineService {
  // Helper: convert image URL to base64 data URL for offline caching
  private async imageUrlToBase64(url: string): Promise<string> {
    try {
      if (url.startsWith('data:')) return url;
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Could not cache image offline:', url, e);
      return url; // Fallback to original URL if fetch fails
    }
  }

  // --- Check-Out Assessment from Neon to Local APK Storage ---
  public async checkOutAssessment(studentId: number, quizId: number): Promise<OfflineAssessment> {
    toast.loading('Checking out assessment for offline access...', { id: 'checkout' });
    try {
      const quiz = await db.getQuizById(quizId);
      if (!quiz) throw new Error('Assessment not found');

      // Check if admin/teacher allowed offline access
      if (quiz.allow_offline === false) {
        throw new Error('Offline access is not enabled for this assessment.');
      }

      // Cache all question diagrams/images as base64 strings
      const cachedQuestions = [];
      for (const q of (quiz.questions || [])) {
        const cachedQ = { ...q };
        if (cachedQ.imageDataUrl) {
          cachedQ.imageDataUrl = await this.imageUrlToBase64(cachedQ.imageDataUrl);
        }
        cachedQuestions.push(cachedQ);
      }

      const offlineAssessment: OfflineAssessment = {
        id: quiz.id,
        student_id: studentId,
        title: quiz.title || 'Assessment',
        subject_name: quiz.subject_name || 'General',
        duration_minutes: quiz.duration_minutes || quiz.time_limit || 60,
        instructions: quiz.instructions || '',
        questions: cachedQuestions,
        allow_offline: true,
        checked_out_at: new Date().toISOString()
      };

      await localDb.saveOfflineAssessment(offlineAssessment);
      toast.success('Assessment checked out! You can now take it offline.', { id: 'checkout' });
      return offlineAssessment;
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out assessment', { id: 'checkout' });
      throw error;
    }
  }

  // --- Local Randomization (Group-Aware & Option Shuffling) ---
  public shuffleQuestionsLocally(questions: any[], shuffleQuestions = true, shuffleOptions = true): any[] {
    let result = [...questions];

    if (shuffleQuestions) {
      const groups: Record<string, any[]> = {};
      result.forEach((q) => {
        const gid = String(q.group_id || 0);
        if (!groups[gid]) groups[gid] = [];
        groups[gid].push(q);
      });
      const groupKeys = Object.keys(groups);
      for (let i = groupKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
      }
      const shuffled: any[] = [];
      for (const key of groupKeys) {
        shuffled.push(...groups[key]);
      }
      result = shuffled;
    }

    if (shuffleOptions) {
      result.forEach((q) => {
        if (q.options && Array.isArray(q.options)) {
          for (let i = q.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
          }
        }
      });
    }

    return result;
  }

  // --- Check-In / Sync Local Attempts to Neon ---
  public async syncPendingAttempts(): Promise<number> {
    const pending = await localDb.getPendingSyncAttempts();
    if (pending.length === 0) return 0;

    let syncedCount = 0;
    for (const attempt of pending) {
      try {
        // Start attempt in remote DB
        const remoteAttemptId = await db.startQuizAttempt(attempt.student_id, attempt.assessment_id);

        // Submit responses
        for (const resp of attempt.responses) {
          await db.submitQuizResponse({
            attempt_id: remoteAttemptId,
            question_id: resp.question_id,
            response_text: resp.response_text,
            is_correct: resp.is_correct,
            points_earned: resp.points_earned
          });
        }

        // Complete attempt
        await db.completeQuizAttempt(remoteAttemptId, attempt.score, attempt.percentage, attempt.tab_switches);

        // Mark synced in local DB
        await localDb.markAttemptSynced(attempt.local_attempt_id);
        syncedCount++;
      } catch (error) {
        console.error('Failed to sync offline attempt:', attempt.local_attempt_id, error);
      }
    }

    if (syncedCount > 0) {
      toast.success(`Synced ${syncedCount} offline attempt(s) to server!`);
    }
    return syncedCount;
  }
}

export const syncEngine = new SyncEngineService();

import { Capacitor } from '@capacitor/core';

export interface OfflineAssessment {
  id: number;
  student_id: number;
  title: string;
  subject_name: string;
  duration_minutes: number;
  instructions: string;
  questions: any[]; // Questions with base64 image data cached
  allow_offline: boolean;
  checked_out_at: string;
}

export interface OfflineAttempt {
  local_attempt_id: string;
  assessment_id: number;
  student_id: number;
  responses: any[];
  score: number;
  percentage: number;
  tab_switches: number;
  status: 'in-progress' | 'pending_sync' | 'synced';
  completed_at?: string;
}

class LocalDbService {
  private dbName = 'asashs_offline_db';
  private dbVersion = 1;
  private idbInstance: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.idbInstance) return this.idbInstance;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (e) => reject(request.error || new Error('Failed to open local IDB'));
      request.onsuccess = () => {
        this.idbInstance = request.result;
        resolve(this.idbInstance);
      };

      request.onupgradeneeded = (e: any) => {
        const db = e.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains('offline_assessments')) {
          const store = db.createObjectStore('offline_assessments', { keyPath: ['student_id', 'id'] });
          store.createIndex('student_id', 'student_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('offline_attempts')) {
          const store = db.createObjectStore('offline_attempts', { keyPath: 'local_attempt_id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('student_id', 'student_id', { unique: false });
        }
      };
    });
  }

  // --- Assessment Check-Out / Cache ---
  public async saveOfflineAssessment(assessment: OfflineAssessment): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_assessments', 'readwrite');
      const store = tx.objectStore('offline_assessments');
      const req = store.put(assessment);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getOfflineAssessments(studentId: number): Promise<OfflineAssessment[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_assessments', 'readonly');
      const store = tx.objectStore('offline_assessments');
      const idx = store.index('student_id');
      const req = idx.getAll(studentId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getOfflineAssessmentById(studentId: number, assessmentId: number): Promise<OfflineAssessment | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_assessments', 'readonly');
      const store = tx.objectStore('offline_assessments');
      const req = store.get([studentId, assessmentId]);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteOfflineAssessment(studentId: number, assessmentId: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_assessments', 'readwrite');
      const store = tx.objectStore('offline_assessments');
      const req = store.delete([studentId, assessmentId]);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Offline Attempts & Check-In ---
  public async saveOfflineAttempt(attempt: OfflineAttempt): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_attempts', 'readwrite');
      const store = tx.objectStore('offline_attempts');
      const req = store.put(attempt);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getPendingSyncAttempts(): Promise<OfflineAttempt[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_attempts', 'readonly');
      const store = tx.objectStore('offline_attempts');
      const idx = store.index('status');
      const req = idx.getAll('pending_sync');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async markAttemptSynced(localAttemptId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_attempts', 'readwrite');
      const store = tx.objectStore('offline_attempts');
      const getReq = store.get(localAttemptId);
      getReq.onsuccess = () => {
        const attempt = getReq.result;
        if (attempt) {
          attempt.status = 'synced';
          store.put(attempt);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }
}

export const localDb = new LocalDbService();

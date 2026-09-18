import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

interface StudentVotingProps {
  studentId: number;
  onComplete: () => void;
}

export const StudentVoting: React.FC<StudentVotingProps> = ({ studentId, onComplete }) => {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'selection' | 'review' | 'success'>('selection');
  const [votes, setVotes] = useState<Record<number, any>>({}); // positionId -> candidate
  const [readingManifesto, setReadingManifesto] = useState<any>(null);

  useEffect(() => {
    fetchActiveElections();
  }, []);

  const fetchActiveElections = async () => {
    try {
      const all = await db.getElections();
      const active = all.filter((e: any) => e.status === 'open');
      setElections(active);
      if (active.length > 0) {
        const fullElection = await db.getElectionById(active[0].id);
        const positionsWithCandidates = await Promise.all(
          fullElection.positions.map(async (pos: any) => {
            const candidates = await db.getCandidates(pos.id);
            return { ...pos, candidates };
          })
        );
        setSelectedElection({ ...fullElection, positions: positionsWithCandidates });
      }
    } catch (error) {
      toast.error('Failed to load active elections');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteChange = (positionId: number, candidate: any) => {
    setVotes(prev => ({ ...prev, [positionId]: candidate }));
  };

  const handleSubmitVotes = async () => {
    try {
      setIsSubmitting(true);
      const selections = Object.entries(votes).map(([posId, cand]) => ({
        position_id: parseInt(posId),
        candidate_id: cand.id
      }));

      await db.submitVote(selectedElection.id, studentId, selections);
      setStep('success');
      toast.success('Ballot officially recorded');
    } catch (error: any) {
      if (error.message === 'ALREADY_VOTED') {
        toast.error('Your vote has already been recorded for this election.');
      } else {
        toast.error('Failed to submit ballot');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-16 space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-700"></div>
      <p className="text-gray-500 text-xs">Preparing your official ballot...</p>
    </div>
  );

  if (!selectedElection) return (
    <div className="p-10 text-center bg-white rounded-md border border-gray-200 space-y-2">
      <h3 className="text-sm font-semibold text-gray-900">No Active Elections</h3>
      <p className="text-gray-500 text-xs">There are no school elections currently open for voting.</p>
    </div>
  );

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 text-center rounded-md border border-gray-200 shadow-xl animate-fade-in space-y-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h3 className="text-lg font-bold text-gray-900">Ballot Successfully Cast</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your vote has been securely recorded. Official results will be published once the polls close.
        </p>
        <div className="pt-2">
          <PortalButton
            onClick={onComplete}
            variant="primary"
            size="md"
            fullWidth
          >
            Return to Student Dashboard
          </PortalButton>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Review Your Ballot</h2>
          <p className="text-xs text-gray-500 mt-1">Please confirm your selections before submitting your vote.</p>
        </div>

        <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
          {selectedElection.positions.map((pos: any) => (
            <div key={pos.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{pos.title}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{votes[pos.id]?.display_name || 'No selection made'}</p>
              </div>
              <button 
                onClick={() => setStep('selection')}
                className="text-xs font-semibold text-school-green-800 hover:underline min-h-[36px] flex items-center"
              >
                Change
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <PortalButton
            onClick={() => setStep('selection')}
            variant="outline"
            size="md"
            fullWidth
            disabled={isSubmitting}
          >
            Back to Ballot
          </PortalButton>
          <PortalButton
            onClick={handleSubmitVotes}
            variant="primary"
            size="md"
            fullWidth
            loading={isSubmitting}
            loadingText="Recording Vote..."
          >
            Confirm & Cast Vote
          </PortalButton>
        </div>
      </div>
    );
  }

  const selectedCount = Object.keys(votes).length;
  const totalPositions = selectedElection.positions.length;
  const isComplete = selectedCount >= totalPositions;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold text-school-green-800 bg-school-green-50 border border-school-green-200 px-2.5 py-0.5 rounded-sm uppercase tracking-wider inline-block">
          Official Ballot
        </span>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedElection.name}</h2>
        <p className="text-xs text-gray-500">Select one candidate for each student executive position</p>
      </div>

      <div className="space-y-8">
        {selectedElection.positions.map((pos: any, posIdx: number) => (
          <section key={pos.id} className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-sm bg-school-green-700 text-white flex items-center justify-center text-xs font-bold tabular-nums">
                  {posIdx + 1}
                </span>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{pos.title}</h3>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Select 1</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pos.candidates && pos.candidates.length > 0 ? (
                pos.candidates.map((cand: any) => {
                  const isSelected = votes[pos.id]?.id === cand.id;
                  return (
                    <div 
                      key={cand.id}
                      onClick={() => handleVoteChange(pos.id, cand)}
                      className={`p-4 rounded-md border transition-all duration-fast ease-standard cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'border-school-green-700 bg-school-green-50/50 shadow-xs' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <UserAvatar 
                          name={cand.display_name} 
                          src={cand.image_url} 
                          size="lg" 
                          className={isSelected ? 'ring-2 ring-school-green-700' : ''}
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mt-2.5 leading-snug">{cand.display_name}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{cand.student_class || 'Candidate'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-1.5 w-full">
                        {cand.manifesto && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingManifesto(cand);
                            }}
                            className="min-h-[32px] text-[11px] font-medium text-school-green-800 hover:underline"
                          >
                            Read Manifesto
                          </button>
                        )}
                        <div className={`w-full py-1.5 rounded-sm text-center text-xs font-semibold select-none border ${
                          isSelected
                            ? 'bg-school-green-700 text-white border-school-green-800'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {isSelected ? 'Selected' : 'Select'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-500">
                  No registered candidates for this office.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Manifesto Modal */}
      {readingManifesto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setReadingManifesto(null)}>
          <div className="bg-white w-full max-w-md rounded-md border border-gray-200 shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Candidate Manifesto</h4>
                <p className="text-xs font-semibold text-school-green-800 mt-0.5">{readingManifesto.display_name}</p>
              </div>
              <button 
                onClick={() => setReadingManifesto(null)}
                aria-label="Close manifesto"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-sm hover:bg-gray-100 text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-sm p-4 border border-gray-200 max-h-64 overflow-y-auto text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
              {readingManifesto.manifesto || 'No manifesto text submitted by candidate.'}
            </div>
            <div className="mt-4 flex justify-end">
              <PortalButton
                onClick={() => setReadingManifesto(null)}
                variant="primary"
                size="sm"
              >
                Close
              </PortalButton>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Review Bar */}
      <div className="sticky bottom-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md p-3 shadow-lg flex items-center justify-between max-w-md mx-auto">
          <div className="text-xs">
            <span className="font-semibold text-gray-900 tabular-nums">{selectedCount}</span>
            <span className="text-gray-500"> of </span>
            <span className="font-semibold text-gray-900 tabular-nums">{totalPositions}</span>
            <span className="text-gray-500"> positions chosen</span>
          </div>
          <PortalButton
            onClick={() => setStep('review')}
            disabled={!isComplete}
            variant="primary"
            size="sm"
          >
            Review Ballot &rarr;
          </PortalButton>
        </div>
      </div>
    </div>
  );
};

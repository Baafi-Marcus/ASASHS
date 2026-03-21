import React, { useState, useEffect } from 'react';
import db from '../../../lib/neon';
import { toast } from 'react-hot-toast';

interface StudentVotingProps {
  studentId: number;
  onComplete: () => void;
}

export const StudentVoting: React.FC<StudentVotingProps> = ({ studentId, onComplete }) => {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
        // Fetch full election details including positions
        const fullElection = await db.getElectionById(active[0].id);
        
        // Fetch candidates for each position
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
      const selections = Object.entries(votes).map(([posId, cand]) => ({
        position_id: parseInt(posId),
        candidate_id: cand.id
      }));

      await db.submitVote(selectedElection.id, studentId, selections);
      setStep('success');
      toast.success('Vote cast successfully!');
    } catch (error: any) {
      if (error.message === 'ALREADY_VOTED') {
        toast.error('You have already voted in this election.');
      } else {
        toast.error('Failed to submit votes');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      <p className="text-gray-500 font-medium">Preparing your ballot...</p>
    </div>
  );

  if (!selectedElection) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Elections</h3>
      <p className="text-gray-500">There are no school elections currently open for voting.</p>
    </div>
  );

  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto bg-white p-12 text-center rounded-[2.5rem] shadow-2xl border border-school-green-100 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-school-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-12 h-12 text-school-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">VOTE CASTED!</h3>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Your participation strengthens our democracy. Results will be announced once the election concludes.
        </p>
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-school-green-600 to-school-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Review Your Selections</h2>
          <p className="text-gray-500 mt-2">Please double-check your choices before final submission.</p>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 space-y-6">
            {selectedElection.positions.map((pos: any) => (
              <div key={pos.id} className="flex justify-between items-center pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{pos.title}</p>
                  <p className="text-xl font-bold text-gray-900">{votes[pos.id]?.display_name || 'No selection'}</p>
                </div>
                <button 
                  onClick={() => setStep('selection')}
                  className="text-school-green-600 font-bold hover:underline"
                >
                  Change
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setStep('selection')}
            className="w-full py-4 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-lg"
          >
            Back to Ballot
          </button>
          <button
            onClick={handleSubmitVotes}
            className="w-full bg-school-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-school-green-700 transition-all group"
          >
            Confirm & Submit Vote
            <svg className="inline-block w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-12">
      <div className="text-center">
        <span className="bg-school-green-100 text-school-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ring-1 ring-school-green-200 mb-4 inline-block">
          Official Ballot
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">{selectedElection.name}</h2>
        <div className="h-1.5 w-24 bg-school-green-600 mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="space-y-16">
        {selectedElection.positions.map((pos: any) => (
          <section key={pos.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-4">
                <span className="bg-school-green-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg transform rotate-3">{selectedElection.positions.indexOf(pos) + 1}</span>
                <h3 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">{pos.title}</h3>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg uppercase">Select 1 Candidate</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pos.candidates && pos.candidates.length > 0 ? (
                pos.candidates.map((cand: any) => (
                  <div 
                    key={cand.id}
                    onClick={() => handleVoteChange(pos.id, cand)}
                    className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group hover:shadow-xl ${
                      votes[pos.id]?.id === cand.id 
                        ? 'border-school-green-500 bg-school-green-50/30' 
                        : 'border-transparent bg-white shadow-sm hover:border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all duration-500 overflow-hidden ${
                        votes[pos.id]?.id === cand.id ? 'bg-school-green-100 scale-110' : 'bg-gray-50 group-hover:bg-gray-100'
                      }`}>
                        {cand.image_url ? (
                          <img src={cand.image_url} alt={cand.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className={`w-10 h-10 ${votes[pos.id]?.id === cand.id ? 'text-school-green-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{cand.display_name}</h4>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Candidate</p>
                      
                      <div className="flex flex-col w-full space-y-2">
                        {cand.manifesto && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingManifesto(cand);
                            }}
                            className="text-xs font-bold text-school-green-600 hover:text-school-green-700 px-3 py-1 rounded-lg border border-school-green-100 hover:bg-school-green-50 transition-colors"
                          >
                            View Manifesto
                          </button>
                        )}
                        <div className={`w-full py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                          votes[pos.id]?.id === cand.id 
                            ? 'bg-school-green-600 text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                        }`}>
                          {votes[pos.id]?.id === cand.id ? 'Selected' : 'Select'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 italic">No candidates registered for this position.</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Manifesto Modal */}
      {readingManifesto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black text-gray-900 uppercase">Manifesto</h4>
                  <p className="text-school-green-600 font-bold mt-1 text-lg">{readingManifesto.display_name}</p>
                </div>
                <button onClick={() => setReadingManifesto(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-h-[40vh] overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                  "{readingManifesto.manifesto || 'No manifesto provided by the candidate.'}"
                </p>
              </div>
              <button
                onClick={() => setReadingManifesto(null)}
                className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-xl"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-6 pt-12">
        <div className="max-w-md mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-school-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <button
            onClick={() => setStep('review')}
            disabled={Object.keys(votes).length < selectedElection.positions.length}
            className="relative w-full bg-school-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-school-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {Object.keys(votes).length < selectedElection.positions.length 
              ? `Select ${selectedElection.positions.length - Object.keys(votes).length} more to continue`
              : 'Review My Ballot'}
            <svg className="inline-block w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Secure Encrypted Voting Interface v3.0</p>
      </div>
    </div>
  );
};

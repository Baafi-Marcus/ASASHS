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
  const [votes, setVotes] = useState<Record<number, number>>({});

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
        setSelectedElection(fullElection);
      }
    } catch (error) {
      toast.error('Failed to load active elections');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteChange = (positionId: number, candidateId: number) => {
    setVotes(prev => ({ ...prev, [positionId]: candidateId }));
  };

  const handleSubmitVotes = async () => {
    try {
      const selections = Object.entries(votes).map(([posId, candId]) => ({
        position_id: parseInt(posId),
        candidate_id: candId
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading election data...</div>;
  if (!selectedElection) return <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 italic text-gray-400">No active elections at this time.</div>;

  if (step === 'success') {
    return (
      <div className="bg-white p-12 text-center rounded-3xl shadow-xl border border-school-green-100 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-school-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-school-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Voting!</h3>
        <p className="text-gray-600 mb-8">Your contribution to our school's leadership selection is highly valued.</p>
        <button
          onClick={onComplete}
          className="bg-school-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-school-green-700 transition-all shadow-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{selectedElection.name}</h2>
        <div className="h-1 w-20 bg-school-green-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="space-y-12">
        {selectedElection.positions.map((pos: any) => (
          <section key={pos.id} className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="bg-school-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">{selectedElection.positions.indexOf(pos) + 1}</span>
              <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{pos.title}</h3>
            </div>
            
            {/* We'll need a getCandidates call here in a real impl, usually joined in getElectionById */}
            <div className="grid grid-cols-1 gap-4">
              {/* Dynamic candidates would go here */}
              <p className="text-sm text-gray-400 italic">Candidate selection list loading...</p>
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-6 pt-8">
        <button
          onClick={() => setStep('review')}
          disabled={Object.keys(votes).length < selectedElection.positions.length}
          className="w-full bg-school-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-school-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          Proceed to Review
          <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

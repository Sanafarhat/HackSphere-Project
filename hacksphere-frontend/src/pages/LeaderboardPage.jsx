import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import axios from 'axios';

const LeaderboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const dummyData = [
          { teamId: 'd1', teamName: 'Quantum Coders', leader: 'Alice', members: 4, percentage: 95 },
          { teamId: 'd2', teamName: 'EcoSync', leader: 'Bob', members: 5, percentage: 80 },
          { teamId: 'd3', teamName: 'DeFi Pioneers', leader: 'Charlie', members: 3, percentage: 65 },
          { teamId: 'd4', teamName: 'Cyber Knights', leader: 'Diana', members: 4, percentage: 40 },
        ];
        const combined = [...(res.data || []), ...dummyData];
        const sorted = combined.sort((a, b) => b.percentage - a.percentage);
        setRows(sorted);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container-custom">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-4xl md:text-6xl font-display font-black text-foreground uppercase tracking-tight flex items-center gap-4">
            <Trophy className="text-accent" size={48} /> Leaderboard
          </h1>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-bold uppercase tracking-wider text-mutedForeground hover:text-accent transition-colors">Back to Dashboard</button>
        </div>

        <div className="editorial-card relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : rows.length === 0 ? (
            <p className="text-mutedForeground font-medium text-center py-12">No leaderboard data yet.</p>
          ) : (
            <div className="space-y-4 relative z-10">
              {rows.map((r, idx) => (
                <div key={r.teamId} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border-2 border-foreground/10 hover:border-accent/50 transition-colors rounded-xl">
                  <div className="flex items-center gap-6 mb-4 sm:mb-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl ${idx === 0 ? 'bg-warning text-white shadow-[4px_4px_0px_rgba(245,158,11,1)] border-2 border-warning' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-muted text-mutedForeground'}`}>
                      {idx+1}
                    </div>
                    <div>
                      <p className="font-display font-black uppercase text-xl text-foreground mb-1">{r.teamName}</p>
                      <p className="text-sm font-bold text-mutedForeground">Lead: {r.leader || '—'} • Members: {r.members}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-3 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${r.percentage}%` }}></div>
                    </div>
                    <p className="font-display font-black text-2xl text-accent w-16 text-right">{r.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

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
        const res = await axios.get('/api/progress/leaderboard');
        setRows(res.data || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Trophy className="text-accent-500" /> Leaderboard</h1>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-accent-500 hover:text-accent-400">Back</button>
        </div>

        <div className="card">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-gray-400">No leaderboard data yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((r, idx) => (
                <div key={r.teamId} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-black font-bold">{idx+1}</div>
                    <div>
                      <p className="font-semibold text-white">{r.teamName}</p>
                      <p className="text-xs text-gray-400">Lead: {r.leader || '—'} • Members: {r.members}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent-500">{r.percentage}%</p>
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

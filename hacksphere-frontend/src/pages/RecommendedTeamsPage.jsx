import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Send, MessageSquare, ArrowLeft, Loader, Zap } from 'lucide-react';
import axios from 'axios';

export const RecommendedTeamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRecommendedTeams();
    fetchSentRequests();
  }, [user]);

  const fetchRecommendedTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teams/recommended');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch recommended teams:', error);
      // Fallback to open teams if recommendation fails
      fetchOpenTeams();
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenTeams = async () => {
    try {
      const response = await axios.get('/api/teams/open');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch open teams:', error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await axios.get('/api/join-requests/sent');
      setSentRequests(response.data.map(r => r.teamId));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSendRequest = async (teamId) => {
    try {
      await axios.post('/api/join-requests/send', {
        teamId,
        message,
      });
      setSentRequests([...sentRequests, teamId]);
      setSelectedTeam(null);
      setMessage('');
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Go to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Zap className="text-accent-500" size={40} />
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                AI-Recommended <span className="gradient-accent">Teams</span>
              </h1>
              <p className="text-gray-300">
                These teams match your skills and are looking for members like you.
              </p>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="animate-spin inline-block text-accent-500" size={48} />
            <p className="text-gray-300 mt-4">Finding teams that match your skills...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="card text-center py-16">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Recommended Teams Found</h3>
            <p className="text-gray-300 mb-6">
              Check back later or browse all open teams manually.
            </p>
            <button
              onClick={() => navigate('/find-team')}
              className="btn-primary"
            >
              Browse All Teams
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const isRequested = sentRequests.includes(team._id);
              const matchScore = team.matchScore ? Math.round(team.matchScore) : null;
              
              return (
                <div key={team._id} className="card relative">
                  {matchScore && (
                    <div className="absolute top-4 right-4 bg-accent-500/20 border border-accent-500 rounded-lg px-3 py-1">
                      <p className="text-xs font-bold text-accent-400">
                        {matchScore}% Match
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-400">
                      {team.members?.length || 0} / {team.maxMembers} members
                    </p>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {team.description}
                  </p>

                  {/* Skills they're looking for */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Looking for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {team.requiredSkills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-primary-900/30 text-primary-300 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-6 pb-6 border-b border-dark-600">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Tech Stack
                    </p>
                    <p className="text-sm text-gray-300">{team.techStack}</p>
                  </div>

                  {isRequested ? (
                    <button disabled className="w-full py-3 bg-dark-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                      Request Sent
                    </button>
                  ) : (team.members?.length || 0) >= (team.maxMembers || 5) ? (
                    <button disabled className="w-full py-3 bg-dark-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                      Team Full
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTeam(team._id)}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      <span>Send Join Request</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Request Modal */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-8 border border-dark-600 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Send Join Request</h2>
              <p className="text-gray-300 mb-6">
                Add a message to help the team lead understand why you're a great fit.
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea-field mb-6"
                placeholder="Hi! I'm interested in joining your team because..."
                rows={4}
              ></textarea>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendRequest(selectedTeam)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedTeamsPage;

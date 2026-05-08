import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export const FindTeamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOpenTeams();
    fetchSentRequests();
  }, []);

  const fetchOpenTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teams/open?filter=' + filter);
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
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
      // Show success toast
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
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Find Your Perfect <span className="gradient-accent">Team</span>
          </h1>
          <p className="text-gray-300">
            Browse open teams looking for members with your skills. Send a join request to teams that match your interests.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by skills, tech stack, or project type..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              fetchOpenTeams();
            }}
            className="input-field w-full"
          />
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="card text-center py-16">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Open Teams Found</h3>
            <p className="text-gray-300 mb-6">
              Check back later or consider creating your own team with your idea.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const isRequested = sentRequests.includes(team._id);
              return (
                <div key={team._id} className="card">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-400">{team.members?.length || 0} members</p>
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
                        <badge key={idx}>{skill}</badge>
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
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedTeam(team._id)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        <span>Send Request</span>
                      </button>
                    </>
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

export default FindTeamPage;

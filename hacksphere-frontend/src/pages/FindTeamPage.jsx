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
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-mutedForeground font-bold hover:text-accent transition-colors mb-6 uppercase tracking-wider text-sm"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-6xl font-display font-black mb-4 text-foreground uppercase tracking-tight">
            Find Your Perfect <span className="text-accent">Team</span>
          </h1>
          <p className="text-xl text-mutedForeground font-light">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="editorial-card text-center py-16">
            <Users size={48} className="mx-auto text-mutedForeground mb-4" />
            <h3 className="text-2xl font-display font-black uppercase text-foreground mb-2">No Open Teams Found</h3>
            <p className="text-mutedForeground mb-6 font-medium">
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
                <div key={team._id} className="editorial-card flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-2xl font-display font-black text-foreground uppercase mb-1">{team.name}</h3>
                    <p className="text-sm font-bold text-mutedForeground">{team.members?.length || 0} members</p>
                  </div>

                  <p className="text-mutedForeground font-medium text-sm mb-6 flex-1">
                    {team.description}
                  </p>

                  {/* Skills they're looking for */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-mutedForeground uppercase tracking-widest mb-3">
                      Looking for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {team.requiredSkills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="badge bg-light-800 border-none">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b-2 border-foreground/10">
                    <p className="text-xs font-bold text-mutedForeground uppercase tracking-widest mb-2">
                      Team Size
                    </p>
                    <p className="text-lg font-black text-foreground">
                      {team.members?.length || 0} / {team.maxMembers} members
                    </p>
                  </div>

                  {isRequested ? (
                    <button disabled className="w-full py-4 border-2 border-foreground/20 bg-light-800 text-mutedForeground font-display font-bold uppercase cursor-not-allowed">
                      Request Sent
                    </button>
                  ) : (team.members?.length || 0) >= (team.maxMembers || 5) ? (
                    <button disabled className="w-full py-4 border-2 border-foreground/20 bg-light-800 text-mutedForeground font-display font-bold uppercase cursor-not-allowed">
                      Team Full
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
          <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-foreground shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full">
              <h2 className="text-2xl font-display font-black text-foreground uppercase mb-4">Send Join Request</h2>
              <p className="text-mutedForeground font-medium mb-6">
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

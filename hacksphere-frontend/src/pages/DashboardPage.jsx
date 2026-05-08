import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, AlertCircle, TrendingUp, Calendar, Zap } from 'lucide-react';
import axios from 'axios';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [idea, setIdea] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all([
          axios.get('/api/teams/my-team'),
          axios.get('/api/ideas/my-idea'),
          axios.get('/api/progress/my-progress'),
        ]).catch(() => [null, null, null]);

        setTeam(responses[0]?.data);
        setIdea(responses[1]?.data);
        setProgress(responses[2]?.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Welcome back, <span className="gradient-accent">{user?.name}</span>
          </h1>
          <p className="text-gray-300">
            {team ? 'Your team is ready. Let\'s build something amazing!' : 'Complete your team setup to get started.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-600 overflow-x-auto">
          {['overview', 'team', 'idea', 'progress'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'text-accent-500 border-b-2 border-accent-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Team Status */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Team Status</p>
                    <h3 className="text-2xl font-bold text-white">
                      {team ? 'Active' : 'Pending'}
                    </h3>
                  </div>
                  <Users className="text-accent-500" size={32} />
                </div>
                {team ? (
                  <p className="text-sm text-gray-300">{team.members?.length} members</p>
                ) : (
                  <button
                    onClick={() => navigate('/find-team')}
                    className="text-sm text-accent-500 hover:text-accent-400 font-semibold"
                  >
                    Find teammates →
                  </button>
                )}
              </div>

              {/* Idea Status */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Idea Status</p>
                    <h3 className="text-2xl font-bold text-white">
                      {idea ? 'Validated' : 'Pending'}
                    </h3>
                  </div>
                  <Zap className="text-warning" size={32} />
                </div>
                {idea ? (
                  <p className="text-sm text-gray-300">Score: {idea.score}/100</p>
                ) : (
                  <button
                    onClick={() => navigate('/validate-idea')}
                    className="text-sm text-accent-500 hover:text-accent-400 font-semibold"
                  >
                    Validate idea →
                  </button>
                )}
              </div>

              {/* Progress */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Overall Progress</p>
                    <h3 className="text-2xl font-bold text-white">
                      {progress?.percentage || 0}%
                    </h3>
                  </div>
                  <TrendingUp className="text-success" size={32} />
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {!team && (
                  <button
                    onClick={() => navigate('/find-team')}
                    className="btn-primary py-4"
                  >
                    Find a Team
                  </button>
                )}
                {team && !idea && (
                  <button
                    onClick={() => navigate('/validate-idea')}
                    className="btn-primary py-4"
                  >
                    Validate Your Idea
                  </button>
                )}
                {idea && (
                  <>
                    <button
                      onClick={() => navigate('/idea-validator')}
                      className="btn-secondary py-4"
                    >
                      Revalidate Idea
                    </button>
                    <button
                      onClick={() => navigate('/progress')}
                      className="btn-secondary py-4"
                    >
                      Track Progress
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {team ? (
              <>
                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-6">Team: {team.name}</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Members</p>
                      <div className="space-y-2">
                        {team.members?.map((member) => (
                          <div key={member._id} className="flex items-center justify-between bg-dark-700 rounded-lg p-4">
                            <div>
                              <p className="font-semibold text-white">{member.name}</p>
                              <p className="text-sm text-gray-400">{member.email}</p>
                            </div>
                            {member.isLeader && <badge-success>Team Lead</badge-success>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Team Yet</h3>
                <p className="text-gray-300 mb-6">
                  Start by finding teammates or creating a team with friends.
                </p>
                <button
                  onClick={() => navigate('/find-team')}
                  className="btn-primary"
                >
                  Find Teammates
                </button>
              </div>
            )}
          </div>
        )}

        {/* Idea Tab */}
        {activeTab === 'idea' && (
          <div className="space-y-6">
            {idea ? (
              <div className="card">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{idea.title}</h2>
                    <p className="text-gray-400 mt-2">Validation Status: <span className="text-success font-semibold">Approved</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-accent-500">{idea.score}</p>
                    <p className="text-sm text-gray-400">/100</p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-dark-600 pt-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-gray-300">{idea.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Problem Statement</h3>
                      <p className="text-gray-300">{idea.problemStatement}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Tech Stack</h3>
                      <p className="text-gray-300">{idea.techStack}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">AI Feedback</h3>
                    <div className="bg-dark-700 rounded-lg p-4 text-gray-300 italic">
                      {idea.feedback}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Idea Validated Yet</h3>
                <p className="text-gray-300 mb-6">
                  Validate your idea with our AI-powered validator to unlock the build phase.
                </p>
                <button
                  onClick={() => navigate('/validate-idea')}
                  className="btn-primary"
                >
                  Validate Idea
                </button>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {progress ? (
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-6">Build Phase Progress</h2>
                
                <div className="space-y-6">
                  {[
                    { title: 'Idea Validated', completed: progress?.ideaValidated },
                    { title: 'Repository Created', completed: progress?.repoCreated },
                    { title: 'Prototype Started', completed: progress?.prototypeStarted },
                    { title: 'Mid-Checkpoint Submitted', completed: progress?.midCheckpoint },
                    { title: 'Final Submission', completed: progress?.finalSubmission },
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4 pb-6 border-b border-dark-600 last:border-b-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        milestone.completed
                          ? 'bg-success text-white'
                          : 'bg-dark-700 text-gray-400'
                      }`}>
                        {milestone.completed ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{milestone.title}</p>
                        <p className="text-sm text-gray-400">
                          {milestone.completed ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Progress Tracking Coming Soon</h3>
                <p className="text-gray-300">
                  Progress tracking will be available once your idea is validated and the build phase begins.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

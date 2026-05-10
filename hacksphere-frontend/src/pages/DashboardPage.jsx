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
  const [resendingEmail, setResendingEmail] = useState(null); // tracks which email is resending

  const handleResendInvite = async (email) => {
  setResendingEmail(email);
  try {
    await axios.post('/api/teams/resend-invite', { email });
    alert(`Invite resent to ${email}`);
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to resend invite');
  } finally {
    setResendingEmail(null);
  }
};

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all([
          axios.get('/api/teams/my-team').catch(() => null),
          axios.get('/api/ideas/my-idea').catch(() => null),
          axios.get('/api/progress/my-progress').catch(() => null),
        ]);

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
            {team ? "Your team is ready. Let's build something amazing!" : 'Complete your team setup to get started.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-600 overflow-x-auto">
          {['overview', 'team', 'idea', 'progress'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'text-accent-500 border-b-2 border-accent-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
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
                  <p className="text-sm text-gray-300">{team.members?.length} member{team.members?.length !== 1 ? 's' : ''}</p>
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
                  <p className="text-sm text-gray-300">Score: {idea.validationScore || idea.score}/100</p>
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
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {!team && (
                  <button onClick={() => navigate('/find-team')} className="btn-primary py-4">
                    Find a Team
                  </button>
                )}
                {team && !idea && (
                  <button onClick={() => navigate('/validate-idea')} className="btn-primary py-4">
                    Validate Your Idea
                  </button>
                )}
                {idea && (
                  <>
                    <button onClick={() => navigate('/idea-validator')} className="btn-secondary py-4">
                      Revalidate Idea
                    </button>
                    <button onClick={() => navigate('/progress')} className="btn-secondary py-4">
                      Track Progress
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {team ? (
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-2">Team: {team.name}</h2>
                {team.description && (
                  <p className="text-gray-400 mb-6">{team.description}</p>
                )}

                {/* Team Meta */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {team.techStack && (
                    <span className="text-xs bg-dark-700 text-gray-300 px-3 py-1 rounded-full">
                      🛠 {team.techStack}
                    </span>
                  )}
                  <span className="text-xs bg-dark-700 text-gray-300 px-3 py-1 rounded-full">
                    👥 {team.members?.length}/{team.maxMembers} members
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    team.openToMembers ? 'bg-green-900 text-green-300' : 'bg-dark-700 text-gray-400'
                  }`}>
                    {team.openToMembers ? '🟢 Open to members' : '🔒 Closed'}
                  </span>
                </div>

                {/* Active Members */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">Active Members</p>
                  <div className="space-y-2">
                    {team.members?.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between bg-dark-700 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold text-sm">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{member.name}</p>
                            <p className="text-sm text-gray-400">{member.email}</p>
                            {member.department && (
                              <p className="text-xs text-gray-500">{member.department} • Year {member.year}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.skills?.length > 0 && (
                            <div className="hidden md:flex gap-1 flex-wrap justify-end max-w-[180px]">
                              {member.skills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-xs bg-dark-600 text-gray-300 px-2 py-0.5 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          {member._id === team.leader?._id ? (
                            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold whitespace-nowrap">
                              👑 Team Lead
                            </span>
                          ) : (
                            <span className="text-xs bg-dark-600 text-gray-300 px-2 py-1 rounded-full">
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invites */}
                {team.pendingInvites?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">
                      Pending Invites ({team.pendingInvites.filter(i => i.status === 'pending').length} awaiting)
                    </p>
                    <div className="space-y-2">
                      {team.pendingInvites.map((invite, index) => (
  <div
    key={index}
    className="flex items-center justify-between bg-dark-700 rounded-lg p-4 border border-dark-600"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-gray-400 text-sm font-bold">
        {invite.email?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-semibold text-white">{invite.email}</p>
        <p className="text-xs text-gray-500">
          Invited on {new Date(invite.sentAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {/* Resend button — only for pending invites and only if current user is leader */}
      {invite.status === 'pending' && user?._id === team.leader?._id && (
        <button
          onClick={() => handleResendInvite(invite.email)}
          disabled={resendingEmail === invite.email}
          className="text-xs px-3 py-1 rounded-full border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {resendingEmail === invite.email ? '⏳ Sending...' : '🔁 Resend'}
        </button>
      )}

      <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
        invite.status === 'accepted'
          ? 'bg-green-900 text-green-300'
          : invite.status === 'rejected'
          ? 'bg-red-900 text-red-300'
          : 'bg-yellow-900 text-yellow-300'
      }`}>
        {invite.status === 'pending'
          ? '⏳ Pending'
          : invite.status === 'accepted'
          ? '✅ Accepted'
          : '❌ Declined'}
      </span>
    </div>
  </div>
))}
                    </div>

                    {/* Summary line */}
                    <p className="text-xs text-gray-500 mt-3">
                      {team.pendingInvites.filter(i => i.status === 'accepted').length} accepted ·{' '}
                      {team.pendingInvites.filter(i => i.status === 'pending').length} pending ·{' '}
                      {team.pendingInvites.filter(i => i.status === 'rejected').length} declined
                    </p>
                  </div>
                )}

                {/* No invites sent */}
                {(!team.pendingInvites || team.pendingInvites.length === 0) && team.members?.length < team.maxMembers && (
                  <div className="mt-4 p-4 border border-dashed border-dark-500 rounded-lg text-center">
                    <p className="text-sm text-gray-400">
                      Your team has {team.maxMembers - team.members?.length} open slot{team.maxMembers - team.members?.length !== 1 ? 's' : ''}.
                    </p>
                    <button
                      onClick={() => navigate('/find-members')}
                      className="text-sm text-accent-500 hover:text-accent-400 font-semibold mt-1"
                    >
                      Find teammates →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Team Yet</h3>
                <p className="text-gray-300 mb-6">
                  Start by finding teammates or creating a team with friends.
                </p>
                <button onClick={() => navigate('/find-team')} className="btn-primary">
                  Find Teammates
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── IDEA TAB ── */}
        {activeTab === 'idea' && (
          <div className="space-y-6">
            {idea ? (
              <div className="card">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{idea.title}</h2>
                    <p className="text-gray-400 mt-2">
                      Validation Status:{' '}
                      <span className={`font-semibold ${idea.isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                        {idea.isApproved ? '✅ Approved' : '⏳ Under Review'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-accent-500">{idea.validationScore || idea.score}</p>
                    <p className="text-sm text-gray-400">/100</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Feasibility', value: idea.feasibilityScore },
                    { label: 'Originality', value: idea.originalityScore },
                    { label: 'Impact', value: idea.impactScore },
                    { label: 'Scope', value: idea.scopeScore },
                  ].map((s) => (
                    <div key={s.label} className="bg-dark-700 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white">{s.value || '—'}</p>
                      <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                    </div>
                  ))}
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
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Target Users</h3>
                    <p className="text-gray-300">{idea.targetUsers}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">AI Feedback</h3>
                    <div className="bg-dark-700 rounded-lg p-4 text-gray-300 italic">
                      {idea.feedback}
                    </div>
                  </div>

                  {idea.suggestions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Suggestions</h3>
                      <ul className="space-y-2">
                        {idea.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                            <span className="text-accent-500 mt-0.5">→</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Idea Validated Yet</h3>
                <p className="text-gray-300 mb-6">
                  Validate your idea with our AI-powered validator to unlock the build phase.
                </p>
                <button onClick={() => navigate('/validate-idea')} className="btn-primary">
                  Validate Idea
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {progress ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Build Phase Progress</h2>
                  <span className="text-2xl font-bold text-accent-500">{progress.percentage || 0}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-dark-700 rounded-full h-3 mb-8">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-primary-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress.percentage || 0}%` }}
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Idea Validated', completed: progress?.ideaValidated },
                    { title: 'Repository Created', completed: progress?.repoCreated },
                    { title: 'Prototype Started', completed: progress?.prototypeStarted },
                    { title: 'Mid-Checkpoint Submitted', completed: progress?.midCheckpoint },
                    { title: 'Final Submission', completed: progress?.finalSubmission },
                  ].map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 pb-4 border-b border-dark-600 last:border-b-0"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.completed ? 'bg-green-600 text-white' : 'bg-dark-700 text-gray-400'
                      }`}>
                        {milestone.completed
                          ? <CheckCircle size={20} />
                          : <AlertCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{milestone.title}</p>
                        <p className="text-sm text-gray-400">
                          {milestone.completed ? '✅ Completed' : '⏳ Pending'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        milestone.completed
                          ? 'bg-green-900 text-green-300'
                          : 'bg-dark-700 text-gray-500'
                      }`}>
                        {index + 1}/5
                      </span>
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, FileCheck, AlertCircle, BarChart3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ideas');
  const [ideas, setIdeas] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [ideasRes, teamsRes, submissionsRes] = await Promise.all([
          axios.get('/api/ideas/admin/all', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/teams/admin/all', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/submissions/admin/all', { headers }).catch(() => ({ data: [] })),
        ]);

        setIdeas(ideasRes.data || []);
        setTeams(teamsRes.data || []);
        setSubmissions(submissionsRes.data || []);

        // Calculate stats
        const approvedIdeas = (ideasRes.data || []).filter((i) => i.isApproved).length;
        const totalTeams = (teamsRes.data || []).length;
        const submittedProjects = (submissionsRes.data || []).filter((s) => s.status === 'submitted').length;

        setStats({
          totalIdeas: ideasRes.data?.length || 0,
          approvedIdeas,
          pendingReview: (ideasRes.data || []).filter((i) => !i.isApproved && i.isValidated).length,
          totalTeams,
          totalSubmissions: submissionsRes.data?.length || 0,
          submittedProjects,
          acceptedProjects: (submissionsRes.data || []).filter((s) => s.status === 'accepted').length,
        });
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleApproveIdea = async (ideaId, currentStatus) => {
    try {
      setProcessingId(ideaId);
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/ideas/admin/override/${ideaId}`,
        { approved: !currentStatus, reason: 'Admin approval' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIdeas(ideas.map((i) => (i._id === ideaId ? { ...i, isApproved: !currentStatus } : i)));
    } catch (error) {
      alert('Failed to update idea approval');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveSubmission = async (submissionId, newStatus) => {
    try {
      setProcessingId(submissionId);
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/submissions/admin/${submissionId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(submissions.map((s) => (s._id === submissionId ? { ...s, status: newStatus } : s)));
    } catch (error) {
      alert('Failed to update submission status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    try {
      setProcessingId(ideaId);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/ideas/admin/${ideaId}`, { headers: { Authorization: `Bearer ${token}` } });
      setIdeas(ideas.filter((i) => i._id !== ideaId));
    } catch (error) {
      alert('Failed to delete idea');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Admin <span className="gradient-accent">Dashboard</span>
          </h1>
          <p className="text-gray-300">Manage platform submissions, ideas, and team oversight</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Ideas</p>
                <h3 className="text-3xl font-bold text-white">{stats?.totalIdeas || 0}</h3>
              </div>
              <FileCheck className="text-accent-500" size={32} />
            </div>
            <p className="text-sm text-green-400">{stats?.approvedIdeas || 0} approved</p>
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Pending Review</p>
                <h3 className="text-3xl font-bold text-warning">{stats?.pendingReview || 0}</h3>
              </div>
              <AlertCircle className="text-warning" size={32} />
            </div>
            <p className="text-sm text-gray-400">Awaiting approval</p>
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Teams</p>
                <h3 className="text-3xl font-bold text-white">{stats?.totalTeams || 0}</h3>
              </div>
              <Users className="text-accent-500" size={32} />
            </div>
            <p className="text-sm text-gray-400">Active teams</p>
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Submissions</p>
                <h3 className="text-3xl font-bold text-success">{stats?.acceptedProjects || 0}</h3>
              </div>
              <BarChart3 className="text-success" size={32} />
            </div>
            <p className="text-sm text-gray-400">Accepted projects</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-600 overflow-x-auto">
          {[
            { id: 'ideas', label: 'Ideas' },
            { id: 'submissions', label: 'Submissions' },
            { id: 'teams', label: 'Teams' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-accent-500 border-b-2 border-accent-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-4">
            {ideas.length === 0 ? (
              <div className="card text-center py-12">
                <FileCheck size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300">No ideas found</p>
              </div>
            ) : (
              ideas.map((idea) => (
                <div key={idea._id} className="card">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            idea.isApproved
                              ? 'bg-green-900 text-green-300'
                              : 'bg-yellow-900 text-yellow-300'
                          }`}
                        >
                          {idea.isApproved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{idea.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded">
                          Score: {idea.validationScore}/100
                        </span>
                        <span className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded">
                          By: {idea.submittedBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveIdea(idea._id, idea.isApproved)}
                        disabled={processingId === idea._id}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                          idea.isApproved
                            ? 'bg-red-700 text-red-200 hover:bg-red-600'
                            : 'bg-green-700 text-green-200 hover:bg-green-600'
                        }`}
                      >
                        {processingId === idea._id ? '...' : idea.isApproved ? 'Revoke' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea._id)}
                        disabled={processingId === idea._id}
                        className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg font-semibold hover:bg-dark-600 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="card text-center py-12">
                <FileCheck size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300">No submissions found</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission._id} className="card">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{submission.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            submission.status === 'accepted'
                              ? 'bg-green-900 text-green-300'
                              : submission.status === 'rejected'
                              ? 'bg-red-900 text-red-300'
                              : 'bg-blue-900 text-blue-300'
                          }`}
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{submission.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-dark-700 text-accent-400 px-2 py-1 rounded hover:text-accent-300"
                        >
                          📦 GitHub
                        </a>
                        {submission.demoUrl && (
                          <a
                            href={submission.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-dark-700 text-accent-400 px-2 py-1 rounded hover:text-accent-300"
                          >
                            🌐 Demo
                          </a>
                        )}
                        <span className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded">
                          Team: {submission.team?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveSubmission(submission._id, 'accepted')}
                        disabled={processingId === submission._id || submission.status === 'accepted'}
                        className="px-4 py-2 bg-green-700 text-green-200 rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleApproveSubmission(submission._id, 'rejected')}
                        disabled={processingId === submission._id || submission.status === 'rejected'}
                        className="px-4 py-2 bg-red-700 text-red-200 rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {teams.length === 0 ? (
              <div className="card text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300">No teams found</p>
              </div>
            ) : (
              teams.map((team) => (
                <div key={team._id} className="card">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                      {team.description && (
                        <p className="text-gray-400 mb-3">{team.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded">
                          👥 {team.members?.length}/{team.maxMembers} members
                        </span>
                        <span className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded">
                          Lead: {team.leader?.name || 'Unknown'}
                        </span>
                        {team.idea && (
                          <span className="text-xs bg-accent-900 text-accent-300 px-2 py-1 rounded">
                            ✅ Idea: {team.idea.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        team.openToMembers ? 'bg-green-900 text-green-300' : 'bg-dark-700 text-gray-400'
                      }`}
                    >
                      {team.openToMembers ? '🟢 Open' : '🔒 Closed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

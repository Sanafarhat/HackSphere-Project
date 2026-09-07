import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Crown,
  FileCheck,
  Flag,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import axios from 'axios';

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [ideas, setIdeas] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    primaryColor: '#06b6d4',
    secondaryColor: '#7c3aed',
    registrationStart: '',
    hackingStart: '',
    submissionDeadline: '',
  });

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await axios.get('/api/events').catch(() => ({ data: [] }));
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const registrations = [
    { id: 'reg-1', name: 'Aarav Mehta', track: 'Build', status: 'approved', timestamp: '2m ago' },
    { id: 'reg-2', name: 'Sara Khan', track: 'AI', status: 'pending', timestamp: '11m ago' },
    { id: 'reg-3', name: 'Nina Patel', track: 'Design', status: 'review', timestamp: '26m ago' },
  ];

  const judges = [
    { id: 'judge-1', name: 'Dr. Rivera', specialty: 'Product Strategy', availability: 'Today' },
    { id: 'judge-2', name: 'Maya Singh', specialty: 'AI/ML', availability: 'Tomorrow' },
    { id: 'judge-3', name: 'Owen Chen', specialty: 'UX & Delivery', availability: 'Assigned' },
  ];

  const announcements = [
    { id: 'ann-1', title: 'Submission window closes at 6 PM', audience: 'All teams', status: 'published' },
    { id: 'ann-2', title: 'Judge briefing moved to 3 PM', audience: 'Judges', status: 'draft' },
  ];

  const evaluationStages = [
    { name: 'Queue intake', detail: 'Review submissions entering the pipeline' },
    { name: 'Rubric scoring', detail: 'Apply criteria with judge visibility' },
    { name: 'Calibration', detail: 'Normalize scores across panels' },
    { name: 'Publish results', detail: 'Lock results and notify teams' },
  ];

  // Redirect if not platform admin (keep legacy admin compatibility)
  useEffect(() => {
    if (user && !['admin', 'platformAdmin'].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch all admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [ideasRes, teamsRes, submissionsRes] = await Promise.all([
          axios.get('/api/ideas/admin/all').catch(() => ({ data: [] })),
          axios.get('/api/teams/admin/all').catch(() => ({ data: [] })),
          axios.get('/api/submissions/admin/all').catch(() => ({ data: [] })),
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
    fetchEvents();
  }, []);

  const handleFormChange = (key, value) => setForm((s) => ({ ...s, [key]: value }));

  const handleCreateEvent = async () => {
    try {
      setEventsLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        registrationStart: form.registrationStart || null,
        hackingStart: form.hackingStart || null,
        submissionDeadline: form.submissionDeadline || null,
      };
      await axios.post('/api/events', payload);
      setShowCreate(false);
      setForm({ title: '', description: '', primaryColor: '#06b6d4', secondaryColor: '#7c3aed', registrationStart: '', hackingStart: '', submissionDeadline: '' });
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleActivateEvent = async (eventId) => {
    if (!window.confirm('Activate this event and deactivate others?')) return;
    try {
      await axios.post(`/api/events/${eventId}/activate`);
      await fetchEvents();
    } catch (err) {
      alert('Failed to activate event');
    }
  };

  const handleUpdateEvent = async (eventId, patch) => {
    try {
      await axios.patch(`/api/events/${eventId}`, patch);
      await fetchEvents();
    } catch (err) {
      alert('Failed to update event');
    }
  };

  const totalRegistrations = registrations.length + (stats?.totalTeams || 0);
  const totalJudges = judges.length;
  const acceptedSubmissions = submissions.filter((submission) => submission.status === 'accepted').length;
  const activeEvents = events.filter((event) => event.status === 'active').length;

  const controlSections = [
    { id: 'overview', label: 'Overview', icon: ShieldCheck },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'registrations', label: 'Registrations', icon: ClipboardList },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'judges', label: 'Judges', icon: Crown },
    { id: 'submissions', label: 'Submissions', icon: FileCheck },
    { id: 'evaluation', label: 'Evaluation', icon: Sparkles },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleApproveIdea = async (ideaId, currentStatus) => {
    try {
      setProcessingId(ideaId);
      await axios.put(`/api/ideas/admin/override/${ideaId}`, { approved: !currentStatus, reason: 'Admin approval' });
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
      await axios.patch(`/api/submissions/admin/${submissionId}`, { status: newStatus });
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
      await axios.delete(`/api/ideas/admin/${ideaId}`);
      setIdeas(ideas.filter((i) => i._id !== ideaId));
    } catch (error) {
      alert('Failed to delete idea');
    } finally {
      setProcessingId(null);
    }
  };

  const renderSection = () => {
    if (loading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-mutedForeground">Loading admin control center...</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="editorial-card">
              <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Active events</p>
              <h3 className="text-3xl font-bold text-foreground">{activeEvents}</h3>
              <p className="text-sm text-mutedForeground mt-2">Event lifecycle visibility</p>
            </div>
            <div className="editorial-card">
              <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Registrations</p>
              <h3 className="text-3xl font-bold text-foreground">{totalRegistrations}</h3>
              <p className="text-sm text-mutedForeground mt-2">Intake across cohorts</p>
            </div>
            <div className="editorial-card">
              <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Judges</p>
              <h3 className="text-3xl font-bold text-foreground">{totalJudges}</h3>
              <p className="text-sm text-mutedForeground mt-2">Assigned and available reviewers</p>
            </div>
            <div className="editorial-card">
              <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Accepted results</p>
              <h3 className="text-3xl font-bold text-foreground">{acceptedSubmissions}</h3>
              <p className="text-sm text-mutedForeground mt-2">Published outcomes</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="editorial-card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm uppercase tracking-wider text-mutedForeground">Operational priorities</p>
                  <h2 className="text-2xl font-bold text-foreground">Control center status</h2>
                </div>
                <ShieldCheck className="text-accent-500" size={28} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {controlSections.slice(1).map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className="text-left rounded-2xl border border-foreground/10 bg-white p-4 hover:border-accent-500/60 hover:bg-light-800 border-2 border-foreground/10 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="text-accent-400" size={22} />
                        <Plus className="text-gray-500" size={18} />
                      </div>
                      <h3 className="text-foreground font-semibold mb-1">{section.label}</h3>
                      <p className="text-sm text-mutedForeground">Open the {section.label.toLowerCase()} workspace</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="editorial-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Fast workflow</h2>
                <Sparkles className="text-warning" size={22} />
              </div>
              <div className="space-y-3 text-sm text-mutedForeground">
                <div className="rounded-xl bg-white border border-foreground/10/70 p-3">1. Review live event state</div>
                <div className="rounded-xl bg-white border border-foreground/10/70 p-3">2. Triage registrations and teams</div>
                <div className="rounded-xl bg-white border border-foreground/10/70 p-3">3. Assign judges and evaluate submissions</div>
                <div className="rounded-xl bg-white border border-foreground/10/70 p-3">4. Publish results and announcements</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'events') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Events</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate((s) => !s)} className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> {showCreate ? 'Close' : 'Create event'}
              </button>
            </div>
          </div>

          {showCreate && (
            <div className="editorial-card">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-mutedForeground mb-1">Event Title</label>
                  <input value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} placeholder="E.g. Spring Hackathon 2026" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-mutedForeground mb-1">Primary Color</label>
                  <input value={form.primaryColor} onChange={(e) => handleFormChange('primaryColor', e.target.value)} type="color" className="w-full h-[52px] p-1 border-2 border-foreground" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-mutedForeground mb-1">Short Description</label>
                  <textarea value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Description..." className="textarea-field" />
                </div>
                <div>
                  <label className="block text-sm text-mutedForeground mb-1">Registration Start Date</label>
                  <input value={form.registrationStart} onChange={(e) => handleFormChange('registrationStart', e.target.value)} type="datetime-local" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-mutedForeground mb-1">Hacking Start Date</label>
                  <input value={form.hackingStart} onChange={(e) => handleFormChange('hackingStart', e.target.value)} type="datetime-local" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-mutedForeground mb-1">Submission Deadline</label>
                  <input value={form.submissionDeadline} onChange={(e) => handleFormChange('submissionDeadline', e.target.value)} type="datetime-local" className="input-field" />
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-mutedForeground mb-2">Note: All dates are required to create an event.</p>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowCreate(false)} className="btn-outline !py-3">Cancel</button>
                  <button onClick={handleCreateEvent} disabled={eventsLoading} className="btn-primary !py-3">Create Event</button>
                </div>
              </div>
            </div>
          )}

          {eventsLoading ? (
            <div className="editorial-card text-center py-8">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="editorial-card text-center py-12">No events found</div>
          ) : (
            events.map((event) => (
              <div key={event._id || event.id} className="editorial-card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{event.title || event.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${event.isActive || event.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                        {event.currentPhase || event.phase || (event.isActive ? 'Active' : 'Draft')}
                      </span>
                    </div>
                    {event.description && <p className="text-mutedForeground">{event.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      const newTitle = window.prompt('Edit event title', event.title || event.name);
                      if (newTitle) await handleUpdateEvent(event._id || event.id, { title: newTitle });
                    }} className="px-4 py-2 rounded-lg bg-light-800 text-gray-200 hover:bg-dark-600 transition">Edit</button>
                    <button onClick={() => handleActivateEvent(event._id || event.id)} className="px-4 py-2 rounded-lg bg-accent-700 text-foreground hover:bg-accent-600 transition">{(event.isActive || event.status === 'active') ? 'Active' : 'Activate'}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (activeTab === 'registrations') {
      return (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div key={registration.id} className="editorial-card flex items-center justify-between gap-4">
              <div>
                <h3 className="text-foreground font-semibold">{registration.name}</h3>
                <p className="text-sm text-mutedForeground">Track: {registration.track} | {registration.timestamp}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${registration.status === 'approved' ? 'bg-green-900 text-green-300' : registration.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'}`}>
                {registration.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'teams') {
      return (
        <div className="space-y-4">
          {teams.length === 0 ? (
            <div className="editorial-card text-center py-12">
              <Users size={48} className="mx-auto text-mutedForeground mb-4" />
              <p className="text-mutedForeground">No teams found</p>
            </div>
          ) : (
            teams.map((team) => (
              <div key={team._id} className="editorial-card">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{team.name}</h3>
                    {team.description && <p className="text-mutedForeground mb-3">{team.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-light-800 text-mutedForeground px-2 py-1 rounded">👥 {team.members?.length}/{team.maxMembers} members</span>
                      <span className="text-xs bg-light-800 text-mutedForeground px-2 py-1 rounded">Lead: {team.leader?.name || 'Unknown'}</span>
                      {team.idea && <span className="text-xs bg-accent-900 text-accent-300 px-2 py-1 rounded">Idea: {team.idea.title}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${team.openToMembers ? 'bg-green-900 text-green-300' : 'bg-light-800 text-mutedForeground'}`}>
                    {team.openToMembers ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (activeTab === 'judges') {
      return (
        <div className="space-y-4">
          {judges.map((judge) => (
            <div key={judge.id} className="editorial-card flex items-center justify-between gap-4">
              <div>
                <h3 className="text-foreground font-semibold">{judge.name}</h3>
                <p className="text-sm text-mutedForeground">{judge.specialty}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-900 text-blue-300">{judge.availability}</span>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'submissions') {
      return (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="editorial-card text-center py-12">
              <FileCheck size={48} className="mx-auto text-mutedForeground mb-4" />
              <p className="text-mutedForeground">No submissions found</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <div key={submission._id} className="editorial-card">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{submission.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${submission.status === 'accepted' ? 'bg-green-900 text-green-300' : submission.status === 'rejected' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-mutedForeground mb-3">{submission.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-light-800 text-accent-400 px-2 py-1 rounded hover:text-accent-300">
                        📦 GitHub
                      </a>
                      {submission.demoUrl && (
                        <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-light-800 text-accent-400 px-2 py-1 rounded hover:text-accent-300">
                          🌐 Demo
                        </a>
                      )}
                      <span className="text-xs bg-light-800 text-mutedForeground px-2 py-1 rounded">Team: {submission.team?.name || 'Unknown'}</span>
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
      );
    }

    if (activeTab === 'evaluation') {
      return (
        <div className="grid lg:grid-cols-2 gap-4">
          {evaluationStages.map((stage) => (
            <div key={stage.name} className="editorial-card">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-accent-400" size={20} />
                <h3 className="text-foreground font-semibold">{stage.name}</h3>
              </div>
              <p className="text-mutedForeground text-sm">{stage.detail}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'results') {
      return (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="editorial-card">
            <p className="text-sm uppercase tracking-wider text-mutedForeground mb-2">Accepted</p>
            <h3 className="text-3xl font-bold text-foreground">{stats?.acceptedProjects || 0}</h3>
          </div>
          <div className="editorial-card">
            <p className="text-sm uppercase tracking-wider text-mutedForeground mb-2">Submitted</p>
            <h3 className="text-3xl font-bold text-foreground">{stats?.submittedProjects || 0}</h3>
          </div>
          <div className="editorial-card">
            <p className="text-sm uppercase tracking-wider text-mutedForeground mb-2">Pending review</p>
            <h3 className="text-3xl font-bold text-foreground">{stats?.pendingReview || 0}</h3>
          </div>
        </div>
      );
    }

    if (activeTab === 'announcements') {
      return (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="editorial-card flex items-center justify-between gap-4">
              <div>
                <h3 className="text-foreground font-semibold">{announcement.title}</h3>
                <p className="text-sm text-mutedForeground">Audience: {announcement.audience}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${announcement.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                {announcement.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'analytics') {
      return (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="editorial-card">
            <p className="text-sm uppercase tracking-wider text-mutedForeground mb-2">Ideas tracked</p>
            <h3 className="text-3xl font-bold text-foreground">{stats?.totalIdeas || 0}</h3>
            <p className="text-sm text-green-400 mt-2">{stats?.approvedIdeas || 0} approved</p>
          </div>
          <div className="editorial-card">
            <p className="text-sm uppercase tracking-wider text-mutedForeground mb-2">Teams onboarded</p>
            <h3 className="text-3xl font-bold text-foreground">{stats?.totalTeams || 0}</h3>
            <p className="text-sm text-mutedForeground mt-2">Operational team count</p>
          </div>
          <div className="editorial-card">
            <p className="text-sm uppercase tracking-wider text-mutedForeground mb-2">Submission throughput</p>
            <h3 className="text-3xl font-bold text-foreground">{stats?.totalSubmissions || 0}</h3>
            <p className="text-sm text-mutedForeground mt-2">Acceptance and review pipeline</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-accent-400 mb-2">Admin control center</p>
              <h1 className="text-4xl font-display font-bold mb-3 text-foreground">
                Operational <span className="gradient-accent">Dashboard</span>
              </h1>
              <p className="text-mutedForeground max-w-3xl">
                Manage events, registrations, teams, judges, submissions, evaluation workflows, results, announcements, and platform analytics from one secure workspace.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setActiveTab('events'); setShowCreate(true); }} className="btn-primary inline-flex items-center gap-2">
                <Plus size={18} /> Create event
              </button>
              <button className="px-5 py-3 rounded-xl border-2 border-foreground/10 text-foreground font-bold hover:bg-light-800 transition inline-flex items-center gap-2">
                <Users size={18} /> Assign judge
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="editorial-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Ideas</p>
                <h3 className="text-3xl font-bold text-foreground">{stats?.totalIdeas || 0}</h3>
              </div>
              <FileCheck className="text-accent-500" size={32} />
            </div>
            <p className="text-sm text-green-400">{stats?.approvedIdeas || 0} approved</p>
          </div>

          <div className="editorial-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Pending review</p>
                <h3 className="text-3xl font-bold text-warning">{stats?.pendingReview || 0}</h3>
              </div>
              <AlertCircle className="text-warning" size={32} />
            </div>
            <p className="text-sm text-mutedForeground">Awaiting approval</p>
          </div>

          <div className="editorial-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Teams</p>
                <h3 className="text-3xl font-bold text-foreground">{stats?.totalTeams || 0}</h3>
              </div>
              <Users className="text-accent-500" size={32} />
            </div>
            <p className="text-sm text-mutedForeground">Active teams</p>
          </div>

          <div className="editorial-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-mutedForeground text-sm uppercase tracking-wider mb-2">Results</p>
                <h3 className="text-3xl font-bold text-success">{stats?.acceptedProjects || 0}</h3>
              </div>
              <BarChart3 className="text-success" size={32} />
            </div>
            <p className="text-sm text-mutedForeground">Accepted projects</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8 border-b border-foreground/10 overflow-x-auto pb-1">
          {controlSections.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold capitalize transition-all whitespace-nowrap inline-flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-accent-500 border-b-2 border-accent-500'
                    : 'text-mutedForeground hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {renderSection()}
      </div>
    </div>
  );
};

export default AdminPage;

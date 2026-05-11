import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubmissionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [idea, setIdea] = useState(null);
  const [progress, setProgress] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', githubUrl: '', demoUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [t, i, p, s] = await Promise.all([
        axios.get('/api/teams/my-team'),
        axios.get('/api/ideas/my-idea'),
        axios.get('/api/progress/my-progress'),
        axios.get('/api/submissions/my'),
      ]);

      setTeam(t.data);
      setIdea(i.data || null);
      setProgress(p.data || null);
      setSubmission(s.data || null);

      if (s.data) {
        setForm({
          title: s.data.title || '',
          description: s.data.description || '',
          githubUrl: s.data.githubUrl || '',
          demoUrl: s.data.demoUrl || '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isTeamLead = team && user && team.leader && team.leader._id === user._id;
  const membersCount = team?.members?.length || 0;
  const ideaValidated = idea?.isValidated || false;

  const requirements = [
    { label: 'You are team leader', ok: !!isTeamLead },
    { label: 'Idea validated by AI', ok: !!ideaValidated },
    { label: 'Minimum team members (4)', ok: membersCount >= 4 },
  ];

  const allOk = requirements.every(r => r.ok) && form.title && form.description && form.githubUrl;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');
    if (!allOk) return setError('Please meet all requirements before submitting');

    try {
      setLoading(true);
      const res = await axios.post('/api/submissions/submit', form);
      setSubmission(res.data.submission);
      setSuccessMsg('Project submitted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white">Final Project Submission</h1>
          <p className="text-gray-400">Submit your final project when you're ready.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="glass p-6 border border-dark-600">
            <h3 className="text-lg font-semibold text-white mb-3">Submission Status</h3>
            {submission ? (
              <div className="text-gray-300">
                <p className="font-semibold">Status: <span className="text-accent-500">{submission.status}</span></p>
                <p className="text-sm mt-2">Submitted at: {new Date(submission.submittedAt).toLocaleString()}</p>
                <p className="mt-3">GitHub: <a className="text-accent-400" href={submission.githubUrl} target="_blank" rel="noreferrer">{submission.githubUrl}</a></p>
                {submission.demoUrl && <p className="mt-2">Demo: <a className="text-accent-400" href={submission.demoUrl} target="_blank" rel="noreferrer">{submission.demoUrl}</a></p>}
              </div>
            ) : (
              <p className="text-gray-400">No submission yet. Complete requirements and submit when ready.</p>
            )}
          </div>

          <div className="glass p-6 border border-dark-600">
            <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
            <ul className="space-y-2 text-gray-300">
              {requirements.map((r, idx) => (
                <li key={idx} className={r.ok ? 'text-green-300' : 'text-gray-500'}>
                  {r.ok ? '✓' : '✖'} {r.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass p-6 border border-dark-600">
            <h3 className="text-lg font-semibold text-white mb-3">Submission Form</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Project Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Project Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="textarea-field" rows={4} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">GitHub URL</label>
                <input name="githubUrl" value={form.githubUrl} onChange={handleChange} className="input-field" placeholder="https://github.com/your/repo" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Demo Video URL (optional)</label>
                <input name="demoUrl" value={form.demoUrl} onChange={handleChange} className="input-field" placeholder="https://youtu.be/..." />
              </div>

              {error && <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-3">{error}</div>}
              {successMsg && <div className="bg-green-900/20 border border-green-800 text-green-300 rounded-lg p-3">{successMsg}</div>}

              <div className="flex gap-3">
                <button onClick={handleSubmit} disabled={!allOk || loading} className="btn-primary flex-1 py-3 disabled:opacity-50">
                  {loading ? 'Submitting...' : (submission ? 'Update Submission' : 'Submit Project')}
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary py-3">Back</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;

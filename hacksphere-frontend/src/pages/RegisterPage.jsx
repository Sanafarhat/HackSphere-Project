import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [teamEmailInput, setTeamEmailInput] = useState(''); // ✅ controlled input
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: '',
    skills: '',
    hasTeam: null,
    hasIdea: null,
    teamName: '',
    teamEmails: [],
    idea: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // ✅ Fixed: uses controlled state instead of getElementById
  const handleAddTeamEmail = () => {
    const email = teamEmailInput.trim();
    if (!email) return;
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.teamEmails.includes(email)) {
      setError('This email has already been added');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      teamEmails: [...prev.teamEmails, email],
    }));
    setTeamEmailInput('');
    setError('');
  };

  const handleRemoveTeamEmail = (index) => {
    setFormData((prev) => ({
      ...prev,
      teamEmails: prev.teamEmails.filter((_, i) => i !== index),
    }));
  };

  const handleTeamChoice = (hasTeam, hasIdea) => {
    setFormData((prev) => ({ ...prev, hasTeam, hasIdea }));
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate passwords
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Step 1 — Register user (sets axios auth header automatically)
      const userData = await register(
        formData.email,
        formData.password,
        formData.name,
        'student'
      );

      // Step 2 — Create team if has team
      if (formData.hasTeam) {
        if (!formData.teamName.trim()) {
          setError('Please enter a team name');
          setLoading(false);
          return;
        }

        // Capture any unsaved email still in the input
        const finalEmails = [...formData.teamEmails];
        if (teamEmailInput.trim()) {
          finalEmails.push(teamEmailInput.trim());
        }

        const token = localStorage.getItem('token');
await axios.post('/api/teams/create', {
  name: formData.teamName,
  description: '',
  memberEmails: finalEmails,
  openToMembers: false,
  maxMembers: 4,
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
      }

      // Step 3 — Store idea if has idea but no team
      if (!formData.hasTeam && formData.hasIdea && formData.idea) {
        sessionStorage.setItem('pendingIdea', JSON.stringify({
          title: formData.idea,
          userId: userData._id,
        }));
      }

      // Step 4 — Navigate to dashboard
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1: Personal Info ──
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-lg">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h1 className="text-3xl font-display font-bold mb-2 text-white">Join HackSphere</h1>
            <p className="text-gray-300 mb-8">Step 1 of 4 — Your Basic Info</p>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="you@college.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="ME">Mechanical</option>
                  <option value="EE">Electrical</option>
                  <option value="CE">Civil</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="React, Python, UI Design"
                />
              </div>

              {error && (
                <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">{error}</div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.department || !formData.year) {
                    setError('Please fill in all required fields');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className="w-full btn-ghost mt-4 flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: Password ──
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-lg">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h1 className="text-3xl font-display font-bold mb-2 text-white">Set Your Password</h1>
            <p className="text-gray-300 mb-8">Step 2 of 4 — Secure Your Account</p>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-danger text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">{error}</div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.password || !formData.confirmPassword) {
                      setError('Please fill in both password fields');
                      return;
                    }
                    if (formData.password !== formData.confirmPassword) {
                      setError('Passwords do not match');
                      return;
                    }
                    if (formData.password.length < 6) {
                      setError('Password must be at least 6 characters');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: Team Choice ──
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-2xl">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h1 className="text-3xl font-display font-bold mb-2 text-white">Your Team & Idea</h1>
            <p className="text-gray-300 mb-12">Step 3 of 4 — Choose Your Path</p>

            <div className="space-y-4">
              <div
                onClick={() => handleTeamChoice(true, null)}
                className="card cursor-pointer hover:border-accent-500 p-8 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-400 flex-shrink-0">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">I have a team</h3>
                    <p className="text-gray-300">I already have teammates. I'll invite them via email to join my team.</p>
                  </div>
                  <ArrowRight className="text-accent-500 flex-shrink-0" size={24} />
                </div>
              </div>

              <div
                onClick={() => handleTeamChoice(false, false)}
                className="card cursor-pointer hover:border-accent-500 p-8 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-400 flex-shrink-0">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">No team, No idea</h3>
                    <p className="text-gray-300">AI will recommend open teams looking for members based on your skills.</p>
                  </div>
                  <ArrowRight className="text-accent-500 flex-shrink-0" size={24} />
                </div>
              </div>

              <div
                onClick={() => handleTeamChoice(false, true)}
                className="card cursor-pointer hover:border-accent-500 p-8 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-400 flex-shrink-0">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">No team, but I have an idea</h3>
                    <p className="text-gray-300">AI will recommend solo students to collaborate with you on your idea.</p>
                  </div>
                  <ArrowRight className="text-accent-500 flex-shrink-0" size={24} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full btn-ghost mt-8 flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 4: Team Details ──
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="w-full max-w-lg">
          <div className="glass rounded-2xl p-8 border border-dark-600">

            {/* PATH 1: Has Team */}
            {formData.hasTeam && (
              <>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">Invite Your Team</h1>
                <p className="text-gray-300 mb-8">Step 4 of 4 — Add Team Members</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">Team Name</label>
                    <input
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="The Innovators"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Team Members Email
                    </label>
                    {/* ✅ Controlled input */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="email"
                        className="input-field"
                        placeholder="teammate@college.edu"
                        value={teamEmailInput}
                        onChange={(e) => setTeamEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTeamEmail();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTeamEmail}
                        className="btn-secondary px-4 whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    {/* Email tags */}
                    {formData.teamEmails.length > 0 && (
                      <div className="space-y-2">
                        {formData.teamEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-dark-700 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs font-bold">
                                {email.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-300">{email}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamEmail(index)}
                              className="text-gray-500 hover:text-danger transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.teamEmails.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Add your teammates' emails above. They'll receive an invite link.
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">{error}</div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft size={20} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>{loading ? 'Creating...' : 'Complete Registration'}</span>
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* PATH 2: No Team, No Idea */}
            {!formData.hasTeam && !formData.hasIdea && (
              <>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">Ready to Find a Team</h1>
                <p className="text-gray-300 mb-8">Step 4 of 4 — Complete Setup</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
                    <p className="text-primary-300 text-sm">
                      💡 After registration, AI will recommend open teams that match your skills. You can browse and send join requests.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">{error}</div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft size={20} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>{loading ? 'Creating...' : 'Complete Registration'}</span>
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* PATH 3: No Team, Has Idea */}
            {!formData.hasTeam && formData.hasIdea && (
              <>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">Tell Us Your Idea</h1>
                <p className="text-gray-300 mb-8">Step 4 of 4 — Share Your Vision</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">Your Hackathon Idea</label>
                    <textarea
                      name="idea"
                      value={formData.idea}
                      onChange={handleInputChange}
                      className="textarea-field"
                      placeholder="Describe your project idea, the problem it solves, and how it works..."
                      rows="5"
                      required
                    />
                  </div>

                  <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
                    <p className="text-primary-300 text-sm">
                      💡 AI will recommend solo students with complementary skills to collaborate with you on your idea.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">{error}</div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft size={20} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>{loading ? 'Creating...' : 'Complete Registration'}</span>
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    );
  }
};

export default RegisterPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleAddTeamEmail = () => {
    const emailInput = document.getElementById('teamEmail');
    if (emailInput.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        teamEmails: [...prev.teamEmails, emailInput.value.trim()],
      }));
      emailInput.value = '';
    }
  };

  const handleRemoveTeamEmail = (index) => {
    setFormData((prev) => ({
      ...prev,
      teamEmails: prev.teamEmails.filter((_, i) => i !== index),
    }));
  };

  const handleTeamChoice = (hasTeam, hasIdea) => {
    setFormData((prev) => ({
      ...prev,
      hasTeam,
      hasIdea,
    }));
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Register user
      const userData = await register(formData.email, formData.password, formData.name, 'student');

      // Create team if applicable
      let teamData = null;
      if (formData.hasTeam) {
        const response = await axios.post('/api/teams/create', {
          name: formData.teamName,
          memberEmails: formData.teamEmails,
          userId: userData._id,
        });
        teamData = response.data;
      } else if (formData.hasIdea) {
        // Store idea in context/state for next step
        sessionStorage.setItem('pendingIdea', JSON.stringify({
          title: formData.idea,
          userId: userData._id,
        }));
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Personal Info
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-lg">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h1 className="text-3xl font-display font-bold mb-2 text-white">
              Join HackSphere
            </h1>
            <p className="text-gray-300 mb-8">Step 1 of 3 — Your Basic Info</p>

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
                <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
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

  // Step 2: Password Setup
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-lg">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h1 className="text-3xl font-display font-bold mb-2 text-white">
              Set Your Password
            </h1>
            <p className="text-gray-300 mb-8">Step 2 of 3 — Secure Your Account</p>

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
              </div>

              {error && (
                <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">
                  {error}
                </div>
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
                  onClick={() => setStep(3)}
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

  // Step 3: Team Choice
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full max-w-2xl">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h1 className="text-3xl font-display font-bold mb-2 text-white">
              Your Team & Idea
            </h1>
            <p className="text-gray-300 mb-12">Step 3 of 3 — Choose Your Path</p>

            <div className="space-y-4">
              {/* Path 1: Has Team */}
              <div
                onClick={() => handleTeamChoice(true, null)}
                className="card cursor-pointer hover:border-accent-500 p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-400">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">I have a team</h3>
                    <p className="text-gray-300">
                      I already have teammates selected. I'll invite them to join my team after registration.
                    </p>
                  </div>
                  <ArrowRight className="text-accent-500" size={24} />
                </div>
              </div>

              {/* Path 2: No Team, No Idea */}
              <div
                onClick={() => handleTeamChoice(false, false)}
                className="card cursor-pointer hover:border-accent-500 p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-400">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">No team, No idea</h3>
                    <p className="text-gray-300">
                      I'm looking to join an existing team that's open to new members. AI will recommend teams based on skill compatibility.
                    </p>
                  </div>
                  <ArrowRight className="text-accent-500" size={24} />
                </div>
              </div>

              {/* Path 3: No Team, Has Idea */}
              <div
                onClick={() => handleTeamChoice(false, true)}
                className="card cursor-pointer hover:border-accent-500 p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-400">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">No team, but I have an idea</h3>
                    <p className="text-gray-300">
                      I have a great idea but need teammates. AI will recommend solo students to join my team.
                    </p>
                  </div>
                  <ArrowRight className="text-accent-500" size={24} />
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

  // Step 4: Team Details Based on Path
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="w-full max-w-lg">
          <div className="glass rounded-2xl p-8 border border-dark-600">
            {formData.hasTeam && (
              <>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">
                  Invite Your Team
                </h1>
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
                    <label className="block text-sm font-semibold text-gray-200 mb-2">Team Members Email</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="email"
                        id="teamEmail"
                        className="input-field"
                        placeholder="teammate@college.edu"
                      />
                      <button
                        type="button"
                        onClick={handleAddTeamEmail}
                        className="btn-secondary px-4"
                      >
                        Add
                      </button>
                    </div>

                    {formData.teamEmails.length > 0 && (
                      <div className="space-y-2">
                        {formData.teamEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-dark-700 rounded-lg p-3"
                          >
                            <span className="text-sm text-gray-300">{email}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamEmail(index)}
                              className="text-danger hover:text-danger text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">
                      {error}
                    </div>
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

            {!formData.hasTeam && !formData.hasIdea && (
              <>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">
                  Ready to Find a Team
                </h1>
                <p className="text-gray-300 mb-8">Step 4 of 4 — Complete Setup</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
                    <p className="text-primary-300 text-sm">
                      💡 AI will recommend open teams matching your skills after you complete registration.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">
                      {error}
                    </div>
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

            {!formData.hasTeam && formData.hasIdea && (
              <>
                <h1 className="text-3xl font-display font-bold mb-2 text-white">
                  Tell Us Your Idea
                </h1>
                <p className="text-gray-300 mb-8">Step 4 of 4 — Share Your Vision</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">Your Hackathon Idea</label>
                    <textarea
                      name="idea"
                      value={formData.idea}
                      onChange={handleInputChange}
                      className="textarea-field"
                      placeholder="Describe your project idea, problem it solves, and how it works..."
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
                    <p className="text-primary-300 text-sm">
                      💡 AI will recommend solo students to join your team based on skill compatibility.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4 text-sm">
                      {error}
                    </div>
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

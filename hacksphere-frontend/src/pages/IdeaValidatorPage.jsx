import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader } from 'lucide-react';
import axios from 'axios';

export const IdeaValidatorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    techStack: '',
    targetUsers: '',
  });
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExistingIdea();
  }, []);

  const fetchExistingIdea = async () => {
    try {
      const response = await axios.get('/api/ideas/my-idea');
      if (response.data) {
        setFormData({
          title: response.data.title || '',
          description: response.data.description || '',
          problemStatement: response.data.problemStatement || '',
          techStack: response.data.techStack || '',
          targetUsers: response.data.targetUsers || '',
        });
        setValidation(response.data);
        setStep(2);
      }
    } catch (error) {
      console.error('No existing idea found');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleValidateIdea = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/api/ideas/validate', {
        ...formData,
      });

      setValidation(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIdea = async () => {
    try {
      setLoading(true);
      await axios.post('/api/ideas/submit', {
        ...formData,
        validationScore: validation.score,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Sparkles className="text-accent-500" size={40} />
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                Idea <span className="gradient-accent">Validator</span>
              </h1>
              <p className="text-gray-300">
                Get AI-powered feedback on your hackathon idea and improve it before building.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Submit Idea */}
        {step === 1 && (
          <div className="glass rounded-2xl p-8 border border-dark-600">
            <h2 className="text-2xl font-bold text-white mb-6">Submit Your Idea</h2>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., AI-powered Campus Waste Tracker"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea-field"
                  placeholder="Describe your project in detail. What does it do? How does it work?"
                  rows={5}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Problem Statement
                </label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  className="textarea-field"
                  placeholder="What problem are you solving? Who is affected?"
                  rows={4}
                  required
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    name="techStack"
                    value={formData.techStack}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="React, Node.js, MongoDB, Python"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Target Users
                  </label>
                  <input
                    type="text"
                    name="targetUsers"
                    value={formData.targetUsers}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., College students, Campus staff"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-4">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleValidateIdea}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Validating with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Get AI Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Validation Results */}
        {step === 2 && validation && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="glass rounded-2xl p-8 border border-accent-500/50">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Validation Complete
                  </h2>
                  <p className="text-gray-300">
                    {validation.score >= 75
                      ? '✓ Your idea is approved and ready to build!'
                      : 'Consider the feedback below to improve your idea before building.'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-display font-bold gradient-accent mb-2">
                    {validation.score}
                  </div>
                  <p className="text-sm text-gray-400">/100</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-dark-600">
                {[
                  { label: 'Feasibility', score: validation.feasibilityScore },
                  { label: 'Originality', score: validation.originalityScore },
                  { label: 'Impact', score: validation.impactScore },
                  { label: 'Scope', score: validation.scopeScore },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-300 font-semibold">{item.label}</p>
                      <p className="text-accent-500 font-bold">{item.score}/100</p>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="glass rounded-2xl p-8 border border-dark-600">
              <h3 className="text-xl font-bold text-white mb-4">AI Feedback</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {validation.feedback}
              </p>

              <div>
                <h4 className="text-lg font-bold text-white mb-4">Suggestions for Improvement</h4>
                <ul className="space-y-3">
                  {validation.suggestions?.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-gray-300"
                    >
                      <span className="text-accent-500 font-bold">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {validation.score < 75 && (
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary py-4"
                >
                  Revise Idea
                </button>
              )}
              <button
                onClick={handleSubmitIdea}
                disabled={loading}
                className="flex-1 btn-primary py-4"
              >
                {loading ? 'Submitting...' : 'Proceed to Build Phase'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaValidatorPage;

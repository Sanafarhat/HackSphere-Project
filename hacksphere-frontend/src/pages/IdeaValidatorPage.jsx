import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader, Lightbulb, Target, AlertCircle, Rocket } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export const IdeaValidatorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    techStack: '',
    targetUsers: '',
  });
  const [team, setTeam] = useState(null);
  const [isTeamLead, setIsTeamLead] = useState(false);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revalidateConfirmed, setRevalidateConfirmed] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchTeam();
    fetchExistingIdea();
  }, [user]);

  const fetchTeam = async () => {
    try {
      const response = await axios.get('/api/teams/my-team');
      setTeam(response.data);
      setIsTeamLead(response.data?.leader?._id === user?._id);
    } catch (error) {
      console.error('Failed to load team info');
    }
  };

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
        const revalidateRequested = searchParams.get('revalidate') === 'true';
        if (!revalidateRequested) {
          setStep(2);
        }
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
    if (searchParams.get('revalidate') === 'true' && validation && !revalidateConfirmed) {
      setError('Please confirm that you want to delete the previous idea before revalidating.');
      return;
    }

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

  const handleStartRevalidate = async () => {
    try {
      setLoading(true);
      setError('');
      await axios.post('/api/ideas/revalidate');
      setValidation(null);
      setStep(1);
      setRevalidateConfirmed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start revalidation');
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
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-mutedForeground hover:text-foreground mb-6 transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Sparkles className="text-accent" size={40} />
            <div>
              <h1 className="text-4xl font-display font-black text-foreground uppercase tracking-tight">
                Idea <span className="text-accent">Validator</span>
              </h1>
              <p className="text-mutedForeground font-semibold mt-1">
                Get AI-powered feedback on your hackathon idea and improve it before building.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step 1: Submit Idea */}
        {step === 1 && (
          <div className="editorial-card w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">Submit Your Idea</h2>

            {!team ? (
              <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-200 rounded-lg p-6 mb-6">
                <p className="font-semibold">Team required</p>
                <p className="text-sm text-mutedForeground font-semibold mt-2">
                  Only a team leader can run idea validation. Join or create a team first.
                </p>
              </div>
            ) : !isTeamLead ? (
              <div className="bg-red-900/20 border border-red-700 text-red-200 rounded-lg p-6 mb-6">
                <p className="font-semibold">Access restricted</p>
                <p className="text-sm text-mutedForeground font-semibold mt-2">
                  Only the team leader <strong>{team?.leader?.name || 'leader'}</strong> can validate the idea.
                  Please ask them to run validation for your team.
                </p>
              </div>
            ) : null}

            {searchParams.get('revalidate') === 'true' && validation && !revalidateConfirmed && (
              <div className="bg-red-900/20 border border-red-700 text-red-200 rounded-lg p-6 mb-6">
                <p className="font-semibold">Confirm Revalidation</p>
                <p className="text-sm text-mutedForeground font-semibold mt-2">
                  Revalidating will delete your current idea and its existing validation results.
                  Once you proceed, you can enter a new idea and validate again.
                </p>
                <button
                  type="button"
                  onClick={handleStartRevalidate}
                  disabled={loading}
                  className="mt-4 btn-secondary w-full py-3"
                >
                  {loading ? 'Processing...' : 'Delete Old Idea and Continue'}
                </button>
              </div>
            )}

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider font-bold mb-2">
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
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider font-bold mb-2">
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
                <label className="block text-sm font-semibold text-foreground uppercase tracking-wider font-bold mb-2">
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
                  <label className="block text-sm font-semibold text-foreground uppercase tracking-wider font-bold mb-2">
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
                  <label className="block text-sm font-semibold text-foreground uppercase tracking-wider font-bold mb-2">
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
                disabled={
                  loading ||
                  !isTeamLead ||
                  (searchParams.get('revalidate') === 'true' && validation && !revalidateConfirmed)
                }
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="editorial-card w-full border-4 border-accent relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 relative z-10 gap-6">
                <div>
                  <h2 className="text-3xl font-display font-black text-foreground uppercase mb-2">
                    Validation Complete
                  </h2>
                  <p className="text-mutedForeground font-bold text-lg">
                    {validation.score >= 75
                      ? '✨ Excellent concept! You are clear for takeoff.'
                      : '⚠️ Promising, but needs refinement before building.'}
                  </p>
                </div>
                <div className="text-left md:text-right bg-white border-2 border-foreground p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <div className="text-6xl font-display font-black text-accent mb-1 leading-none">
                    {validation.score}
                  </div>
                  <p className="text-sm font-bold text-mutedForeground uppercase tracking-widest">Overall Score</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t-2 border-foreground/10 relative z-10">
                {[
                  { label: 'Feasibility', score: validation.feasibilityScore, icon: Target },
                  { label: 'Originality', score: validation.originalityScore, icon: Lightbulb },
                  { label: 'Impact', score: validation.impactScore, icon: Rocket },
                  { label: 'Scope', score: validation.scopeScore, icon: AlertCircle },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="bg-light-800 p-4 border border-foreground/20 rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={18} className="text-accent" />
                        <p className="text-foreground font-bold uppercase text-xs tracking-wider">{item.label}</p>
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <p className="text-2xl font-black text-foreground">{item.score}</p>
                        <p className="text-xs font-bold text-mutedForeground mb-1">/100</p>
                      </div>
                      <div className="w-full bg-white border border-foreground/10 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                          className={`h-full ${item.score >= 75 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        ></motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Feedback */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 editorial-card bg-white"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-foreground/10">
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Sparkles size={24} className="text-accent" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-foreground uppercase">AI Evaluation Analysis</h3>
                </div>
                <div>
                  <ul className="list-disc pl-5 space-y-3 marker:text-accent text-lg font-medium text-mutedForeground">
                    {validation.feedback.split('\n').filter(line => line.trim()).map((bullet, idx) => (
                      <li key={idx} className="leading-relaxed">{bullet.replace(/^[-*•]\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Suggestions Sidebar */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="editorial-card bg-light-800"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-foreground/10">
                  <Lightbulb size={24} className="text-accent" />
                  <h4 className="text-xl font-display font-black text-foreground uppercase">Action Plan</h4>
                </div>
                
                <div className="space-y-4">
                  {validation.suggestions?.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + (index * 0.15) }}
                      className="bg-white border-2 border-foreground p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex gap-4"
                    >
                      <div className="shrink-0 w-8 h-8 bg-accent text-white flex items-center justify-center font-black text-lg">
                        {index + 1}
                      </div>
                      <p className="text-sm font-bold text-foreground leading-snug">
                        {suggestion}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {error && (
              <div className="bg-danger/20 border border-danger/50 text-danger font-bold rounded-lg p-4">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                onClick={() => setStep(1)}
                className="flex-1 btn-outline py-4 text-lg border-4"
              >
                Revise & Retest Idea
              </button>
              <button
                onClick={handleSubmitIdea}
                disabled={loading}
                className="flex-1 btn-primary py-4 text-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
              >
                {loading ? 'Submitting...' : 'Proceed to Build Phase 🚀'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IdeaValidatorPage;

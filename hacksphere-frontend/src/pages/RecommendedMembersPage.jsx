import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle, Loader, Zap } from 'lucide-react';
import axios from 'axios';

export const RecommendedMembersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecommendedStudents();
    fetchSentInvites();
  }, [user]);

  const fetchRecommendedStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/recommended');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch recommended students:', error);
      // Fallback to unmatched students
      fetchUnmatchedStudents();
    } finally {
      setLoading(false);
    }
  };

  const fetchUnmatchedStudents = async () => {
    try {
      const response = await axios.get('/api/students/unmatched');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchSentInvites = async () => {
    try {
      const response = await axios.get('/api/collaboration-requests/sent');
      setSentInvites(response.data.map(r => r.studentId));
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    }
  };

  const handleToggleMember = (studentId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      // Only allow selection up to 4 members (5 total with lead)
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, studentId];
    });
  };

  const handleSendInvites = async () => {
    if (selectedMembers.length === 0) return;
    if (selectedMembers.length < 3) {
      alert('Please select at least 3 members (4 total with you).');
      return;
    }
    if (selectedMembers.length > 4) {
      alert('Maximum team size is 5 people. Please select up to 4 members.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('/api/collaboration-requests/send-bulk', {
        studentIds: selectedMembers,
      });
      setSentInvites([...sentInvites, ...selectedMembers]);
      setSelectedMembers([]);
      
      // Show success and redirect
      alert('Collaboration invites sent! Check your dashboard to view responses.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to send invites:', error);
      alert('Failed to send invites. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Go to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Zap className="text-accent-500" size={40} />
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                AI-Recommended <span className="gradient-accent">Team Members</span>
              </h1>
              <p className="text-gray-300">
                Select students with complementary skills to build your idea together.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Total Available</p>
            <p className="text-3xl font-bold text-white">{students.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Selected</p>
            <p className="text-3xl font-bold text-accent-500">{selectedMembers.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Team Size</p>
            <p className="text-3xl font-bold text-warning">{selectedMembers.length + 1}/5</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Status</p>
            <p className="text-3xl font-bold text-primary-400">
              {selectedMembers.length >= 1 ? '✓ Ready' : 'Choose Members'}
            </p>
          </div>
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="animate-spin inline-block text-accent-500" size={48} />
            <p className="text-gray-300 mt-4">Finding students that match your idea...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="card text-center py-16">
            <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Available Students</h3>
            <p className="text-gray-300 mb-6">
              Check back later as more students register or build solo.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {students.map((student) => {
                const isInvited = sentInvites.includes(student._id);
                const isSelected = selectedMembers.includes(student._id);
                const matchScore = student.matchScore ? Math.round(student.matchScore) : null;

                return (
                  <div
                    key={student._id}
                    onClick={() => !isInvited && selectedMembers.length < 4 && handleToggleMember(student._id)}
                    className={`card cursor-pointer transition-all relative ${
                      isSelected ? 'border-accent-500 bg-dark-700' : ''
                    } ${isInvited || (selectedMembers.length >= 4 && !isSelected) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {matchScore && (
                      <div className="absolute top-4 right-4 bg-accent-500/20 border border-accent-500 rounded-lg px-2 py-1">
                        <p className="text-xs font-bold text-accent-400">
                          {matchScore}% Match
                        </p>
                      </div>
                    )}

                    {/* Selection Checkbox */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{student.name}</h3>
                        <p className="text-sm text-gray-400">
                          {student.department} • {student.year} Year
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-accent-500 border-accent-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {isSelected && <CheckCircle size={20} className="text-white" />}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {student.skills?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-primary-900/30 text-primary-300 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                      <p className="text-sm text-gray-300">
                        {student.availability ? '✓ Available' : '✗ Limited'}
                      </p>
                      {isInvited && (
                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">
                          Invited
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Send Invites Button */}
            {selectedMembers.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-600 p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">
                    {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-gray-400">
                    Your team will have {selectedMembers.length + 1} total member{selectedMembers.length + 1 > 1 ? 's' : ''} 
                    {selectedMembers.length < 3 ? ' (need 3 minimum)' : ' ✓'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedMembers([])}
                    className="btn-secondary"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleSendInvites}
                    disabled={submitting || selectedMembers.length < 3}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Send Collaboration Invites</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendedMembersPage;

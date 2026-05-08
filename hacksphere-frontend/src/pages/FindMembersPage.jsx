import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const FindMembersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);

  useEffect(() => {
    fetchUnmatchedStudents();
    fetchSentInvites();
  }, []);

  const fetchUnmatchedStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/unmatched?filter=' + filter);
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
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
    setSelectedMembers((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSendInvites = async () => {
    try {
      await axios.post('/api/collaboration-requests/send-bulk', {
        studentIds: selectedMembers,
      });
      setSentInvites([...sentInvites, ...selectedMembers]);
      setSelectedMembers([]);
      // Show success message
    } catch (error) {
      console.error('Failed to send invites:', error);
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
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Find Your <span className="gradient-accent">Team Members</span>
          </h1>
          <p className="text-gray-300">
            Select students with complementary skills to join your team and build your idea together.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Total Available</p>
            <p className="text-3xl font-bold text-white">{students.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Selected</p>
            <p className="text-3xl font-bold text-accent-500">{selectedMembers.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Minimum Team Size</p>
            <p className="text-3xl font-bold text-warning">2-4</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, skills, or department..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              fetchUnmatchedStudents();
            }}
            className="input-field w-full"
          />
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="card text-center py-16">
            <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Available Students</h3>
            <p className="text-gray-300">
              Check back later as more students register.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {students.map((student) => {
                const isInvited = sentInvites.includes(student._id);
                const isSelected = selectedMembers.includes(student._id);

                return (
                  <div
                    key={student._id}
                    onClick={() => !isInvited && handleToggleMember(student._id)}
                    className={`card cursor-pointer transition-all ${
                      isSelected ? 'border-accent-500 bg-dark-700' : ''
                    } ${isInvited ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {/* Selection Checkbox */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{student.name}</h3>
                        <p className="text-sm text-gray-400">{student.department} • {student.year}st Year</p>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-accent-500 border-accent-500'
                          : 'border-gray-600'
                      }`}>
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

                    {/* Availability */}
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
                <p className="text-white font-semibold">
                  {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedMembers([])}
                    className="btn-secondary"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleSendInvites}
                    className="btn-primary flex items-center gap-2"
                  >
                    <UserPlus size={18} />
                    <span>Send Invites</span>
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

export default FindMembersPage;

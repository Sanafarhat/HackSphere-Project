import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema(
  {
    ideaHolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    respondedAt: Date,
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
collaborationRequestSchema.index({ ideaHolderId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('CollaborationRequest', collaborationRequestSchema);

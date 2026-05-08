import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an idea title'],
    },
    description: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    techStack: String,
    targetUsers: String,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    validationScore: {
      type: Number,
      default: 0,
    },
    feasibilityScore: Number,
    originalityScore: Number,
    impactScore: Number,
    scopeScore: Number,
    feedback: String,
    suggestions: [String],
    isValidated: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    adminOverride: {
      isOverridden: Boolean,
      reason: String,
      overriddenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Idea', ideaSchema);

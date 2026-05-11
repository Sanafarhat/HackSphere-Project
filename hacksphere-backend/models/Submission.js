import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    githubUrl: { type: String, required: true },
    demoUrl: { type: String },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending','submitted','accepted','rejected'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);

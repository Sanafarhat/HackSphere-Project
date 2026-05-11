import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      unique: true,
    },
    ideaValidated: { type: Boolean, default: false },
    repoCreated: { type: Boolean, default: false },
    prototypeStarted: { type: Boolean, default: false },
    midCheckpoint: { type: Boolean, default: false },
    finalSubmission: { type: Boolean, default: false },
    // Optional: explicit percentage override
    percentage: { type: Number, default: 0 },
    // Optional milestone due dates (admin/team can set)
    deadlines: {
      ideaValidationBy: Date,
      repoBy: Date,
      prototypeBy: Date,
      midCheckpointBy: Date,
      finalSubmissionBy: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);

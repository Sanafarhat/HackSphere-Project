import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    primaryColor: {
      type: String,
      default: '#b19cff',
      trim: true,
    },
    secondaryColor: {
      type: String,
      default: '#f0d94d',
      trim: true,
    },
    registrationStart: {
      type: Date,
      required: [true, 'Please provide a registration start date'],
    },
    hackingStart: {
      type: Date,
      required: [true, 'Please provide a hacking start date'],
    },
    submissionDeadline: {
      type: Date,
      required: [true, 'Please provide a submission deadline'],
    },
    judgingStart: {
      type: Date,
    },
    judgingEnd: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    organizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

eventSchema.methods.getCurrentPhase = function getCurrentPhase(now = new Date()) {
  const currentTime = new Date(now);

  if (!this.isActive) {
    return 'inactive';
  }

  if (this.registrationStart && currentTime < this.registrationStart) {
    return 'upcoming';
  }

  if (this.hackingStart && currentTime >= this.registrationStart && currentTime < this.hackingStart) {
    return 'registration';
  }

  if (this.submissionDeadline && currentTime >= this.hackingStart && currentTime <= this.submissionDeadline) {
    return 'hacking';
  }

  if (this.submissionDeadline && currentTime > this.submissionDeadline) {
    return 'judging';
  }

  return 'registration';
};

eventSchema.virtual('currentPhase').get(function currentPhase() {
  return this.getCurrentPhase();
});

eventSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Event', eventSchema);
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'short-circuit', 'open-circuit', 'component-failure',
      'wrong-value', 'design-error', 'soldering-issue',
      'signal-integrity', 'power-issue', 'grounding',
      'thermal', 'other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: { type: String },
    caption: { type: String }
  }],
  circuitData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  acceptedSolution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution',
    default: null
  },
  aiDiagnosis: {
    analysis: { type: String },
    suggestedFixes: [{ type: String }],
    confidence: { type: Number },
    analyzedAt: { type: Date }
  },
  components: [{
    name: { type: String },
    value: { type: String },
    package: { type: String }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for solutions count
issueSchema.virtual('solutions', {
  ref: 'Solution',
  localField: '_id',
  foreignField: 'issue',
  count: true
});

// Virtual for vote score
issueSchema.virtual('voteScore').get(function() {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

// Text index for search
issueSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

issueSchema.index({ category: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ author: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
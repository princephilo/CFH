const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Solution content is required'],
    maxlength: [10000, 'Solution cannot exceed 10000 characters']
  },
  steps: [{
    stepNumber: { type: Number },
    title: { type: String },
    description: { type: String },
    image: { type: String }
  }],
  images: [{
    url: { type: String },
    caption: { type: String }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

solutionSchema.virtual('voteScore').get(function() {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

solutionSchema.index({ issue: 1 });
solutionSchema.index({ author: 1 });

module.exports = mongoose.model('Solution', solutionSchema);
const Solution = require('../models/Solution');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { POINTS, checkAndAwardBadges } = require('../utils/helpers');

exports.createSolution = async (req, res) => {
  try {
    const { issueId, content, steps } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: `/uploads/circuits/${file.filename}`,
        caption: ''
      }));
    }

    const solution = new Solution({
      issue: issueId,
      author: req.userId,
      content,
      steps: steps ? JSON.parse(steps) : [],
      images
    });

    await solution.save();

    // Award points
    const user = await User.findById(req.userId);
    user.points += POINTS.PROVIDE_SOLUTION;
    user.solutionsProvided += 1;
    await user.save();
    await checkAndAwardBadges(user);

    // Update issue status
    if (issue.status === 'open') {
      issue.status = 'in-progress';
      await issue.save();
    }

    const populatedSolution = await Solution.findById(solution._id)
      .populate('author', 'username avatar level points');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(issueId).emit('new_solution', populatedSolution);
    }

    res.status(201).json({
      success: true,
      message: 'Solution submitted',
      data: populatedSolution
    });
  } catch (error) {
    console.error('Create solution error:', error);
    res.status(500).json({ success: false, message: 'Failed to create solution' });
  }
};

exports.getSolutionsByIssue = async (req, res) => {
  try {
    const solutions = await Solution.find({ issue: req.params.issueId })
      .populate('author', 'username avatar level points badges')
      .populate('comments.author', 'username avatar')
      .sort('-isAccepted -voteScore -createdAt');

    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch solutions' });
  }
};

exports.acceptSolution = async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution not found' });
    }

    const issue = await Issue.findById(solution.issue);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Only issue author can accept
    if (issue.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only issue author can accept solutions' });
    }

    // Unaccept previous solution if any
    await Solution.updateMany(
      { issue: issue._id, isAccepted: true },
      { isAccepted: false }
    );

    solution.isAccepted = true;
    await solution.save();

    issue.acceptedSolution = solution._id;
    issue.status = 'resolved';
    await issue.save();

    // Award points to solution author
    const solutionAuthor = await User.findById(solution.author);
    solutionAuthor.points += POINTS.SOLUTION_ACCEPTED;
    await solutionAuthor.save();
    await checkAndAwardBadges(solutionAuthor);

    res.json({ success: true, message: 'Solution accepted', data: solution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to accept solution' });
  }
};

exports.voteSolution = async (req, res) => {
  try {
    const { voteType } = req.body;
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution not found' });
    }

    const userId = req.userId;

    if (voteType === 'upvote') {
      solution.downvotes = solution.downvotes.filter(id => id.toString() !== userId.toString());
      const index = solution.upvotes.findIndex(id => id.toString() === userId.toString());
      if (index > -1) {
        solution.upvotes.splice(index, 1);
      } else {
        solution.upvotes.push(userId);
        // Award points to solution author
        if (solution.author.toString() !== userId.toString()) {
          await User.findByIdAndUpdate(solution.author, {
            $inc: { points: POINTS.SOLUTION_UPVOTED }
          });
        }
      }
    } else if (voteType === 'downvote') {
      solution.upvotes = solution.upvotes.filter(id => id.toString() !== userId.toString());
      const index = solution.downvotes.findIndex(id => id.toString() === userId.toString());
      if (index > -1) {
        solution.downvotes.splice(index, 1);
      } else {
        solution.downvotes.push(userId);
      }
    }

    await solution.save();

    res.json({
      success: true,
      data: {
        upvotes: solution.upvotes.length,
        downvotes: solution.downvotes.length,
        voteScore: solution.voteScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to vote' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution not found' });
    }

    solution.comments.push({
      author: req.userId,
      content
    });

    await solution.save();

    const updated = await Solution.findById(solution._id)
      .populate('comments.author', 'username avatar');

    res.json({ success: true, data: updated.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};
const User = require('../models/User');
const Issue = require('../models/Issue');
const Solution = require('../models/Solution');

exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 20, timeframe } = req.query;

    let dateFilter = {};
    if (timeframe === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const users = await User.find({ isActive: true, ...dateFilter })
      .select('username avatar points badges solutionsProvided verifiedSolutions level')
      .sort('-points')
      .limit(parseInt(limit));

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [issueCount, solutionCount, acceptedCount] = await Promise.all([
      Issue.countDocuments({ author: user._id }),
      Solution.countDocuments({ author: user._id }),
      Solution.countDocuments({ author: user._id, isAccepted: true })
    ]);

    const recentIssues = await Issue.find({ author: user._id })
      .sort('-createdAt')
      .limit(5)
      .select('title status createdAt category');

    const recentSolutions = await Solution.find({ author: user._id })
      .sort('-createdAt')
      .limit(5)
      .select('content isAccepted createdAt')
      .populate('issue', 'title');

    res.json({
      success: true,
      data: {
        user,
        stats: {
          issueCount,
          solutionCount,
          acceptedCount
        },
        recentIssues,
        recentSolutions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalIssues,
      resolvedIssues,
      totalSolutions
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'resolved' }),
      Solution.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalIssues,
        resolvedIssues,
        totalSolutions,
        resolutionRate: totalIssues > 0
          ? ((resolvedIssues / totalIssues) * 100).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
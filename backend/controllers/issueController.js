const Issue = require('../models/Issue');

const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      difficulty,
      tags,
      components,
      circuitData
    } = req.body;

    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      difficulty,
      tags: tags ? JSON.parse(tags) : [],
      components: components ? JSON.parse(components) : [],
      circuitData: circuitData ? JSON.parse(circuitData) : null,
      circuitImages: imagePaths,
      author: req.userId
    });

    const populatedIssue = await Issue.findById(issue._id).populate('author', 'username email');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: populatedIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create issue'
    });
  }
};

const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('author', 'username email points')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          page: 1,
          limit: issues.length,
          total: issues.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch issues'
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('author', 'username email points badges avatar')
      .populate('solvedBy', 'username');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Get issue by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch issue'
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById
};
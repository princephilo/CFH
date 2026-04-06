const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const { POINTS } = require('../utils/helpers');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = new ForumPost({
      title,
      content,
      author: req.userId,
      category: category || 'general',
      tags: tags || []
    });

    await post.save();

    // Award points
    await User.findByIdAndUpdate(req.userId, {
      $inc: { points: POINTS.FORUM_POST }
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'username avatar level');

    res.status(201).json({
      success: true,
      message: 'Post created',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1, limit = 15, category, search, sort = '-createdAt'
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Pinned posts first
    const sortObj = sort === '-createdAt'
      ? { isPinned: -1, createdAt: -1 }
      : { isPinned: -1, [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 };

    const [posts, total] = await Promise.all([
      ForumPost.find(query)
        .populate('author', 'username avatar level')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      ForumPost.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username avatar level points')
      .populate('replies.author', 'username avatar level');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ success: false, message: 'Post is locked' });
    }

    post.replies.push({
      author: req.userId,
      content
    });

    await post.save();

    // Award points
    await User.findByIdAndUpdate(req.userId, {
      $inc: { points: POINTS.FORUM_REPLY }
    });

    const updated = await ForumPost.findById(post._id)
      .populate('replies.author', 'username avatar level');

    // Socket emit
    const io = req.app.get('io');
    if (io) {
      io.to(`forum-${post._id}`).emit('new_reply', updated.replies[updated.replies.length - 1]);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};

exports.upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const index = post.upvotes.findIndex(id => id.toString() === req.userId.toString());
    if (index > -1) {
      post.upvotes.splice(index, 1);
    } else {
      post.upvotes.push(req.userId);
    }

    await post.save();
    res.json({ success: true, data: { upvotes: post.upvotes.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upvote' });
  }
};
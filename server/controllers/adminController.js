const User = require('../models/User');
const SkillListing = require('../models/SkillListing');
const SkillRequest = require('../models/SkillRequest');

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalListings = await SkillListing.countDocuments({ isActive: true });
    const totalRequests = await SkillRequest.countDocuments();
    const completedExchanges = await SkillRequest.countDocuments({ status: 'completed' });
    const pendingRequests = await SkillRequest.countDocuments({ status: 'pending' });

    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentListings = await SkillListing.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .select('skillName category createdAt');

    const categoryStats = await SkillListing.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        totalRequests,
        completedExchanges,
        pendingRequests,
        recentUsers,
        recentListings,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.adminGetUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    await User.findByIdAndDelete(req.params.id);
    await SkillListing.deleteMany({ user: req.params.id });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.adminGetListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const listings = await SkillListing.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SkillListing.countDocuments();

    res.json({
      success: true,
      listings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.adminDeleteListing = async (req, res, next) => {
  try {
    const listing = await SkillListing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
};

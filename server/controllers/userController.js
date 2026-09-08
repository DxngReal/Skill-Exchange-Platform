const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { 'skillsTeach.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.skill) {
      filter['skillsTeach.name'] = { $regex: req.query.skill, $options: 'i' };
    }
    if (req.query.category) {
      filter['skillsTeach.category'] = req.query.category;
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

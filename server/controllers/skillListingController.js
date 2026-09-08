const SkillListing = require('../models/SkillListing');

exports.createListing = async (req, res, next) => {
  try {
    const listing = await SkillListing.create({
      ...req.body,
      user: req.user.id
    });
    const populated = await listing.populate('user', 'name avatar averageRating');
    res.status(201).json({ success: true, listing: populated });
  } catch (error) {
    next(error);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.search) {
      filter.$or = [
        { skillName: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.experienceLevel) {
      filter.experienceLevel = req.query.experienceLevel;
    }
    if (req.query.teachingFormat) {
      filter.teachingFormat = req.query.teachingFormat;
    }
    if (req.query.user) {
      filter.user = req.query.user;
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'popular') sort = { views: -1 };
    if (req.query.sort === 'interested') sort = { interestedCount: -1 };

    const listings = await SkillListing.find(filter)
      .populate('user', 'name avatar averageRating totalReviews location')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await SkillListing.countDocuments(filter);

    res.json({
      success: true,
      listings,
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

exports.getListing = async (req, res, next) => {
  try {
    const listing = await SkillListing.findById(req.params.id)
      .populate('user', 'name avatar bio averageRating totalReviews location skillsTeach');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    listing.views += 1;
    await listing.save({ validateBeforeSave: false });
    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    let listing = await SkillListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    listing = await SkillListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name avatar averageRating');

    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await SkillListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    await SkillListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await SkillListing.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await SkillListing.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

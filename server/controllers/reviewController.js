const Review = require('../models/Review');
const User = require('../models/User');
const SkillRequest = require('../models/SkillRequest');
const Notification = require('../models/Notification');

exports.createReview = async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;

    const request = await SkillRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed exchanges' });
    }

    if (request.requester.toString() === request.provider.toString()) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }

    const revieweeId = request.requester.toString() === req.user.id
      ? request.provider
      : request.requester;

    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      request: requestId
    });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this exchange' });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      reviewee: revieweeId,
      request: requestId,
      rating,
      comment,
      skillName: request.skillName
    });

    // Update user's average rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    });

    await Notification.create({
      user: revieweeId,
      type: 'new_review',
      from: req.user.id,
      title: `New review for ${request.skillName}`,
      message: `${req.user.name} left you a ${rating}-star review`,
      link: `/profile/${revieweeId}`
    });

    const populated = await review.populate('reviewer', 'name avatar');

    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    next(error);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const SkillRequest = require('../models/SkillRequest');
const Notification = require('../models/Notification');

exports.createRequest = async (req, res, next) => {
  try {
    const { listingId, message } = req.body;

    const existing = await SkillRequest.findOne({
      requester: req.user.id,
      listing: listingId,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active request for this listing' });
    }

    const listing = await require('../models/SkillListing').findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const request = await SkillRequest.create({
      requester: req.user.id,
      provider: listing.user,
      listing: listingId,
      skillName: listing.skillName,
      message
    });

    await Notification.create({
      user: listing.user,
      type: 'new_request',
      from: req.user.id,
      title: `New skill request: ${listing.skillName}`,
      message: `${req.user.name} wants to learn ${listing.skillName} from you`,
      link: `/requests`
    });

    const populated = await request.populate([
      { path: 'requester', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
      { path: 'listing', select: 'skillName category' }
    ]);

    res.status(201).json({ success: true, request: populated });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const incoming = await SkillRequest.find({ provider: req.user.id })
      .populate('requester', 'name avatar')
      .populate('listing', 'skillName category')
      .sort({ createdAt: -1 });

    const outgoing = await SkillRequest.find({ requester: req.user.id })
      .populate('provider', 'name avatar')
      .populate('listing', 'skillName category')
      .sort({ createdAt: -1 });

    res.json({ success: true, incoming, outgoing });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await SkillRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    request.status = status;
    await request.save();

    const notifType = status === 'accepted' ? 'request_accepted' : 'request_rejected';
    await Notification.create({
      user: request.requester,
      type: notifType,
      from: req.user.id,
      title: `Request ${status}: ${request.skillName}`,
      message: `Your request to learn ${request.skillName} has been ${status}`,
      link: `/requests`
    });

    const populated = await request.populate([
      { path: 'requester', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
      { path: 'listing', select: 'skillName category' }
    ]);

    res.json({ success: true, request: populated });
  } catch (error) {
    next(error);
  }
};

exports.completeRequest = async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'completed';
    await request.save();

    await Notification.create({
      user: request.provider,
      type: 'request_completed',
      from: req.user.id,
      title: `Exchange completed: ${request.skillName}`,
      message: `The exchange for ${request.skillName} has been marked as completed`,
      link: `/requests`
    });

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

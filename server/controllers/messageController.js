const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

exports.createConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] }
    });

    if (conversation) {
      return res.json({ success: true, conversation });
    }

    conversation = await Conversation.create({
      participants: [req.user.id, userId]
    });

    conversation = await conversation.populate('participants', 'name avatar');

    res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );

    const total = await Message.countDocuments({ conversation: req.params.conversationId });

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user.id,
      content: req.body.content,
      readBy: [req.user.id]
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    const populated = await message.populate('sender', 'name avatar');

    const otherParticipant = conversation.participants.find(
      p => p.toString() !== req.user.id
    );

    if (otherParticipant) {
      await Notification.create({
        user: otherParticipant,
        type: 'new_message',
        from: req.user.id,
        title: `New message from ${req.user.name}`,
        message: req.body.content.substring(0, 100),
        link: `/messages/${req.params.conversationId}`
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    });

    let totalUnread = 0;
    for (const conv of conversations) {
      const count = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      });
      totalUnread += count;
    }

    res.json({ success: true, unreadCount: totalUnread });
  } catch (error) {
    next(error);
  }
};

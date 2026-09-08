const User = require('../models/User');

exports.getMatches = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const teachNames = currentUser.skillsTeach.map(s => s.name.toLowerCase());
    const wantNames = currentUser.skillsWant.map(s => s.name.toLowerCase());

    const matches = await User.find({
      _id: { $ne: currentUser._id },
      isActive: true,
      $or: [
        {
          'skillsWant.name': { $in: teachNames.map(n => new RegExp(`^${n}$`, 'i')) }
        },
        {
          'skillsTeach.name': { $in: wantNames.map(n => new RegExp(`^${n}$`, 'i')) }
        }
      ]
    }).select('name avatar bio skillsTeach skillsWant averageRating totalReviews location availability');

    const scoredMatches = matches.map(match => {
      let score = 0;
      const matchDetails = [];

      match.skillsTeach.forEach(skill => {
        if (wantNames.some(w => w === skill.name.toLowerCase())) {
          score += 10;
          matchDetails.push({ type: 'can_teach', skill: skill.name });
        }
      });

      match.skillsWant.forEach(skill => {
        if (teachNames.some(t => t === skill.name.toLowerCase())) {
          score += 10;
          matchDetails.push({ type: 'wants_to_learn', skill: skill.name });
        }
      });

      return { ...match.toObject(), matchScore: score, matchDetails };
    });

    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matches: scoredMatches.slice(0, 20),
      totalMatches: scoredMatches.length
    });
  } catch (error) {
    next(error);
  }
};

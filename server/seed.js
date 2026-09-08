const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const SkillListing = require('./models/SkillListing');
const SkillRequest = require('./models/SkillRequest');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

const sampleUsers = [
  {
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    bio: 'Platform administrator.',
    skillsTeach: [],
    skillsWant: [],
    availability: 'flexible',
    location: 'Remote',
    role: 'admin',
    averageRating: 0,
    totalReviews: 0,
  },
  {
    name: 'Alex Chen',
    email: 'alex@example.com',
    password: 'password123',
    bio: 'Full-stack developer with 5+ years of experience. Love teaching React and Node.js.',
    skillsTeach: [
      { name: 'React', category: 'programming', experienceLevel: 'expert', description: 'I can teach you React from basics to advanced patterns.' },
      { name: 'Node.js', category: 'programming', experienceLevel: 'advanced', description: 'Backend development with Express and MongoDB.' },
      { name: 'TypeScript', category: 'programming', experienceLevel: 'advanced' },
    ],
    skillsWant: [
      { name: 'Machine Learning', category: 'data-science', experienceLevel: 'beginner' },
      { name: 'Guitar', category: 'music', experienceLevel: 'beginner' },
    ],
    availability: 'weekends',
    location: 'San Francisco, CA',
    averageRating: 4.8,
    totalReviews: 12,
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    bio: 'UI/UX designer passionate about creating beautiful, accessible interfaces.',
    skillsTeach: [
      { name: 'UI Design', category: 'design', experienceLevel: 'expert', description: 'Figma, design systems, and user research.' },
      { name: 'Figma', category: 'design', experienceLevel: 'advanced' },
      { name: 'CSS', category: 'programming', experienceLevel: 'advanced' },
    ],
    skillsWant: [
      { name: 'React', category: 'programming', experienceLevel: 'intermediate' },
      { name: 'Photography', category: 'photography', experienceLevel: 'beginner' },
    ],
    availability: 'flexible',
    location: 'New York, NY',
    averageRating: 4.9,
    totalReviews: 8,
  },
  {
    name: 'Marcus Rivera',
    email: 'marcus@example.com',
    password: 'password123',
    bio: 'Data scientist by day, musician by night. I love sharing knowledge across disciplines.',
    skillsTeach: [
      { name: 'Python', category: 'programming', experienceLevel: 'expert', description: 'Data analysis, automation, and scripting.' },
      { name: 'Machine Learning', category: 'data-science', experienceLevel: 'advanced', description: 'Scikit-learn, TensorFlow basics, and model evaluation.' },
      { name: 'Piano', category: 'music', experienceLevel: 'intermediate' },
    ],
    skillsWant: [
      { name: 'UI Design', category: 'design', experienceLevel: 'beginner' },
      { name: 'Spanish', category: 'languages', experienceLevel: 'intermediate' },
    ],
    availability: 'evenings',
    location: 'Austin, TX',
    averageRating: 4.7,
    totalReviews: 15,
  },
  {
    name: 'Emma Wilson',
    email: 'emma@example.com',
    password: 'password123',
    bio: 'Professional photographer and visual storyteller. Let me help you see the world differently.',
    skillsTeach: [
      { name: 'Photography', category: 'photography', experienceLevel: 'expert', description: 'Composition, lighting, and post-processing.' },
      { name: 'Lightroom', category: 'photography', experienceLevel: 'advanced' },
    ],
    skillsWant: [
      { name: 'Python', category: 'programming', experienceLevel: 'beginner' },
      { name: 'Marketing', category: 'marketing', experienceLevel: 'intermediate' },
    ],
    availability: 'weekends',
    location: 'Portland, OR',
    averageRating: 4.6,
    totalReviews: 6,
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: 'password123',
    bio: 'Language tutor specializing in East Asian languages. Native Korean speaker.',
    skillsTeach: [
      { name: 'Korean', category: 'languages', experienceLevel: 'expert', description: 'Conversational and business Korean.' },
      { name: 'Japanese', category: 'languages', experienceLevel: 'advanced' },
    ],
    skillsWant: [
      { name: 'React', category: 'programming', experienceLevel: 'beginner' },
      { name: 'Cooking', category: 'cooking', experienceLevel: 'intermediate' },
    ],
    availability: 'weekdays',
    location: 'Seattle, WA',
    averageRating: 4.5,
    totalReviews: 10,
  },
  {
    name: 'Lisa Martinez',
    email: 'lisa@example.com',
    password: 'password123',
    bio: 'Fitness enthusiast and certified yoga instructor. Health is wealth!',
    skillsTeach: [
      { name: 'Yoga', category: 'fitness', experienceLevel: 'expert', description: 'Hatha, Vinyasa, and meditation techniques.' },
      { name: 'Nutrition', category: 'fitness', experienceLevel: 'advanced' },
    ],
    skillsWant: [
      { name: 'Photography', category: 'photography', experienceLevel: 'beginner' },
      { name: 'Spanish', category: 'languages', experienceLevel: 'beginner' },
    ],
    availability: 'weekdays',
    location: 'Miami, FL',
    averageRating: 4.9,
    totalReviews: 20,
  },
];

const sampleListings = [
  {
    skillName: 'React Development',
    description: 'Learn React from scratch or improve your existing skills. I cover hooks, context, performance optimization, and modern patterns used in production apps.',
    category: 'programming',
    experienceLevel: 'advanced',
    teachingFormat: 'online',
    availability: 'weekends',
    whatToExpect: 'You will learn component architecture, state management, API integration, testing, and deployment. By the end, you will be able to build complete React applications.',
    tags: ['react', 'javascript', 'frontend', 'web development'],
  },
  {
    skillName: 'UI/UX Design with Figma',
    description: 'Master the art of designing beautiful, user-friendly interfaces using Figma. From wireframes to high-fidelity prototypes.',
    category: 'design',
    experienceLevel: 'expert',
    teachingFormat: 'both',
    availability: 'flexible',
    whatToExpect: 'Design thinking process, Figma tools and techniques, design systems, prototyping, and user testing methods.',
    tags: ['figma', 'design', 'ui', 'ux', 'prototyping'],
  },
  {
    skillName: 'Python for Data Science',
    description: 'From zero to数据分析. Learn Python basics, pandas, numpy, matplotlib, and machine learning fundamentals.',
    category: 'data-science',
    experienceLevel: 'advanced',
    teachingFormat: 'online',
    availability: 'evenings',
    whatToExpect: 'Python fundamentals, data manipulation with pandas, visualization, statistical analysis, and introduction to ML with scikit-learn.',
    tags: ['python', 'data science', 'machine learning', 'pandas'],
  },
  {
    skillName: 'Korean Language',
    description: 'Learn Korean from a native speaker. Conversational focus with cultural context. Suitable for beginners to intermediate learners.',
    category: 'languages',
    experienceLevel: 'expert',
    teachingFormat: 'online',
    availability: 'weekdays',
    whatToExpect: 'Hangul writing system, basic conversation, grammar patterns, cultural etiquette, and K-drama vocabulary.',
    tags: ['korean', 'language', 'k-drama', 'hangul'],
  },
  {
    skillName: 'Photography Masterclass',
    description: 'Learn professional photography techniques. Composition, lighting, camera settings, and post-processing in Lightroom.',
    category: 'photography',
    experienceLevel: 'expert',
    teachingFormat: 'both',
    availability: 'weekends',
    whatToExpect: 'Camera fundamentals, composition rules, natural and artificial lighting, portrait and landscape techniques, and Lightroom editing workflow.',
    tags: ['photography', 'camera', 'lightroom', 'editing'],
  },
  {
    skillName: 'Yoga & Meditation',
    description: 'Discover the transformative power of yoga. From basic poses to advanced flows, plus meditation and breathwork techniques.',
    category: 'fitness',
    experienceLevel: 'expert',
    teachingFormat: 'both',
    availability: 'flexible',
    whatToExpect: 'Hatha and Vinyasa yoga styles, proper alignment, breathing techniques, meditation practices, and stress relief methods.',
    tags: ['yoga', 'meditation', 'fitness', 'wellness', 'flexibility'],
  },
  {
    skillName: 'Node.js Backend Development',
    description: 'Build scalable backend services with Node.js and Express. REST APIs, authentication, databases, and deployment.',
    category: 'programming',
    experienceLevel: 'advanced',
    teachingFormat: 'online',
    availability: 'evenings',
    whatToExpect: 'Express.js routing, middleware, authentication with JWT, MongoDB integration, error handling, and production deployment.',
    tags: ['nodejs', 'express', 'backend', 'api', 'mongodb'],
  },
  {
    skillName: 'Graphic Design Fundamentals',
    description: 'Learn the principles of graphic design including color theory, typography, layout, and visual hierarchy.',
    category: 'design',
    experienceLevel: 'intermediate',
    teachingFormat: 'online',
    availability: 'weekdays',
    whatToExpect: 'Color theory, typography basics, layout composition, branding principles, and practical design exercises.',
    tags: ['design', 'graphic design', 'typography', 'color theory'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await SkillListing.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create listings
    const listings = sampleListings.map((listing, i) => ({
      ...listing,
      user: createdUsers[i % createdUsers.length]._id,
      views: Math.floor(Math.random() * 100) + 10,
      interestedCount: Math.floor(Math.random() * 20),
    }));
    const createdListings = await SkillListing.create(listings);
    console.log(`Created ${createdListings.length} listings`);

    // Create skill requests
    const sampleRequests = [
      {
        requester: createdUsers[2]._id, // Sarah
        provider: createdUsers[1]._id, // Alex
        listing: createdListings[0]._id, // React Development
        skillName: 'React',
        message: 'Hi Alex! I want to learn React to build my portfolio site.',
        status: 'completed',
      },
      {
        requester: createdUsers[1]._id, // Alex
        provider: createdUsers[3]._id, // Marcus
        listing: createdListings[2]._id, // Python for Data Science
        skillName: 'Machine Learning',
        message: 'Hey Marcus, interested in learning ML basics from you!',
        status: 'accepted',
      },
      {
        requester: createdUsers[4]._id, // Emma
        provider: createdUsers[3]._id, // Marcus
        listing: createdListings[2]._id, // Python for Data Science
        skillName: 'Python',
        message: 'I want to learn Python for automating my photo workflow.',
        status: 'pending',
      },
      {
        requester: createdUsers[5]._id, // David
        provider: createdUsers[1]._id, // Alex
        listing: createdListings[0]._id, // React Development
        skillName: 'React',
        message: 'Want to learn React to switch careers into web dev!',
        status: 'accepted',
      },
      {
        requester: createdUsers[6]._id, // Lisa
        provider: createdUsers[4]._id, // Emma
        listing: createdListings[4]._id, // Photography Masterclass
        skillName: 'Photography',
        message: 'I want to improve my fitness photography skills.',
        status: 'pending',
      },
      {
        requester: createdUsers[2]._id, // Sarah
        provider: createdUsers[4]._id, // Emma
        listing: createdListings[4]._id, // Photography Masterclass
        skillName: 'Photography',
        message: 'Love your work! Can you teach me portrait photography?',
        status: 'completed',
      },
    ];
    const createdRequests = await SkillRequest.create(sampleRequests);
    console.log(`Created ${createdRequests.length} skill requests`);

    // Create conversations with messages
    const sampleConversations = [
      {
        participants: [createdUsers[2]._id, createdUsers[1]._id],
      },
      {
        participants: [createdUsers[1]._id, createdUsers[3]._id],
      },
      {
        participants: [createdUsers[2]._id, createdUsers[4]._id],
      },
    ];
    const createdConversations = await Conversation.create(sampleConversations);
    console.log(`Created ${createdConversations.length} conversations`);

    const sampleMessages = [
      // Conversation: Sarah & Alex
      { conversation: createdConversations[0]._id, sender: createdUsers[2]._id, content: 'Hi Alex! When are you available for our React session?', readBy: [createdUsers[2]._id, createdUsers[1]._id] },
      { conversation: createdConversations[0]._id, sender: createdUsers[1]._id, content: 'Hey Sarah! How about Saturday morning? I can do 10am-12pm.', readBy: [createdUsers[1]._id, createdUsers[2]._id] },
      { conversation: createdConversations[0]._id, sender: createdUsers[2]._id, content: 'Perfect! I will prepare some questions about hooks and state management.', readBy: [createdUsers[2]._id, createdUsers[1]._id] },
      { conversation: createdConversations[0]._id, sender: createdUsers[1]._id, content: 'Great! I will prepare some exercises on useEffect and custom hooks.', readBy: [createdUsers[1]._id] },
      // Conversation: Alex & Marcus
      { conversation: createdConversations[1]._id, sender: createdUsers[1]._id, content: 'Hey Marcus! Ready to start the ML sessions?', readBy: [createdUsers[1]._id, createdUsers[3]._id] },
      { conversation: createdConversations[1]._id, sender: createdUsers[3]._id, content: 'Yes! Let us start with Python basics and pandas this week.', readBy: [createdUsers[3]._id, createdUsers[1]._id] },
      { conversation: createdConversations[1]._id, sender: createdUsers[1]._id, content: 'Sounds good. Should I install Anaconda or just pip?', readBy: [createdUsers[1]._id] },
      // Conversation: Sarah & Emma
      { conversation: createdConversations[2]._id, sender: createdUsers[2]._id, content: 'Emma, I loved your photography portfolio! Can we schedule a session?', readBy: [createdUsers[2]._id, createdUsers[4]._id] },
      { conversation: createdConversations[2]._id, sender: createdUsers[4]._id, content: 'Thank you Sarah! I would love to help. What area interests you most?', readBy: [createdUsers[4]._id, createdUsers[2]._id] },
      { conversation: createdConversations[2]._id, sender: createdUsers[2]._id, content: 'Portrait photography and lighting techniques mostly!', readBy: [createdUsers[2]._id, createdUsers[4]._id] },
      { conversation: createdConversations[2]._id, sender: createdUsers[4]._id, content: 'Great choices! We can start with natural light techniques and then move to studio setups.', readBy: [createdUsers[4]._id] },
    ];

    // Update conversations with last message
    const createdMessages = [];
    for (const msg of sampleMessages) {
      const m = await Message.create(msg);
      createdMessages.push(m);
    }

    await Conversation.findByIdAndUpdate(createdConversations[0]._id, { lastMessage: createdMessages[3]._id, lastMessageAt: createdMessages[3].createdAt });
    await Conversation.findByIdAndUpdate(createdConversations[1]._id, { lastMessage: createdMessages[6]._id, lastMessageAt: createdMessages[6].createdAt });
    await Conversation.findByIdAndUpdate(createdConversations[2]._id, { lastMessage: createdMessages[9]._id, lastMessageAt: createdMessages[9].createdAt });
    console.log(`Created ${createdMessages.length} messages`);

    // Create reviews for completed requests
    const sampleReviews = [
      {
        reviewer: createdUsers[2]._id, // Sarah
        reviewee: createdUsers[1]._id, // Alex
        request: createdRequests[0]._id,
        rating: 5,
        comment: 'Alex is an amazing React teacher! Very patient and knowledgeable. Learned so much in just one session.',
        skillName: 'React',
      },
      {
        reviewer: createdUsers[2]._id, // Sarah
        reviewee: createdUsers[4]._id, // Emma
        request: createdRequests[5]._id,
        rating: 5,
        comment: 'Emma helped me understand lighting so well! My portrait photos have improved drastically.',
        skillName: 'Photography',
      },
    ];
    await Review.create(sampleReviews);
    console.log(`Created ${sampleReviews.length} reviews`);

    // Create notifications
    const sampleNotifications = [
      { user: createdUsers[1]._id, type: 'new_request', from: createdUsers[2]._id, title: 'New skill request from Sarah Johnson', message: 'Sarah wants to learn React from you', link: '/requests' },
      { user: createdUsers[1]._id, type: 'new_request', from: createdUsers[5]._id, title: 'New skill request from David Kim', message: 'David wants to learn React from you', link: '/requests' },
      { user: createdUsers[3]._id, type: 'request_accepted', from: createdUsers[1]._id, title: 'Request accepted by Alex Chen', message: 'Alex accepted your Machine Learning request', link: '/requests' },
      { user: createdUsers[4]._id, type: 'new_message', from: createdUsers[2]._id, title: 'New message from Sarah Johnson', message: 'Emma, I loved your photography portfolio!', link: '/messages' },
      { user: createdUsers[1]._id, type: 'new_review', from: createdUsers[2]._id, title: 'New review from Sarah Johnson', message: 'Sarah left you a 5-star review for React', link: '/profile/me' },
      { user: createdUsers[4]._id, type: 'new_review', from: createdUsers[2]._id, title: 'New review from Sarah Johnson', message: 'Sarah left you a 5-star review for Photography', link: '/profile/me' },
    ];
    await Notification.create(sampleNotifications);
    console.log(`Created ${sampleNotifications.length} notifications`);

    console.log('\nSeed completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: alex@example.com | Password: password123');
    console.log('Email: sarah@example.com | Password: password123');
    console.log('Email: marcus@example.com | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

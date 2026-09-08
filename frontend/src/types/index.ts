export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skillsTeach: SkillItem[];
  skillsWant: SkillItem[];
  availability: string;
  location: string;
  role: 'user' | 'admin';
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
}

export interface SkillItem {
  name: string;
  category: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
}

export interface SkillListing {
  _id: string;
  user: User | string;
  skillName: string;
  description: string;
  category: string;
  experienceLevel: string;
  teachingFormat: string;
  availability: string;
  whatToExpect: string;
  tags: string[];
  isActive: boolean;
  views: number;
  interestedCount: number;
  createdAt: string;
}

export interface SkillRequest {
  _id: string;
  requester: User;
  provider: User;
  listing: SkillListing;
  skillName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  exchangeDetails: {
    format: string;
    scheduledDate?: string;
    notes: string;
  };
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface Review {
  _id: string;
  reviewer: User;
  reviewee: string;
  request: string;
  rating: number;
  comment: string;
  skillName: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  from?: User;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'music', label: 'Music' },
  { value: 'languages', label: 'Languages' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'other', label: 'Other' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

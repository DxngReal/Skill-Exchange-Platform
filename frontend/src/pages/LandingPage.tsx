import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowRight, Users, BookOpen, Star, MessageSquare,
  Code, Palette, Globe, Music, Dumbbell, Camera, Utensils
} from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Share Your Skills',
    description: 'Teach what you know and help others grow. List your skills and connect with eager learners.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Find Perfect Matches',
    description: 'Our matching system pairs you with the right people based on what you teach and want to learn.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Connect & Collaborate',
    description: 'Message your matches, schedule sessions, and build meaningful learning relationships.',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Build Your Reputation',
    description: 'Earn reviews and ratings as you teach and learn, building trust in the community.',
  },
];

const categories = [
  { icon: <Code className="w-5 h-5" />, name: 'Programming', count: '2.4k' },
  { icon: <Palette className="w-5 h-5" />, name: 'Design', count: '1.8k' },
  { icon: <Globe className="w-5 h-5" />, name: 'Languages', count: '3.1k' },
  { icon: <Music className="w-5 h-5" />, name: 'Music', count: '1.5k' },
  { icon: <Dumbbell className="w-5 h-5" />, name: 'Fitness', count: '1.2k' },
  { icon: <Camera className="w-5 h-5" />, name: 'Photography', count: '980' },
  { icon: <Utensils className="w-5 h-5" />, name: 'Cooking', count: '1.1k' },
  { icon: <BookOpen className="w-5 h-5" />, name: 'Writing', count: '870' },
];

const steps = [
  { num: '1', title: 'Create Your Profile', desc: 'Add your skills, interests, and availability' },
  { num: '2', title: 'Browse & Discover', desc: 'Find skills you want to learn or people who want yours' },
  { num: '3', title: 'Connect & Exchange', desc: 'Request an exchange, schedule a session, and start learning' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-violet-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm font-medium mb-6">
              🚀 The future of peer-to-peer learning
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Exchange Skills,<br />
              <span className="text-emerald-300">Grow Together</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
              Teach what you know. Learn what you love. SkillX connects people who want to
              share knowledge with those eager to learn — no money needed.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    Start Learning Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/marketplace"
                    className="px-8 py-3.5 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Browse Skills
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary-600 flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>12,000+ learners</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.9 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Skill Exchange Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Follow three easy steps to begin your learning journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete platform designed for meaningful skill exchanges
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-lg text-gray-600">
              Explore skills across a wide range of categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/marketplace?category=${cat.name.toLowerCase()}`}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all group"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm group-hover:bg-primary-100 transition-colors">
                  {cat.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-500">{cat.count} skills</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Exchanging Skills?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and teachers on SkillX. It's completely free to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Create Free Account'} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SX</span>
              </div>
              <span className="text-lg font-bold text-white">SkillX</span>
            </div>
            <p className="text-sm">© 2026 SkillX. Built with passion for learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

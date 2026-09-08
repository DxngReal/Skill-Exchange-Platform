import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import type { SkillListing } from '../types';
import toast from 'react-hot-toast';
import { Star, MapPin, Clock, Eye, ArrowLeft, MessageSquare, Send } from 'lucide-react';

export default function SkillDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<SkillListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/skills/${id}`);
        setListing(res.data.listing);
      } catch {
        toast.error('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleRequest = async () => {
    if (!listing) return;
    setSubmitting(true);
    try {
      await api.post('/requests', { listingId: listing._id, message: requestMessage });
      setShowRequestModal(false);
      setRequestMessage('');
      toast.success('Request sent successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Listing not found</h2>
        <Link to="/marketplace" className="text-primary-600 hover:text-primary-700">
          ← Back to marketplace
        </Link>
      </div>
    );
  }

  const profile = listing.user as any;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full font-medium capitalize">
              {listing.category?.replace(/-/g, ' ')}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              listing.experienceLevel === 'expert' ? 'bg-violet-100 text-violet-700' :
              listing.experienceLevel === 'advanced' ? 'bg-emerald-100 text-emerald-700' :
              listing.experienceLevel === 'intermediate' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {listing.experienceLevel}
            </span>
            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium capitalize">
              {listing.teachingFormat}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{listing.skillName}</h1>

          <div className="prose prose-gray max-w-none mb-6">
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {listing.whatToExpect && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">What You'll Learn</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{listing.whatToExpect}</p>
            </div>
          )}

          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.tags.map((tag, i) => (
                <span key={i} className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {listing.views} views
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {listing.availability}
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to={`/profile/${profile?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-bold text-primary-700">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                profile?.name?.charAt(0) || '?'
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {profile?.averageRating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{profile?.averageRating}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {user && profile?._id !== user._id ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const createConvo = async () => {
                    try {
                      const res = await api.post('/messages/conversations', { userId: profile._id });
                      navigate(`/messages/${res.data.conversation._id}`);
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || 'Failed to start conversation');
                    }
                  };
                  createConvo();
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Request to Learn
              </button>
            </div>
          ) : !user ? (
            <Link to="/login" className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Sign in to Request
            </Link>
          ) : null}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Request to Learn</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a request to learn <strong>{listing.skillName}</strong> from {profile?.name}
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Tell them why you want to learn this skill..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

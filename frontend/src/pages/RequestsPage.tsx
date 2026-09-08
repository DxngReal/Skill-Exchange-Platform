import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { SkillRequest } from '../types';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, ArrowDownLeft, ArrowUpRight, Star, Send, MessageSquare } from 'lucide-react';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState<SkillRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/requests/my');
      setIncoming(res.data.incoming);
      setOutgoing(res.data.outgoing);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      await api.put(`/requests/${id}/status`, { status: action === 'accept' ? 'accepted' : 'rejected' });
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.put(`/requests/${id}/complete`);
      toast.success('Exchange marked as complete!');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete exchange');
    }
  };

  const handleReview = async () => {
    if (!showReviewModal) return;
    try {
      await api.post('/reviews', { requestId: showReviewModal, rating: reviewData.rating, comment: reviewData.comment });
      setShowReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const requests = tab === 'incoming' ? incoming : outgoing;

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Requested', icon: Send },
      { key: 'accepted', label: 'Accepted', icon: CheckCircle },
      { key: 'completed', label: 'Completed', icon: Star },
    ];
    const statusOrder = ['pending', 'accepted', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    if (status === 'rejected' || status === 'cancelled') return null;
    return steps.map((step, i) => ({
      ...step,
      done: i <= currentIndex,
      active: i === currentIndex,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Skill Requests</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab('incoming')}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            tab === 'incoming' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Incoming ({incoming.length})
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            tab === 'outgoing' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Outgoing ({outgoing.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No {tab} requests</h3>
          <p className="text-gray-500">
            {tab === 'incoming' ? 'No one has requested to learn from you yet' : 'You haven\'t sent any requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const otherUser = tab === 'incoming' ? req.requester : req.provider;
            return (
              <div key={req._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {otherUser?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{otherUser?.name}</p>
                      <p className="text-sm text-gray-500">
                        {tab === 'incoming' ? 'wants to learn' : 'you requested'}{' '}
                        <span className="font-medium text-primary-600">{req.skillName}</span>
                      </p>
                      {req.message && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{req.message}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      req.status === 'completed' ? 'bg-primary-100 text-primary-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {req.status}
                    </span>

                    {tab === 'incoming' && req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(req._id, 'accept')}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'reject')}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              const otherUserId = tab === 'incoming' ? req.requester?._id : req.provider?._id;
                              if (!otherUserId) return;
                              const res = await api.post('/messages/conversations', { userId: otherUserId });
                              navigate(`/messages/${res.data.conversation._id}`);
                            } catch {
                              toast.error('Failed to start conversation');
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </button>
                        <button
                          onClick={() => handleComplete(req._id)}
                          className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      </>
                    )}

                    {req.status === 'completed' && (
                      <button
                        onClick={() => setShowReviewModal(req._id)}
                        className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" /> Review
                      </button>
                    )}
                  </div>
                </div>
                {/* Progress Tracker */}
                {(req.status === 'pending' || req.status === 'accepted' || req.status === 'completed') && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      {getProgressSteps(req.status)?.map((step, i, arr) => (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.done
                                ? step.active
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <step.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs mt-1 ${step.done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 -mt-4 ${
                              step.done && arr[i + 1]?.done ? 'bg-emerald-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setReviewData({ ...reviewData, rating: r })}
                    className="p-1"
                  >
                    <Star className={`w-8 h-8 ${r <= reviewData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                rows={3}
                placeholder="How was your experience?"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import type { SkillRequest, SkillListing } from '../types';
import toast from 'react-hot-toast';
import {
  BookOpen, Target, ArrowUpRight, ArrowDownLeft,
  Plus, TrendingUp, CheckCircle, Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<{ incoming: SkillRequest[]; outgoing: SkillRequest[] }>({ incoming: [], outgoing: [] });
  const [listings, setListings] = useState<SkillListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, listRes] = await Promise.all([
          api.get('/requests/my'),
          api.get('/skills/my'),
        ]);
        setRequests(reqRes.data);
        setListings(listRes.data.listings);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingIncoming = requests.incoming.filter(r => r.status === 'pending').length;
  const pendingOutgoing = requests.outgoing.filter(r => r.status === 'pending').length;
  const activeExchanges = [...requests.incoming, ...requests.outgoing].filter(r => r.status === 'accepted').length;
  const stats = [
    { label: 'Skills Listed', value: listings.length, icon: <BookOpen className="w-5 h-5" />, color: 'bg-primary-100 text-primary-700', link: '/marketplace' },
    { label: 'Incoming Requests', value: pendingIncoming, icon: <ArrowDownLeft className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700', link: '/requests' },
    { label: 'Outgoing Requests', value: pendingOutgoing, icon: <ArrowUpRight className="w-5 h-5" />, color: 'bg-violet-100 text-violet-700', link: '/requests' },
    { label: 'Active Exchanges', value: activeExchanges, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700', link: '/requests' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your skill exchanges</p>
        </div>
        <Link
          to="/skills/create"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Incoming Requests */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Incoming Requests</h2>
            <Link to="/requests" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {requests.incoming.slice(0, 5).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No incoming requests yet</p>
              </div>
            ) : (
              requests.incoming.slice(0, 5).map(req => (
                <div key={req._id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {req.requester?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.requester?.name}</p>
                      <p className="text-xs text-gray-500">wants to learn {req.skillName}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Listings</h2>
            <Link to="/marketplace" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {listings.slice(0, 5).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm mb-3">No listings yet</p>
                <Link to="/skills/create" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Create your first listing →
                </Link>
              </div>
            ) : (
              listings.slice(0, 5).map(listing => (
                <div key={listing._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{listing.skillName}</p>
                    <p className="text-xs text-gray-500">{listing.category} · {listing.experienceLevel}</p>
                  </div>
                  <div className="text-xs text-gray-500">{listing.views} views</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Exchanges */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Active Exchanges</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {[...requests.incoming, ...requests.outgoing]
              .filter(r => r.status === 'accepted')
              .slice(0, 5).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No active exchanges</p>
              </div>
            ) : (
              [...requests.incoming, ...requests.outgoing]
                .filter(r => r.status === 'accepted')
                .slice(0, 5)
                .map(req => (
                  <div key={req._id} className="px-6 py-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {req.skillName} with {req.requester?._id === user?._id ? req.provider?.name : req.requester?.name}
                      </p>
                      <p className="text-xs text-gray-500">Active since {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Completed Exchanges</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {[...requests.incoming, ...requests.outgoing]
              .filter(r => r.status === 'completed')
              .slice(0, 5).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No completed exchanges yet</p>
              </div>
            ) : (
              [...requests.incoming, ...requests.outgoing]
                .filter(r => r.status === 'completed')
                .slice(0, 5)
                .map(req => (
                  <div key={req._id} className="px-6 py-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {req.skillName}
                      </p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

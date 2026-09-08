import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import type { User, SkillListing } from '../types';
import toast from 'react-hot-toast';
import { Shield, Users, BookOpen, TrendingUp, Clock, Trash2, Search, UserCheck, UserX } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  interface AdminStats {
    totalUsers: number;
    totalListings: number;
    totalRequests: number;
    pendingRequests: number;
    completedExchanges: number;
    recentUsers: Pick<User, '_id' | 'name' | 'email' | 'createdAt'>[];
    categoryStats: { _id: string; count: number }[];
  }

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<(SkillListing & { user: Pick<User, '_id' | 'name' | 'email'> })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stats' | 'users' | 'listings'>('stats');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, listingsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/listings'),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
        setListings(listingsRes.data.listings);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      setListings(listings.filter(l => l._id !== id));
      toast.success('Listing deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole as 'user' | 'admin' } : u));
      toast.success(`User role changed to ${newRole}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Delete ${selectedUsers.size} user(s)?`)) return;
    try {
      await Promise.all(
        [...selectedUsers].map(id => api.delete(`/admin/users/${id}`))
      );
      setUsers(users.filter(u => !selectedUsers.has(u._id)));
      setSelectedUsers(new Set());
      toast.success(`${selectedUsers.size} user(s) deleted`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete users');
    }
  };

  const handleBulkDeleteListings = async () => {
    if (selectedListings.size === 0) return;
    if (!confirm(`Delete ${selectedListings.size} listing(s)?`)) return;
    try {
      await Promise.all(
        [...selectedListings].map(id => api.delete(`/admin/listings/${id}`))
      );
      setListings(listings.filter(l => !selectedListings.has(l._id)));
      setSelectedListings(new Set());
      toast.success(`${selectedListings.size} listing(s) deleted`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete listings');
    }
  };

  const toggleUserSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleListingSelect = (id: string) => {
    setSelectedListings(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredUsers = userSearch
    ? users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary-600" /> Admin Panel
      </h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(['stats', 'users', 'listings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
              {stats.recentUsers?.map((u) => (
                <div key={u._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              {stats.categoryStats?.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 capitalize">{cat._id?.replace(/-/g, ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            {selectedUsers.size > 0 && (
              <button
                onClick={handleBulkDeleteUsers}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete ({selectedUsers.size})
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={() => {
                        if (selectedUsers.size === filteredUsers.length) {
                          setSelectedUsers(new Set());
                        } else {
                          setSelectedUsers(new Set(filteredUsers.map(u => u._id)));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u._id} className={selectedUsers.has(u._id) ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u._id)}
                        onChange={() => toggleUserSelect(u._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                        >
                          {u.role === 'admin' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'listings' && (
        <>
          {selectedListings.size > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleBulkDeleteListings}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete ({selectedListings.size})
              </button>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedListings.size === listings.length && listings.length > 0}
                      onChange={() => {
                        if (selectedListings.size === listings.length) {
                          setSelectedListings(new Set());
                        } else {
                          setSelectedListings(new Set(listings.map(l => l._id)));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map(l => (
                  <tr key={l._id} className={selectedListings.has(l._id) ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedListings.has(l._id)}
                        onChange={() => toggleListingSelect(l._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{l.skillName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{l.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{l.category?.replace(/-/g, ' ')}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteListing(l._id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

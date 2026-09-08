import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import type { User, Review, SkillListing } from '../types';
import toast from 'react-hot-toast';
import { Star, MapPin, Clock, Edit3, Save, Plus, Trash2, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listings, setListings] = useState<SkillListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwn = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, reviewsRes, listingsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`),
          api.get(`/skills?user=${id}`),
        ]);
        setProfile(profileRes.data.user);
        setReviews(reviewsRes.data.reviews);
        setListings(listingsRes.data.listings);
        setEditForm(profileRes.data.user);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await api.put('/auth/me', {
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        availability: editForm.availability,
        skillsTeach: editForm.skillsTeach,
        skillsWant: editForm.skillsWant,
      });
      setProfile(res.data.user);
      if (isOwn) updateUser(res.data.user);
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
    }
  };

  const addTeachSkill = () => {
    setEditForm({
      ...editForm,
      skillsTeach: [...(editForm.skillsTeach || []), { name: '', category: 'programming', experienceLevel: 'intermediate' as const, description: '' }]
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data.user);
      setEditForm({ ...editForm, avatar: res.data.avatar });
      if (isOwn) updateUser(res.data.user);
      toast.success('Avatar updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const addWantSkill = () => {
    setEditForm({
      ...editForm,
      skillsWant: [...(editForm.skillsWant || []), { name: '', category: 'programming', experienceLevel: 'beginner' as const }]
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h2>
        <Link to="/marketplace" className="text-primary-600 hover:text-primary-700">← Back to marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 h-32" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-primary-700 overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              {isOwn && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                {profile.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{profile.averageRating}</span>
                    <span>({profile.totalReviews} reviews)</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="capitalize">{profile.availability}</span>
                </div>
              </div>
            </div>
            {isOwn && (
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                {editing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">About</h2>
            {editing ? (
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                rows={4}
                placeholder="Tell others about yourself..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {profile.bio || 'No bio yet.'}
              </p>
            )}
          </div>

          {/* Skills to Teach */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Skills I Teach</h2>
              {editing && (
                <button onClick={addTeachSkill} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-3">
                {(editForm.skillsTeach ?? []).map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={skill.name}
                      onChange={(e) => {
                        const updated = [...(editForm.skillsTeach ?? [])];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setEditForm({ ...editForm, skillsTeach: updated });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Skill name"
                    />
                    <select
                      value={skill.category}
                      onChange={(e) => {
                        const updated = [...(editForm.skillsTeach ?? [])];
                        updated[i] = { ...updated[i], category: e.target.value };
                        setEditForm({ ...editForm, skillsTeach: updated });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="languages">Languages</option>
                      <option value="music">Music</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditForm({ ...editForm, skillsTeach: (editForm.skillsTeach ?? []).filter((_: any, j: number) => j !== i) });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skillsTeach && profile.skillsTeach.length > 0 ? (
                  profile.skillsTeach.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                      {skill.name}
                      <span className="text-emerald-500 ml-1 text-xs capitalize">({skill.experienceLevel})</span>
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed yet</p>
                )}
              </div>
            )}
          </div>

          {/* Skills to Learn */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Skills I Want to Learn</h2>
              {editing && (
                <button onClick={addWantSkill} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-3">
                {(editForm.skillsWant ?? []).map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={skill.name}
                      onChange={(e) => {
                        const updated = [...(editForm.skillsWant ?? [])];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setEditForm({ ...editForm, skillsWant: updated });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Skill name"
                    />
                    <button
                      onClick={() => {
                        setEditForm({ ...editForm, skillsWant: (editForm.skillsWant ?? []).filter((_: any, j: number) => j !== i) });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skillsWant && profile.skillsWant.length > 0 ? (
                  profile.skillsWant.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium">
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No learning goals yet</p>
                )}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                        {review.reviewer?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{review.reviewer?.name}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">for {review.skillName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Active Listings</h3>
            {listings.length === 0 ? (
              <p className="text-gray-500 text-sm">No active listings</p>
            ) : (
              <div className="space-y-2">
                {listings.slice(0, 5).map(listing => (
                  <Link
                    key={listing._id}
                    to={`/skills/${listing._id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{listing.skillName}</p>
                    <p className="text-xs text-gray-500">{listing.category}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {editing && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Your location"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

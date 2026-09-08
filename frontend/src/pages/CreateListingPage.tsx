import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CATEGORIES, EXPERIENCE_LEVELS } from '../types';
import { ArrowLeft, Plus, X } from 'lucide-react';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    skillName: '',
    description: '',
    category: 'programming',
    experienceLevel: 'intermediate',
    teachingFormat: 'both',
    availability: 'flexible',
    whatToExpect: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/skills', { ...form, tags });
      navigate(`/skills/${res.data.listing._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Skill Listing</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Name *</label>
            <input
              type="text"
              required
              value={form.skillName}
              onChange={(e) => setForm({ ...form, skillName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., React.js, Guitar, Spanish"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              rows={4}
              placeholder="Describe your skill and how you teach it..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Experience Level *</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {EXPERIENCE_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teaching Format</label>
              <select
                value={form.teachingFormat}
                onChange={(e) => setForm({ ...form, teachingFormat: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What Learners Can Expect</label>
            <textarea
              value={form.whatToExpect}
              onChange={(e) => setForm({ ...form, whatToExpect: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              rows={3}
              placeholder="Describe what someone will learn from you..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="Add a tag and press Enter"
              />
              <button type="button" onClick={addTag} className="px-3 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                    {tag} <X className="w-3 h-3 cursor-pointer hover:text-primary-900" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

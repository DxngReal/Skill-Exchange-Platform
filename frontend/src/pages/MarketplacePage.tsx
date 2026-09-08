import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { SkillListing } from '../types';
import { CATEGORIES, EXPERIENCE_LEVELS } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import { Search, Filter, Star, X, Eye } from 'lucide-react';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<SkillListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');
  const [format, setFormat] = useState(searchParams.get('format') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const debouncedSearch = useDebounce(searchInput, 300);

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (category) params.set('category', category);
      if (level) params.set('experienceLevel', level);
      if (format) params.set('teachingFormat', format);
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await api.get(`/skills?${params}`);
      setListings(res.data.listings);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, level, format, sort]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger immediate search on form submit
    fetchListings(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setCategory('');
    setLevel('');
    setFormat('');
    setSort('newest');
    setSearchParams({});
  };

  const hasFilters = category || level || format || searchInput;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Marketplace</h1>
        <p className="text-gray-600">Discover skills to learn from talented people</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search skills, topics, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-lg font-medium flex items-center gap-2 transition-colors ${
              hasFilters ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Levels</option>
                {EXPERIENCE_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Format</label>
              <select
                value={format}
                onChange={(e) => { setFormat(e.target.value); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Formats</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active:</span>
            {searchInput && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                "{searchInput}" <X className="w-3 h-3 cursor-pointer" onClick={() => { setSearchInput(''); }} />
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {CATEGORIES.find(c => c.value === category)?.label} <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('')} />
              </span>
            )}
            {level && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {EXPERIENCE_LEVELS.find(l => l.value === level)?.label} <X className="w-3 h-3 cursor-pointer" onClick={() => setLevel('')} />
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 ml-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">{pagination.total} listing{pagination.total !== 1 ? 's' : ''} found</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Viewed</option>
          <option value="interested">Most Interested</option>
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No listings found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="text-primary-600 font-medium text-sm hover:text-primary-700">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(listing => {
              const user = listing.user as any;
              return (
                <Link
                  key={listing._id}
                  to={`/skills/${listing._id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {listing.skillName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Unknown'}</p>
                        {user?.averageRating > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-gray-500">{user.averageRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Eye className="w-3 h-3" />
                      {listing.views}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchListings(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { Sparkles, ArrowRight, Star, MapPin } from 'lucide-react';

interface MatchResult extends User {
  matchScore: number;
  matchDetails: { type: string; skill: string }[];
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matching');
        setMatches(res.data.matches);
        setTotal(res.data.totalMatches);
      } catch {
        toast.error('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          Recommended Matches
        </h1>
        <p className="text-gray-600 mt-1">
          People who can teach you what you want to learn, and want to learn what you can teach
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No matches found</h3>
          <p className="text-gray-500 mb-4">
            Add skills to your profile to get matched with other users
          </p>
          <Link to="/profile/me" className="text-primary-600 font-medium text-sm hover:text-primary-700">
            Update your profile →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} match{total !== 1 ? 'es' : ''} found</p>
          <div className="grid md:grid-cols-2 gap-5">
            {matches.map(match => (
              <div key={match._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <Link to={`/profile/${match._id}`} className="flex items-center gap-3 hover:opacity-80">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-bold text-primary-700">
                      {match.avatar ? (
                        <img src={match.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        match.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{match.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {match.averageRating > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{match.averageRating}</span>
                          </div>
                        )}
                        {match.location && (
                          <div className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{match.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold">
                    {match.matchScore} pts
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {match.matchDetails.filter(d => d.type === 'can_teach').length > 0 && (
                    <div>
                      <p className="text-xs text-emerald-600 font-medium mb-1.5">Can teach you:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.matchDetails.filter(d => d.type === 'can_teach').map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                            {d.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.matchDetails.filter(d => d.type === 'wants_to_learn').length > 0 && (
                    <div>
                      <p className="text-xs text-violet-600 font-medium mb-1.5">Wants to learn from you:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.matchDetails.filter(d => d.type === 'wants_to_learn').map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs font-medium">
                            {d.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/profile/${match._id}`}
                    className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/marketplace?user=${match._id}`}
                    className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-1"
                  >
                    See Listings <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

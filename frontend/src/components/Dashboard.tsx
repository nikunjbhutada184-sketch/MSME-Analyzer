import { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, MapPin, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import MapChart from './MapChart';

// Mock types
type DistrictData = {
  district: string;
  count: number;
  competition_level: string;
};

type MatchedDescription = {
  description: string;
  score: number;
};

type Summary = {
  business_idea: string;
  total_similar: number;
  num_districts: number;
  highest_competition: string;
  lowest_competition: string;
};

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [matches, setMatches] = useState<MatchedDescription[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8000/api/analyze?query=${encodeURIComponent(query)}`);
      setSummary(response.data.summary);
      setDistricts(response.data.districts);
      setMatches(response.data.matched_descriptions);
    } catch (err) {
      setError('Failed to fetch data. Ensure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            MSME Analyzer
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Analyze business competition across Maharashtra using Udyam/MSME registration data.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your business idea
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. Bakery, Restaurant, Clothing Store..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Competition'}
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-600 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {summary && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm font-medium text-gray-500">Business Idea</p>
                <p className="mt-2 text-2xl font-semibold capitalize">{summary.business_idea}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total Similar MSMEs</p>
                <p className="mt-2 text-2xl font-semibold text-blue-600">{summary.total_similar.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm font-medium text-gray-500">Highest Competition</p>
                <p className="mt-2 text-2xl font-semibold text-red-600 flex items-center gap-1">
                  <TrendingUp className="w-5 h-5" /> {summary.highest_competition}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm font-medium text-gray-500">Districts Analyzed</p>
                <p className="mt-2 text-2xl font-semibold text-green-600 flex items-center gap-1">
                  <MapPin className="w-5 h-5" /> {summary.num_districts}
                </p>
              </div>
            </div>

            {/* Explanation Section */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Why were these businesses considered similar?</h3>
              <p className="text-sm text-blue-800 mb-4">
                We used AI text-matching to find MSME registrations with similar activities. The top matched activities are:
              </p>
              <div className="flex flex-wrap gap-2">
                {matches.map((m, idx) => (
                  <span key={idx} className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 shadow-sm">
                    {m.description}
                  </span>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Map */}
              <div className="lg:col-span-2">
                <MapChart districts={districts} />
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-semibold mb-6">Top 10 Districts by Competition</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districts.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="district" angle={-45} textAnchor="end" height={60} fontSize={12} />
                      <YAxis fontSize={12} />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                <h3 className="font-semibold mb-4">District-wise Competition Table</h3>
                <div className="flex-1 overflow-auto max-h-[300px]">
                  <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">District</th>
                        <th className="px-4 py-3 text-right">Similar MSMEs</th>
                        <th className="px-4 py-3">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districts.map((d, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">#{idx + 1}</td>
                          <td className="px-4 py-3">{d.district}</td>
                          <td className="px-4 py-3 text-right font-medium">{d.count.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              d.competition_level === 'High' ? 'bg-red-100 text-red-700' :
                              d.competition_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {d.competition_level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

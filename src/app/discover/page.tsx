'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface Match {
  userId: string;
  score: number;
  username: string;
}

export default function DiscoverPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await fetch('/api/discover');
      if (res.ok) {
        setMatches(await res.json());
      }
      setLoading(false);
    };
    fetchMatches();
  }, []);

  const handleConnect = async (targetUserId: string) => {
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    });

    if (res.ok) {
      setSentRequests(new Set(sentRequests).add(targetUserId));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Discover Your Matches</h1>
      {loading ? (
        <p>Finding your matches...</p>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.userId} className="p-6 border rounded-lg shadow-md bg-white flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{match.username}</h2>
                <p className="mt-2 text-gray-600">Compatibility Score: <span className="font-bold text-indigo-600">{match.score}</span></p>
              </div>
              <Button 
                onClick={() => handleConnect(match.userId)}
                disabled={sentRequests.has(match.userId)}
                className="mt-4 w-full"
              >
                {sentRequests.has(match.userId) ? 'Request Sent' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p>No matches found yet. Add more interests to your profile!</p>
      )}
    </div>
  );
}

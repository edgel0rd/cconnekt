'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Connection { id: number; status: 'pending' | 'accepted'; userOne: { username: string }; userTwo: { username: string }; userOneId: string; userTwoId: string; }

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await fetch('/api/auth/user');
      if (userRes.ok) {
        const { user } = await userRes.json();
        setCurrentUserId(user.id);
      }
      const connRes = await fetch('/api/connections');
      if (connRes.ok) {
        setConnections(await connRes.json());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAccept = async (connectionId: number) => {
    const res = await fetch('/api/connections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectionId }) });
    if (res.ok) {
      setConnections(connections.map(c => c.id === connectionId ? { ...c, status: 'accepted' } : c));
    }
  };

  const pendingRequests = connections.filter(c => c.status === 'pending' && c.userTwoId === currentUserId);
  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Your Connections</h1>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
            {pendingRequests.length > 0 ? (
              <ul className="space-y-4">
                {pendingRequests.map(req => (
                  <li key={req.id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                    <span>{req.userOne.username} wants to connect.</span>
                    <Button onClick={() => handleAccept(req.id)}>Accept</Button>
                  </li>
                ))}
              </ul>
            ) : <p>No pending requests.</p>}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Friends</h2>
            {acceptedConnections.length > 0 ? (
              <ul className="space-y-4">
                {acceptedConnections.map(conn => (
                  <li key={conn.id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                    <span>{conn.userOneId === currentUserId ? conn.userTwo.username : conn.userOne.username}</span>
                    <Link href={`/chat/${conn.id}`} passHref>
                      <Button variant="outline">Chat</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p>No friends yet. Go discover some people!</p>}
          </div>
        </div>
      )}
    </div>
  );
}

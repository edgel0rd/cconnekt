'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// --- TYPE DEFINITIONS ---
interface Movie { id: number; title: string; }
interface Artist { id: number; name: string; }
interface Venue { id: number; name: string; }
interface User { username: string; email: string; }

// --- HELPER COMPONENT for Interest Sections ---
const InterestSection = ({ title, items, onAddItem, placeholder }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('itemName') as string;
    const success = await onAddItem(name);
    if (success) {
      (e.target as HTMLFormElement).reset();
    } else {
      setError('Failed to add item.');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Your {title}</h2>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-2">
        <Input name="itemName" type="text" placeholder={placeholder} required />
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="p-2 border rounded-md">{item.name || item.title}</li>
        ))}
      </ul>
    </div>
  );
};

// --- MAIN PROFILE PAGE ---
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAllData = async () => {
      const userRes = await fetch('/api/auth/user');
      if (!userRes.ok) return router.push('/login');
      const { user } = await userRes.json();
      setUser(user);

      const [moviesRes, artistsRes, venuesRes] = await Promise.all([
        fetch('/api/interests/movies'),
        fetch('/api/interests/artists'),
        fetch('/api/interests/venues'),
      ]);

      if (moviesRes.ok) setMovies(await moviesRes.json());
      if (artistsRes.ok) setArtists(await artistsRes.json());
      if (venuesRes.ok) setVenues(await venuesRes.json());
    };
    fetchAllData();
  }, [router]);

  // --- HANDLER FUNCTIONS ---
  const addItem = (url: string, setter: Function, currentItems: any[], propName: string) => async (value: string) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [propName]: value }),
    });
    if (res.ok) {
      const newItem = await res.json();
      setter([...currentItems, newItem]);
      return true;
    }
    return false;
  };

  if (!user) return <div>Loading...</div>;

  // --- RENDER ---
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InterestSection title="Movies" items={movies} onAddItem={addItem('/api/interests/movies', setMovies, movies, 'title')} placeholder="Add a movie title..." />
        <InterestSection title="Artists" items={artists} onAddItem={addItem('/api/interests/artists', setArtists, artists, 'name')} placeholder="Add an artist name..." />
        <InterestSection title="Venues" items={venues} onAddItem={addItem('/api/interests/venues', setVenues, venues, 'name')} placeholder="Add a venue name..." />
      </div>
    </div>
  );
}

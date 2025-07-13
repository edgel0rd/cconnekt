'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Message {
  id: number;
  content: string;
  userId: string;
  createdAt: string;
}

export default function ChatPage({ params }: { params: { connectionId: string } }) {
  const { connectionId } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/user');
      if (res.ok) {
        const { user } = await res.json();
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!connectionId) return;
      const res = await fetch(`/api/chat/${connectionId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    };
    fetchMessages();
    
    // Optional: Set up polling for real-time updates
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [connectionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !connectionId) return;

    const res = await fetch(`/api/chat/${connectionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      const addedMessage = await res.json();
      setMessages([...messages, addedMessage]);
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="flex-grow overflow-y-auto p-4 border rounded-lg bg-gray-50 mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg my-1 ${msg.userId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <p>{msg.content}</p>
              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
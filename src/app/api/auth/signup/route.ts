import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  try {
    await db.insert(users).values({
      id: userId,
      username,
      email,
      hashedPassword,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res.setHeader('Set-Cookie', sessionCookie.serialize());
    return res.status(201).json({ success: true });
  } catch (e) {
    // TODO: check for unique constraint violation
    return res.status(500).json({ error: 'An error occurred' });
  }
}

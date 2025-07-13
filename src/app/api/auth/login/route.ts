import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Argon2id } from 'oslo/password';
import { eq } from 'drizzle-orm';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const validPassword = await new Argon2id().verify(
    existingUser.hashedPassword,
    password
  );

  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  res.setHeader('Set-Cookie', sessionCookie.serialize());
  return res.status(200).json({ success: true });
}

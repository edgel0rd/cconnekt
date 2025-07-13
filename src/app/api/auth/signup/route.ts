import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
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

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    // Check for unique constraint violation
    if (e && typeof e === 'object' && 'code' in e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
       return new Response(JSON.stringify({ error: 'Username or email already taken' }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500 });
  }
}

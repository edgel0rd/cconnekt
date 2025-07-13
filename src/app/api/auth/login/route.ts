import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Argon2id } from 'oslo/password';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser || !existingUser.hashedPassword) {
    // NOTE: Important to await here to prevent timing attacks.
    await new Argon2id().verify('', 'anything');
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 400 });
  }

  const validPassword = await new Argon2id().verify(
    existingUser.hashedPassword,
    password
  );

  if (!validPassword) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 400 });
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

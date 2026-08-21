'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  SESSION_COOKIE,
} from '@/app/lib/auth-constants';

export type LoginState = {
  error?: string | null;
};

export async function authenticate(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { error: 'Invalid credentials.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, DEMO_EMAIL, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}

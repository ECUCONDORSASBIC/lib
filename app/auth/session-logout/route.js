import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('[API session-logout] Attempting to clear authToken cookie.');

    // Clear the authToken cookie
    cookies().set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1, // Expire the cookie immediately
      path: '/',
      sameSite: 'lax',
    });

    console.log('[API session-logout] authToken cookie cleared.');
    return NextResponse.json({ success: true, message: 'Session cookie cleared.' });

  } catch (error) {
    console.error('[API session-logout] Error:', error);
    return NextResponse.json({ error: 'Failed to clear session cookie.', details: error.message }, { status: 500 });
  }
}
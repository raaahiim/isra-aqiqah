import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !adminPassword) {
  throw new Error('Missing admin environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function isAuthorized(request: Request) {
  const password = request.headers.get('x-admin-password');
  return password === adminPassword;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin fetch error:', error);

    return NextResponse.json(
      { error: 'Could not load RSVPs.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ rsvps: data });
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const id = String(body.id || '');
    const checkedIn = Boolean(body.checkedIn);

    if (!id) {
      return NextResponse.json({ error: 'Missing RSVP id.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('rsvps')
      .update({
        checked_in: checkedIn,
        checked_in_at: checkedIn ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      console.error('Check-in update error:', error);

      return NextResponse.json(
        { error: 'Could not update check-in status.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH admin RSVP error:', error);

    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
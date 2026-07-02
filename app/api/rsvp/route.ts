import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const attending = body.attending === 'yes';
    const adults = Number(body.adults);
    const children = Number(body.children);
    const notes = String(body.notes || '').trim();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required.' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (Number.isNaN(adults) || Number.isNaN(children)) {
      return NextResponse.json(
        { error: 'Adults and children must be valid numbers.' },
        { status: 400 }
      );
    }

    if (adults < 0 || children < 0) {
      return NextResponse.json(
        { error: 'Adults and children cannot be negative.' },
        { status: 400 }
      );
    }

    if (attending && adults + children < 1) {
      return NextResponse.json(
        { error: 'Please enter at least one guest.' },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from('rsvps').insert({
      full_name: fullName,
      email,
      phone,
      attending,
      adults,
      children,
      notes: notes || null,
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);

      return NextResponse.json(
        {
          error: 'Could not save RSVP. Please try again.',
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    if (resend) {
      try {
        const safeName = escapeHtml(fullName);
        const guestText = attending
          ? `We have recorded your RSVP for ${adults} adult(s) and ${children} child(ren).`
          : 'We are sorry you cannot make it, but thank you for letting us know.';

        await resend.emails.send({
          from: 'Isra Khalid Aqiqah <onboarding@resend.dev>',
          to: email,
          subject: "RSVP Confirmation for Isra Khalid's Aqiqah",
          html: `
            <div style="font-family: Arial, sans-serif; background: #fff7f8; padding: 24px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #edc8d1; border-radius: 24px; padding: 28px;">
                <p style="font-size: 14px; letter-spacing: 3px; color: #9a6a75; text-transform: uppercase; font-weight: bold; margin: 0 0 12px;">
                  RSVP Confirmation
                </p>

                <h1 style="color: #7c4a59; font-size: 32px; margin: 0 0 16px;">
                  Isra Khalid's Aqiqah
                </h1>

                <p style="color: #6f4f59; font-size: 16px; line-height: 1.7; margin: 0 0 12px;">
                  Thank you for your RSVP, ${safeName}.
                </p>

                <p style="color: #6f4f59; font-size: 16px; line-height: 1.7; margin: 0 0 18px;">
                  ${guestText}
                </p>

                <div style="background: #fff3f5; border-radius: 18px; padding: 18px; margin: 22px 0; color: #5d3b46;">
                  <p style="margin: 0 0 8px;"><strong>Date:</strong> Saturday, July 25th, 2026</p>
                  <p style="margin: 0 0 8px;"><strong>Time:</strong> 6:00 PM</p>
                  <p style="margin: 0;"><strong>Venue:</strong> Medina Activity Center, 1905 S Haggerty Rd, Canton</p>
                </div>

                <p style="color: #9a6a75; font-size: 14px; line-height: 1.6; margin: 0;">
                  This is an automated confirmation email.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RSVP API error:', error);

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
'use client';

import type { FormEvent, MouseEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Baby,
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';

const eventDate = new Date('2026-07-25T18:00:00-04:00');

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const difference = eventDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setTimeLeft(getTimeLeft());

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  function handleConfetti(event: MouseEvent<HTMLElement>) {
    const target = event.target;

    if (target instanceof HTMLElement) {
      const tagName = target.tagName.toLowerCase();

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        tagName === 'button' ||
        tagName === 'a'
      ) {
        return;
      }
    }

    confetti({
      particleCount: 90,
      spread: 85,
      startVelocity: 35,
      origin: {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      },
      colors: ['#f7b7c8', '#d9a7b0', '#fff1f4', '#b88692', '#ffffff'],
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError('');

    const formData = new FormData(event.currentTarget);

    const payload = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      attending: formData.get('attending'),
      adults: formData.get('adults'),
      children: formData.get('children'),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not submit RSVP.');
      }

      confetti({
        particleCount: 180,
        spread: 120,
        startVelocity: 45,
        origin: {
          x: 0.5,
          y: 0.7,
        },
        colors: ['#f7b7c8', '#d9a7b0', '#fff1f4', '#b88692', '#ffffff'],
      });

      setSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Could not submit RSVP. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      onClick={handleConfetti}
      className="min-h-screen overflow-hidden bg-[#fff7f8] text-[#4d2f3a]"
    >
      <section className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#fbd7df_0%,transparent_28%),radial-gradient(circle_at_bottom_right,#f3c6d0_0%,transparent_30%)]" />

        <div className="pointer-events-none absolute left-6 top-20 text-4xl opacity-50 floaty">
          🦋
        </div>

        <div className="pointer-events-none absolute right-8 top-32 text-3xl opacity-40 floaty-delay">
          ✨
        </div>

        <div className="pointer-events-none absolute bottom-24 left-10 text-3xl opacity-40 floaty">
          🌸
        </div>

        <div className="pointer-events-none absolute bottom-32 right-12 text-4xl opacity-50 floaty-delay">
          🦋
        </div>

        <div className="relative w-full max-w-5xl">
          <div className="rounded-[2.5rem] border border-white/70 bg-white/65 p-4 shadow-2xl shadow-pink-200/60 backdrop-blur-xl md:p-8">
            <div className="rounded-[2rem] border border-[#edc8d1] bg-[#fffafb] p-6 md:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8bdc8] bg-white px-4 py-2 text-sm font-medium text-[#8a5966] shadow-sm">
                  <Sparkles size={16} />
                  You are invited
                </div>

                <p className="mb-4 text-3xl font-semibold tracking-wide text-[#6a3f4c] md:text-5xl">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>

                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#9a6a75]">
                  Please join us for the Aqiqah of
                </p>

                <h1 className="mt-5 font-serif text-6xl italic leading-tight text-[#7c4a59] md:text-8xl">
                  Isra Khalid
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#7b5a63] md:text-lg">
                  With love and gratitude, we invite you to celebrate this
                  special blessing with our family.
                </p>

                <div className="mt-9 grid gap-4 md:grid-cols-3">
                  <InfoCard
                    icon={<CalendarDays size={22} />}
                    title="Date"
                    value="Saturday, July 25th, 2026"
                  />

                  <InfoCard
                    icon={<Clock size={22} />}
                    title="Time"
                    value="6:00 PM"
                  />

                  <InfoCard
                    icon={<MapPin size={22} />}
                    title="Venue"
                    value="Medina Activity Center"
                  />
                </div>

                <div className="mt-8 rounded-3xl border border-[#eecbd3] bg-white/80 p-5">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#9a6a75]">
                    Countdown
                  </p>

                  <div className="grid grid-cols-4 gap-3">
                    <CountdownBox label="Days" value={timeLeft?.days} />
                    <CountdownBox label="Hours" value={timeLeft?.hours} />
                    <CountdownBox label="Minutes" value={timeLeft?.minutes} />
                    <CountdownBox label="Seconds" value={timeLeft?.seconds} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="#rsvp"
                    className="rounded-full bg-[#b98291] px-9 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-[#a86f80]"
                  >
                    RSVP Now
                  </a>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=1905%20S%20Haggerty%20Rd%2C%20Canton%2C%20MI"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#d8aeb9] bg-white px-9 py-4 text-lg font-semibold text-[#8a5966] transition hover:-translate-y-0.5 hover:bg-[#fff0f3]"
                  >
                    Get Directions
                  </a>
                </div>

                <p className="mt-5 text-sm text-[#9a6a75]">
                  Tap anywhere on the invitation for a little sparkle ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[#edc8d1] bg-white/75 p-7 shadow-xl shadow-pink-100">
            <div className="mb-5 inline-flex rounded-2xl bg-[#fff0f3] p-3 text-[#9a6a75]">
              <Baby size={30} />
            </div>

            <h2 className="font-serif text-4xl text-[#7c4a59]">
              Event Details
            </h2>

            <div className="mt-6 space-y-5 text-[#6f4f59]">
              <DetailRow
                icon={<CalendarDays size={20} />}
                label="Date"
                value="Saturday, July 25th, 2026"
              />

              <DetailRow
                icon={<Clock size={20} />}
                label="Time"
                value="6:00 PM"
              />

              <DetailRow
                icon={<MapPin size={20} />}
                label="Address"
                value="Medina Activity Center, 1905 S Haggerty Rd, Canton"
              />

              <DetailRow
                icon={<Users size={20} />}
                label="Guests"
                value="Please RSVP with adults and children attending."
              />
            </div>

            
          </div>

          <div
            id="rsvp"
            className="rounded-[2rem] border border-[#edc8d1] bg-white p-7 shadow-xl shadow-pink-100"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9a6a75]">
                RSVP
              </p>

              <h2 className="mt-2 font-serif text-4xl text-[#7c4a59]">
                Will you be joining us?
              </h2>
            </div>

            {submitted ? (
              <div className="rounded-3xl border border-[#edc8d1] bg-[#fff7f8] p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                  💌
                </div>

                <h3 className="font-serif text-3xl text-[#7c4a59]">
                  Thank you for your RSVP
                </h3>

                <p className="mt-3 leading-7 text-[#7b5a63]">
                  Your RSVP has been received. We look forward to celebrating
                  with you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6f4f59]">
                    Full Name
                  </label>

                  <input
                    required
                    name="fullName"
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6f4f59]">
                      <Mail size={16} />
                      Email
                    </label>

                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6f4f59]">
                      <Phone size={16} />
                      Phone
                    </label>

                    <input
                      required
                      name="phone"
                      placeholder="Phone number"
                      className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6f4f59]">
                    Attendance
                  </label>

                  <select
                    required
                    name="attending"
                    defaultValue="yes"
                    className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                  >
                    <option value="yes">Yes, we will attend</option>
                    <option value="no">Sorry, we cannot attend</option>
                  </select>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#6f4f59]">
                      Adults
                    </label>

                    <input
                      required
                      min="0"
                      defaultValue="1"
                      type="number"
                      name="adults"
                      className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#6f4f59]">
                      Children
                    </label>

                    <input
                      required
                      min="0"
                      defaultValue="0"
                      type="number"
                      name="children"
                      className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6f4f59]">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Optional"
                    className="w-full resize-none rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
                  />
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-[#b98291] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-[#a86f80] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[#eecbd3] bg-white/80 p-5 text-left shadow-sm">
      <div className="mb-3 inline-flex rounded-2xl bg-[#fff0f3] p-3 text-[#9a6a75]">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9a6a75]">
        {title}
      </p>

      <p className="mt-2 font-semibold text-[#5d3b46]">{value}</p>
    </div>
  );
}

function CountdownBox({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  const displayValue =
    typeof value === 'number' ? value.toString().padStart(2, '0') : '--';

  return (
    <div className="rounded-2xl bg-[#fff0f3] p-3">
      <p className="text-2xl font-bold text-[#7c4a59] md:text-3xl">
        {displayValue}
      </p>

      <p className="text-xs font-semibold uppercase tracking-wider text-[#9a6a75]">
        {label}
      </p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 text-[#9a6a75]">{icon}</div>

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a6a75]">
          {label}
        </p>

        <p className="mt-1 font-medium">{value}</p>
      </div>
    </div>
  );
}
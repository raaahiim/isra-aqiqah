'use client';

import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Baby,
  CheckCircle2,
  LogIn,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';

type Rsvp = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  attending: boolean;
  adults: number;
  children: number;
  guest_names: string | null;
  notes: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [savedPassword, setSavedPassword] = useState('');
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  const stats = useMemo(() => {
    const attendingRows = rsvps.filter((rsvp) => rsvp.attending);
    const declinedRows = rsvps.filter((rsvp) => !rsvp.attending);
    const checkedInRows = rsvps.filter(
      (rsvp) => rsvp.attending && rsvp.checked_in
    );

    const adults = attendingRows.reduce((sum, rsvp) => sum + rsvp.adults, 0);

    const children = attendingRows.reduce(
      (sum, rsvp) => sum + rsvp.children,
      0
    );

    const checkedInGuests = checkedInRows.reduce(
      (sum, rsvp) => sum + rsvp.adults + rsvp.children,
      0
    );

    return {
      totalRsvps: rsvps.length,
      attendingPeople: adults + children,
      adults,
      children,
      declined: declinedRows.length,
      checkedInGuests,
    };
  }, [rsvps]);

  async function loadRsvps(passwordToUse = savedPassword) {
    if (!passwordToUse) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/rsvps', {
        headers: {
          'x-admin-password': passwordToUse,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not load RSVPs.');
      }

      setRsvps(result.rsvps);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Could not load RSVPs.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavedPassword(password);
    window.sessionStorage.setItem('isra-admin-password', password);
    loadRsvps(password);
  }

  function handleLogout() {
    setPassword('');
    setSavedPassword('');
    setRsvps([]);
    setError('');
    window.sessionStorage.removeItem('isra-admin-password');
  }

  async function toggleCheckIn(rsvp: Rsvp) {
    setUpdatingId(rsvp.id);
    setError('');

    try {
      const response = await fetch('/api/admin/rsvps', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': savedPassword,
        },
        body: JSON.stringify({
          id: rsvp.id,
          checkedIn: !rsvp.checked_in,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not update RSVP.');
      }

      setRsvps((currentRsvps) =>
        currentRsvps.map((item) =>
          item.id === rsvp.id
            ? {
                ...item,
                checked_in: !item.checked_in,
                checked_in_at: !item.checked_in
                  ? new Date().toISOString()
                  : null,
              }
            : item
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Could not update RSVP.');
      }
    } finally {
      setUpdatingId('');
    }
  }

  useEffect(() => {
    const existingPassword = window.sessionStorage.getItem(
      'isra-admin-password'
    );

    if (existingPassword) {
      setPassword(existingPassword);
      setSavedPassword(existingPassword);
      loadRsvps(existingPassword);
    }
  }, []);

  if (!savedPassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7f8] px-5 text-[#4d2f3a]">
        <div className="w-full max-w-md rounded-[2rem] border border-[#edc8d1] bg-white p-8 shadow-2xl shadow-pink-100">
          <div className="mb-6 inline-flex rounded-2xl bg-[#fff0f3] p-3 text-[#9a6a75]">
            <LogIn size={28} />
          </div>

          <h1 className="font-serif text-4xl text-[#7c4a59]">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#7b5a63]">
            Enter the admin password to view RSVPs for Isra Khalid&apos;s
            Aqiqah.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
              className="w-full rounded-2xl border border-[#e5bdc7] bg-[#fffafb] px-4 py-3 outline-none transition focus:border-[#b98291] focus:ring-4 focus:ring-pink-100"
            />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#b98291] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-[#a86f80]"
            >
              Open Dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7f8] px-5 py-8 text-[#4d2f3a]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-[#edc8d1] bg-white p-6 shadow-xl shadow-pink-100 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9a6a75]">
              Isra Khalid&apos;s Aqiqah
            </p>

            <h1 className="mt-2 font-serif text-4xl text-[#7c4a59]">
              RSVP Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#7b5a63]">
              View guests and check people in on the event day.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => loadRsvps()}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8aeb9] bg-white px-5 py-3 font-semibold text-[#8a5966] transition hover:bg-[#fff0f3] disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={isLoading ? 'animate-spin' : ''}
              />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-[#fff0f3] px-5 py-3 font-semibold text-[#8a5966] transition hover:bg-[#f8dce4]"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            icon={<Users size={22} />}
            label="RSVP Entries"
            value={stats.totalRsvps}
          />

          <StatCard
            icon={<Users size={22} />}
            label="Total Guests"
            value={stats.attendingPeople}
          />

          <StatCard
            icon={<Users size={22} />}
            label="Adults"
            value={stats.adults}
          />

          <StatCard
            icon={<Baby size={22} />}
            label="Children"
            value={stats.children}
          />

          <StatCard
            icon={<XCircle size={22} />}
            label="Declined"
            value={stats.declined}
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="Checked In"
            value={stats.checkedInGuests}
          />
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-[#edc8d1] bg-white shadow-xl shadow-pink-100">
          <div className="border-b border-[#f0d4db] p-5">
            <h2 className="font-serif text-3xl text-[#7c4a59]">
              Guest List
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#fff3f5] text-xs uppercase tracking-wider text-[#9a6a75]">
                <tr>
                  <th className="px-5 py-4">Guest</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Adults</th>
                  <th className="px-5 py-4">Children</th>
                  <th className="px-5 py-4">Guest Names</th>
                  <th className="px-5 py-4">Requests</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Check-in</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f4dce2]">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="align-top">
                    <td className="px-5 py-4 font-semibold text-[#5d3b46]">
                      {rsvp.full_name}
                    </td>

                    <td className="px-5 py-4 text-[#7b5a63]">
                      <div>{rsvp.email}</div>
                      <div className="mt-1">{rsvp.phone}</div>
                    </td>

                    <td className="px-5 py-4">
                      {rsvp.attending ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          Attending
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          Declined
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">{rsvp.adults}</td>

                    <td className="px-5 py-4">{rsvp.children}</td>

                    <td className="max-w-xs whitespace-pre-line px-5 py-4 text-[#7b5a63]">
                      {rsvp.guest_names || '—'}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-[#7b5a63]">
                      {rsvp.notes || '—'}
                    </td>

                    <td className="px-5 py-4 text-[#7b5a63]">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      {rsvp.attending ? (
                        <button
                          onClick={() => toggleCheckIn(rsvp)}
                          disabled={updatingId === rsvp.id}
                          className={
                            rsvp.checked_in
                              ? 'rounded-xl bg-green-100 px-4 py-2 font-bold text-green-800 transition hover:bg-green-200 disabled:opacity-60'
                              : 'rounded-xl bg-[#b98291] px-4 py-2 font-bold text-white transition hover:bg-[#a86f80] disabled:opacity-60'
                          }
                        >
                          {updatingId === rsvp.id
                            ? 'Updating...'
                            : rsvp.checked_in
                              ? 'Checked In'
                              : 'Check In'}
                        </button>
                      ) : (
                        <span className="text-[#9a6a75]">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {rsvps.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-[#7b5a63]"
                    >
                      No RSVPs yet.
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-[#7b5a63]"
                    >
                      Loading RSVPs...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#edc8d1] bg-white p-5 shadow-lg shadow-pink-100">
      <div className="mb-4 inline-flex rounded-2xl bg-[#fff0f3] p-3 text-[#9a6a75]">
        {icon}
      </div>

      <p className="text-3xl font-bold text-[#7c4a59]">{value}</p>

      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#9a6a75]">
        {label}
      </p>
    </div>
  );
}
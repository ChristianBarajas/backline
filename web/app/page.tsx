
'use client';

import { useState, type FormEvent } from 'react';
import {
  AudioLines,
  CalendarDays,
  Compass,
  Mail,
  Music2,
  Send,
  Building2,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type AgentResult = {
  status: string;
  model: string;
  artist: string;
  analysis: string;
  research_enabled: boolean;
};

const API_URL = 'http://127.0.0.1:8000';

export default function Home() {
  const [artist, setArtist] = useState('Lammasu');
  const [location, setLocation] = useState('Orange County, CA');
  const [genre, setGenre] = useState('Death metal');
  const [goal, setGoal] = useState(
    'Find compatible hardcore bands and venues for a weekend show next month.'
  );

  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/agent/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist,
          location,
          genre,
          goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : `Backend returned ${response.status}`
        );
      }

      setResult(data as AgentResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the Backline AI.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3 font-bold tracking-widest">
            <AudioLines className="text-zinc-100" />
            BACKLINE
          </div>

          <span className="text-xs text-zinc-500">
            EARLY DEVELOPMENT · v0.2
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <span className="text-xs font-semibold tracking-[.25em] text-zinc-500">
            YOUR AI BOOKING WORKSPACE
          </span>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Better shows.
            <br />
            <span className="text-zinc-500">Less busywork.</span>
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-zinc-400">
            Your personal AI booking assistant. Explore opportunities,
            plan shows, and build connections in your music scene.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-3">
            {[
              { Icon: Compass, label: 'Venue research' },
              { Icon: Music2, label: 'Band discovery' },
              { Icon: Mail, label: 'Outreach tracking' },
              { Icon: CalendarDays, label: 'Date coordination' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300"
              >
                <Icon size={18} />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-zinc-800 p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 size={18} />
              Venue hosting
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Planned: manage your own space, applications,
              lineups, and events.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <BrainCircuit size={21} className="text-zinc-300" />

            <div>
              <p className="text-sm font-medium">
                Local AI integration
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Powered by Ollama and Qwen3 1.7B.
                No paid AI API required.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl">
          <div className="flex items-center gap-2">
            <BrainCircuit size={21} />
            <h2 className="text-xl font-semibold">
              AI booking assistant
            </h2>
          </div>

          <p className="mt-2 text-sm text-zinc-400">
            Describe your booking goal and let Backline analyze it.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block text-sm text-zinc-300">
              Artist
              <input
                required
                maxLength={120}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Location
              <input
                required
                maxLength={160}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Genre
              <input
                required
                maxLength={120}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Booking goal
              <textarea
                required
                maxLength={2000}
                rows={4}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-2 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-400"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <BrainCircuit size={17} className="animate-pulse" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Analyze booking opportunity
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-950 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 size={17} />
                Analysis complete
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Generated by {result.model}
              </p>

              <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                {result.analysis}
              </div>

              {!result.research_enabled && (
                <div className="mt-5 rounded-lg border border-zinc-800 p-3 text-xs leading-5 text-zinc-500">
                  AI planning only. Live music research,
                  verified contacts, and venue availability
                  are not connected yet.
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-zinc-500">
            Backline currently generates booking plans using
            local AI. It does not yet search the internet,
            verify show listings, or contact venues.
          </p>
        </section>
      </main>
    </div>
  );
}

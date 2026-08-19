'use client';

import * as React from 'react';
import { Music2, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';

/**
 * HomeAudioPlayer
 *
 * Floating mini audio player — strictly USER-INITIATED (no autoplay).
 * - Starts hidden (isMounted=false until effect runs → avoids SSR flash)
 * - Trigger button always shown unless user clicked "não mostrar mais"
 * - z-[200] to stay above chat widgets
 */
export function HomeAudioPlayer() {
  const [isMounted, setIsMounted]       = React.useState(false);
  const [permaDismissed, setPermaDismissed] = React.useState(false);
  const [open, setOpen]                 = React.useState(false);
  const [ready, setReady]               = React.useState(false);
  const [playing, setPlaying]           = React.useState(false);
  const [muted, setMuted]               = React.useState(false);
  const [progress, setProgress]         = React.useState(0);
  const [duration, setDuration]         = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Mount + read localStorage (runs only in browser)
  React.useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem('axemap_audio_dismissed') === '1') {
      setPermaDismissed(true);
    }
  }, []);

  const dismissTemporary = () => {
    setOpen(false);
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  const dismissPermanent = () => {
    dismissTemporary();
    localStorage.setItem('axemap_audio_dismissed', '1');
    setPermaDismissed(true);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    setReady(true);
  };

  const onEnded = () => setPlaying(false);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (Number(e.target.value) / 100) * audio.duration;
    setProgress(Number(e.target.value));
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // Don't render anything on the server or if permanently dismissed
  if (!isMounted || permaDismissed) return null;

  return (
    <>
      {/* Hidden audio element — always in DOM once mounted */}
      <audio
        ref={audioRef}
        src={process.env.NEXT_PUBLIC_TV_MUSIC_URL ?? '/audio/axemap/de-volta.mp3'}
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        aria-hidden="true"
      />

      {/* ── Floating trigger button ── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir player de música do AxéMap"
          title="Ouvir a trilha do AxéMap"
          className={[
            'fixed bottom-6 right-6 z-[200]',
            'inline-flex size-13 items-center justify-center',
            'rounded-full text-ivory shadow-xl shadow-black/40',
            'ring-2 ring-copper/50',
            'transition-all duration-300 hover:scale-110 hover:ring-copper',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper',
            /* rich African-inspired gradient ring background */
            'bg-[conic-gradient(from_0deg,hsl(var(--copper)),hsl(var(--dourado-sol)),hsl(var(--terracota)),hsl(var(--verde-floresta)),hsl(var(--copper)))]',
          ].join(' ')}
        >
          {/* Inner dark circle so icon is legible */}
          <span className="absolute inset-[3px] rounded-full bg-[hsl(var(--obsidiana))] flex items-center justify-center">
            {playing
              ? <Pause className="size-5 fill-[hsl(var(--copper))] text-[hsl(var(--copper))]" aria-hidden="true" />
              : <Music2 className="size-5 text-[hsl(var(--copper))]" aria-hidden="true" />
            }
          </span>
        </button>
      )}

      {/* ── Expanded player panel ── */}
      {open && (
        <div
          role="region"
          aria-label="Player de música — De Volta"
          className={[
            'fixed bottom-6 right-6 z-[200]',
            'flex w-72 flex-col gap-3 rounded-3xl p-4',
            'shadow-2xl shadow-black/50',
            /* African-inspired dark panel with warm tones */
            'border border-copper/30 bg-[hsl(var(--obsidiana))]',
            /* subtle gradient shimmer */
            'bg-gradient-to-br from-[hsl(var(--obsidiana))] via-[hsl(24_30%_10%)] to-[hsl(var(--obsidiana-deep))]',
          ].join(' ')}
        >
          {/* Top accent stripe */}
          <div
            className="absolute inset-x-0 top-0 h-0.5 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, hsl(var(--copper)), hsl(var(--dourado-sol)), hsl(var(--terracota)), hsl(var(--verde-floresta)))' }}
            aria-hidden="true"
          />

          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, hsl(var(--copper)/0.3), hsl(var(--dourado-sol)/0.2))' }}
              >
                <Music2 className="size-4 text-[hsl(var(--copper))]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[hsl(var(--marfim))]">De Volta</p>
                <p className="text-[10px] text-[hsl(var(--areia))]">AxéMap · Trilha sonora</p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissTemporary}
              aria-label="Minimizar player"
              className="inline-flex size-7 items-center justify-center rounded-full text-[hsl(var(--areia))] transition hover:bg-white/10 hover:text-[hsl(var(--marfim))]"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, hsl(var(--copper)), hsl(var(--dourado-sol)))',
                }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={seek}
                aria-label="Progresso da música"
                disabled={!ready}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[hsl(var(--areia)/0.6)]">
              <span>{audioRef.current ? fmt(audioRef.current.currentTime) : '0:00'}</span>
              <span>{duration ? fmt(duration) : '--:--'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!ready}
              aria-label={playing ? 'Pausar' : 'Reproduzir'}
              className={[
                'inline-flex size-10 items-center justify-center rounded-full text-white',
                'shadow-lg shadow-[hsl(var(--copper)/0.4)]',
                'transition hover:brightness-110 disabled:cursor-default disabled:opacity-40',
              ].join(' ')}
              style={{ background: 'linear-gradient(135deg, hsl(var(--copper)), hsl(var(--dourado-sol)/0.8))' }}
            >
              {playing
                ? <Pause className="size-4 fill-white" aria-hidden="true" />
                : <Play  className="size-4 fill-white ml-0.5" aria-hidden="true" />
              }
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Ativar som' : 'Silenciar'}
              className="inline-flex size-8 items-center justify-center rounded-full text-[hsl(var(--areia))] transition hover:bg-white/10 hover:text-[hsl(var(--marfim))]"
            >
              {muted
                ? <VolumeX className="size-3.5" aria-hidden="true" />
                : <Volume2 className="size-3.5" aria-hidden="true" />
              }
            </button>

            <button
              type="button"
              onClick={dismissPermanent}
              className="text-[10px] text-[hsl(var(--areia)/0.5)] underline underline-offset-2 transition hover:text-[hsl(var(--areia))]"
            >
              não mostrar mais
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import { useGlitch } from 'react-powerglitch';
import { clsx } from 'clsx';

export const Layout = ({ children, isChaos, title, side, systemStatus }) => {
  const glitch = useGlitch({
    playMode: 'manual',
    createContainers: true,
    types: ['shake', 'red-blue-split'],
    slice: { count: 6, velocity: 15, minHeight: 0.02, maxHeight: 0.15, hueRotate: true },
  });

  React.useEffect(() => {
    if (isChaos) glitch.startGlitch();
    else glitch.stopGlitch();
  }, [isChaos]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div
        ref={glitch.ref}
        className={clsx(
          "fixed inset-0 pointer-events-none z-50 mix-blend-screen opacity-70",
          !isChaos && "hidden"
        )}
      />
      <div className={clsx(
        "min-h-screen p-4 transition-all duration-500 border-8 relative z-10",
        isChaos ? "border-amber-500 bg-neutral-900" : "border-emerald-900 bg-black"
      )}>
        {isChaos && (
          <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        )}

        <header className="mb-8 flex justify-between items-center border-b border-white/10 pb-4 relative z-40">
          <h1 className="text-xl font-mono font-bold text-white tracking-widest">
            SENTINEL PROTOCOL <span className="text-xs text-neutral-500">v4.3 ({side})</span>
          </h1>
          <div className="flex gap-2">
            {systemStatus === 'AIR_GAPPED' && (
              <div className="bg-red-900 text-red-200 px-2 py-1 text-xs font-bold border border-red-500 animate-pulse">
                ⚠ AIR GAPPED
              </div>
            )}
            {isChaos && (
              <div className="bg-amber-500 text-black px-4 py-1 font-bold animate-pulse">
                SYSTEM OFFLINE: LIE-FI ACTIVE
              </div>
            )}
          </div>
        </header>
        <main className="relative z-40">{children}</main>
      </div>
    </div>
  );
};

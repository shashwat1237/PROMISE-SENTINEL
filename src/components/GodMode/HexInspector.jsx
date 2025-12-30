import React, { useState, useEffect } from 'react';

const formatHex = (arr) => Array.from(arr)
  .map(b => b.toString(16).padStart(2, '0').toUpperCase())
  .join(' ');

export const HexInspector = React.memo(() => {
  const [lastTx, setLastTx] = useState(null);

  useEffect(() => {
    const handleStorage = (e) => {
      // Logic supports both REAL storage events and our MANUALLY dispatched events from safeVault
      if (e.key && e.key.startsWith('sentinel_tx_') && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          setLastTx({
            iv: new Uint8Array(payload.iv),
            data: new Uint8Array(payload.data)
          });
        } catch (err) {
          console.error("Hex parsing error", err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="font-mono text-xs bg-black border border-green-900 p-4 h-64 overflow-hidden flex flex-col">
      <div className="flex justify-between border-b border-green-800 mb-2 pb-1">
        <span className="text-green-500 font-bold">LIVE MEMORY DUMP</span>
        <span className="text-neutral-500">{lastTx ? "CAPTURED" : "LISTENING..."}</span>
      </div>
      {lastTx ? (
        <div className="space-y-4 animate-pulse">
          <div>
            <div className="text-amber-500 text-[10px] mb-1">IV (SALT) - 12 BYTES</div>
            <div className="text-amber-300 break-all opacity-90">{formatHex(lastTx.iv)}</div>
          </div>
          <div>
            <div className="text-emerald-500 text-[10px] mb-1">AES-GCM CIPHERTEXT</div>
            <div className="text-emerald-400 break-all opacity-70 blur-[1px] hover:blur-0 transition-all">
              {formatHex(lastTx.data)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-neutral-700">
          WAITING FOR WRITE OPS...
        </div>
      )}
    </div>
  );
});
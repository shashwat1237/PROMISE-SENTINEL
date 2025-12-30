import { Zap, ZapOff, Trash2 } from 'lucide-react';
import { useTheatrical } from '../../core/theatricalContext'; // Import context

export const ChaosToggle = ({ isChaos, onToggle }) => {
  // Use the reset trigger from context
  const { triggerGlobalReset } = useTheatrical(); 

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <button
          onClick={() => {
              if(confirm("SYSTEM PURGE: This will wipe ALL open tabs. Confirm?")) {
                  triggerGlobalReset(); // Triggers the broadcast
              }
          }}
          className="px-3 py-2 font-mono text-sm border bg-red-950/30 text-red-500 border-red-500/50 hover:bg-red-900 hover:text-white transition-colors"
          title="Global System Purge"
      >
          <Trash2 size={16} />
      </button>

      <button
          onClick={onToggle}
          className={`px-4 py-2 font-mono text-sm border transition-colors duration-300
          ${isChaos
          ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400'
          : 'bg-transparent text-emerald-500 border-emerald-500 hover:bg-emerald-900'
          }`}
      >
          <div className="flex items-center gap-2">
          {isChaos ? <ZapOff size={16} /> : <Zap size={16} />}
          {isChaos ? "CHAOS MODE: ENABLED" : "CHAOS MODE: STANDBY"}
          </div>
      </button>
    </div>
  );
};
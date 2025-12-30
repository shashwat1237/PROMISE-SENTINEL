import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { vault } from './safeVault';

class LocalStorageChannel {
  constructor(channelName) {
    this.channelName = channelName;
    this.onmessage = null;
    this.listener = (e) => {
      if (e.key === this.channelName && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (this.onmessage) this.onmessage({ data });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', this.listener);
  }

  postMessage(data) {
    vault.setItem(this.channelName, JSON.stringify(data));
    setTimeout(() => {
      try {
        if (!vault.isAirGapped) localStorage.removeItem(this.channelName);
      } catch {}
    }, 100);
  }

  close() {
    window.removeEventListener('storage', this.listener);
  }
}

const TheatricalContext = createContext();

export const TheatricalProvider = ({ children }) => {
  const [isChaosMode, setChaosMode] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);
  const [systemStatus, setSystemStatus] = useState(vault.isAirGapped ? 'AIR_GAPPED' : 'ONLINE');
  const channelRef = useRef(null);
  const stateRef = useRef({ isChaosMode, pendingIds });

  const addId = (id) => {
    setPendingIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removeId = (id) => {
    setPendingIds(prev => prev.filter(pid => pid !== id));
  };

  useEffect(() => {
    try {
      const storedChaos = sessionStorage.getItem('sentinel_chaos') === 'true';
      setChaosMode(storedChaos);
    } catch {}
    
    if (!vault.isAirGapped) {
      try {
        const foundIds = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sentinel_tx_')) {
            const idPart = key.replace('sentinel_tx_', '');
            foundIds.push(parseInt(idPart));
          }
        }
        setPendingIds(foundIds);
      } catch (e) {}
    }

    const handleAirGap = () => setSystemStatus('AIR_GAPPED');
    window.addEventListener('sentinel-airgap-alert', handleAirGap);
    return () => window.removeEventListener('sentinel-airgap-alert', handleAirGap);
  }, []);

  useEffect(() => {
    stateRef.current = { isChaosMode, pendingIds };
  }, [isChaosMode, pendingIds]);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('sentinel_theatrical_v1');
    } catch (e) {
      console.warn("[SENTINEL] BroadcastChannel API failed. Using Vault fallback.");
      channelRef.current = new LocalStorageChannel('sentinel_theatrical_v1');
    }

    const handleMessage = (event) => {
      if (event.origin && event.origin !== window.origin && event.origin !== "") return;
      const { type, payload } = event.data;
      const current = stateRef.current;

      switch (type) {
        case 'CHAOS_TOGGLE':
          setChaosMode(payload);
          try { sessionStorage.setItem('sentinel_chaos', payload); } catch {}
          if (!payload) setPendingIds([]);
          break;
        case 'PARTICLE_HANDOFF':
          addId(payload.id);
          break;
        case 'TX_COMPLETE':
          removeId(payload.id);
          break;
        case 'WHO_IS_ALIVE':
          if (current.pendingIds.length > 0 || current.isChaosMode) {
            channelRef.current.postMessage({
              type: 'CURRENT_STATE',
              payload: { isChaos: current.isChaosMode, ids: current.pendingIds }
            });
          }
          break;
        case 'CURRENT_STATE':
          setChaosMode(payload.isChaos);
          setPendingIds(prev => [...new Set([...prev, ...payload.ids])]);
          break;
        case 'GLOBAL_RESET':
          localStorage.clear();
          window.location.reload();
          break;
        default: break;
      }
    };

    channelRef.current.onmessage = handleMessage;
    try { channelRef.current.postMessage({ type: 'WHO_IS_ALIVE' }); } catch {}

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, []);

  const toggleChaos = () => {
    const newState = !isChaosMode;
    setChaosMode(newState);
    try { sessionStorage.setItem('sentinel_chaos', newState); } catch {}
    
    // [CRITICAL FIX] The Batch Purge
    // If turning Chaos OFF (Online), delete all pending files from disk immediately
    if (!newState) {
        // 1. Physically delete the files for every ID we know about
        pendingIds.forEach(id => {
            vault.removeItem(`sentinel_tx_${id}`);
        });
        // 2. Clear the visual list
        setPendingIds([]);
    }
    
    if (channelRef.current) {
      try { channelRef.current.postMessage({ type: 'CHAOS_TOGGLE', payload: newState }); } catch {}
    }
  };

  const launchParticle = (data) => {
    addId(data.id);
    if (channelRef.current) {
      try { channelRef.current.postMessage({ type: 'PARTICLE_HANDOFF', payload: data }); } catch {}
    }
  };

  const completeTransaction = (id) => {
    removeId(id);
    if (channelRef.current) {
      try { channelRef.current.postMessage({ type: 'TX_COMPLETE', payload: { id } }); } catch {}
    }
  };

  const triggerGlobalReset = () => {
    if (channelRef.current) {
      try { channelRef.current.postMessage({ type: 'GLOBAL_RESET' }); } catch {}
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <TheatricalContext.Provider value={{ 
      isChaosMode, 
      toggleChaos, 
      launchParticle, 
      completeTransaction, 
      triggerGlobalReset,
      queueCount: pendingIds.length, 
      systemStatus 
    }}>
      {children}
    </TheatricalContext.Provider>
  );
};

export const useTheatrical = () => useContext(TheatricalContext);
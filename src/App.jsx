import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TheatricalProvider, useTheatrical } from './core/theatricalContext';
import { Layout } from './components/Layout';
import { ProductGrid } from './components/Merchant/ProductGrid';
import { ChaosToggle } from './components/Merchant/ChaosToggle';
import { NetworkGraph } from './components/GodMode/NetworkGraph';
import { HexInspector } from './components/GodMode/HexInspector';
import { audioEngine } from './core/audioEngine';

// [AUDIT VERIFIED] Forces user interaction for AudioContext
const StartOverlay = ({ onStart }) => (
  <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center flex-col gap-4">
    <div className="text-emerald-500 font-mono text-xs tracking-widest opacity-70">
      SYSTEM STANDBY // WAITING FOR INPUT
    </div>
    <button
      onClick={onStart}
      className="border-2 border-emerald-500 text-emerald-500 px-12 py-4 font-mono text-xl animate-pulse hover:bg-emerald-900 hover:text-white transition-all duration-300"
    >
      INITIALIZE SENTINEL_OS
    </button>
  </div>
);

const MerchantView = () => {
  const { isChaosMode, toggleChaos, systemStatus } = useTheatrical();
  return (
    <Layout isChaos={isChaosMode} title="POS TERMINAL" side="CLIENT" systemStatus={systemStatus}>
      <ChaosToggle isChaos={isChaosMode} onToggle={toggleChaos} />
      <div className="max-w-2xl mx-auto mt-10">
        <ProductGrid />
      </div>
    </Layout>
  );
};

const GodModeView = () => {
  return (
    <div className="bg-black min-h-screen p-8 font-mono">
      <h1 className="text-2xl font-bold text-green-500 mb-8 border-b border-green-900 pb-2">
        SENTINEL OVERWATCH [ADMIN]
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <NetworkGraph />
        <HexInspector />
      </div>
    </div>
  );
};

export default function App() {
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    // [AUDIT FIX] Resume audio context immediately on first click
    await audioEngine.init();
    await audioEngine.resume();
    setStarted(true);
  };

  return (
    <TheatricalProvider>
      {!started && <StartOverlay onStart={handleStart} />}
      {started && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MerchantView />} />
            <Route path="/god-mode" element={<GodModeView />} />
          </Routes>
        </BrowserRouter>
      )}
    </TheatricalProvider>
  );
}
import { useState, useRef, useEffect } from 'react';
import { useTheatrical } from '../core/theatricalContext';
import { encryptPayload, generateKey } from '../core/cryptoVault';
import { audioEngine } from '../core/audioEngine';
import { vault } from '../core/safeVault';

let sessionKey = null;

export const useTheatricalTransaction = () => {
  // [UPGRADE] Import completeTransaction
  const { launchParticle, isChaosMode, completeTransaction } = useTheatrical();
  const [isScrambling, setIsScrambling] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const chaosRef = useRef(isChaosMode);
  useEffect(() => { chaosRef.current = isChaosMode; }, [isChaosMode]);

  if (!sessionKey) generateKey().then(k => sessionKey = k);

  const executeTransaction = async (amount, displayString) => {
    await audioEngine.resume();
    audioEngine.play('clunk');
    setIsScrambling(true);

    // [CRITICAL FIX] Use Random + Time to prevent ID collisions on rapid clicks
    const uniqueId = Date.now() + Math.floor(Math.random() * 100000);
    
    const tx = { id: uniqueId, amount, timestamp: new Date().toISOString() };
    const encryptedData = await encryptPayload(tx, sessionKey);
    const vaultKey = `sentinel_tx_${uniqueId}`;
    const payloadStr = JSON.stringify(encryptedData);

    // 1. Truth: Save to Vault immediately
    vault.setItem(vaultKey, payloadStr);

    setTimeout(() => {
      if (isMounted.current) {
        setIsScrambling(false);
        
        // 2. Simulation: Launch particle
        launchParticle({
          id: uniqueId,
          isOffline: chaosRef.current
        });

        // 3. Cleanup: If ONLINE, remove specific ID
        if (!chaosRef.current) {
          setTimeout(() => {
              // Remove the file from disk
              vault.removeItem(vaultKey);
              
              // Remove the specific ID from UI
              if (isMounted.current) completeTransaction(uniqueId);
          }, 1000); // Wait 1.0s for the "whoosh" particle
        }
      }
    }, 600);
  };

  return { executeTransaction, isScrambling };
};
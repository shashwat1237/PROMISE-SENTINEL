const IV_LENGTH = 12; // [CRITICAL] NIST Standard for AES-GCM
const ALGO = "AES-GCM";
const KEY_USAGE = ["encrypt", "decrypt"];

if (!window.crypto || !window.crypto.subtle) {
  console.error("CRITICAL: Web Crypto API undefined. App requires HTTPS or Localhost.");
}

export const generateKey = async () => {
  return window.crypto.subtle.generateKey(
    { name: ALGO, length: 256 },
    true,
    KEY_USAGE
  );
};

export const encryptPayload = async (data, key) => {
  // [SAFETY] Always generate new random IV for every transaction
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encodedData
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
};
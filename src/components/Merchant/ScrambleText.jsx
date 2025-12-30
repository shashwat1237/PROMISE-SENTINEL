import React, { useEffect } from 'react';
import { useDencrypt } from 'use-dencrypt-effect';

export const ScrambleText = ({ text, scramble }) => {
  const { result, dencrypt } = useDencrypt();

  useEffect(() => {
    if (scramble) {
      dencrypt(text, { chars: '0123456789ABCDEF' });
    } else {
      dencrypt(text);
    }
  }, [scramble, text]);

  return <span className="font-mono text-emerald-400 font-bold">{result}</span>;
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, LoadingSpinner } from './Icons';

interface AudioPlayerProps {
  audioB64: string;
}

// Helper functions for audio decoding
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioB64 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!audioB64) return;

    const setupAudio = async () => {
      try {
        setIsReady(false);
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const decodedBytes = decode(audioB64);
        const buffer = await decodeAudioData(decodedBytes, ctx);
        audioBufferRef.current = buffer;
        setIsReady(true);
      } catch (error) {
        console.error("Failed to decode audio:", error);
      }
    };

    setupAudio();
    
    return () => {
      sourceNodeRef.current?.stop();
      audioContextRef.current?.close();
      setIsPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioB64]);

  const togglePlayPause = useCallback(() => {
    if (!isReady || !audioContextRef.current || !audioBufferRef.current) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
          setIsPlaying(false);
      };
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  }, [isPlaying, isReady]);

  return (
    <div className="flex items-center justify-center bg-slate-900/50 p-4 rounded-lg">
      <button
        onClick={togglePlayPause}
        disabled={!isReady}
        className="flex items-center gap-3 text-white font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {!isReady ? (
          <>
            <LoadingSpinner className="w-5 h-5" />
            <span>Preparing Audio...</span>
          </>
        ) : isPlaying ? (
          <>
            <PauseIcon className="w-5 h-5" />
            <span>Pause Narration</span>
          </>
        ) : (
          <>
            <PlayIcon className="w-5 h-5" />
            <span>Play Narration</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;

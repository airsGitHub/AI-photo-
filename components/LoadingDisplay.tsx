
import React from 'react';
import { LoadingSpinner } from './Icons';

interface LoadingDisplayProps {
  step: string;
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ step }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner className="w-12 h-12 text-cyan-400" />
      <p className="text-slate-300 text-lg text-center animate-pulse">{step}</p>
    </div>
  );
};

export default LoadingDisplay;

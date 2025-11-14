
import React from 'react';
import type { LandmarkData } from '../types';
import AudioPlayer from './AudioPlayer';

interface ResultDisplayProps {
  data: LandmarkData;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onReset }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 mb-4">{data.name}</h2>
        <div className="flex justify-center">
            <img src={data.imageUrl} alt={data.name} className="max-h-60 w-auto object-contain rounded-lg shadow-lg" />
        </div>
      </div>
      
      <AudioPlayer audioB64={data.audioB64} />

      <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-cyan-400 max-w-none bg-slate-900/50 p-4 rounded-lg">
        <p>{data.info}</p>
      </div>

      {data.sources && data.sources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Sources:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {data.sources.map((chunk, index) => (
              chunk.web && chunk.web.uri && (
                <li key={index}>
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}

      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Analyze Another Photo
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;

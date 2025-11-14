
import React, { useState, useCallback } from 'react';
import { identifyLandmark, fetchLandmarkInfo, generateSpeech } from './services/geminiService';
import type { LandmarkData } from './types';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import LoadingDisplay from './components/LoadingDisplay';
import { LandmarkIcon } from './components/Icons';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [landmarkData, setLandmarkData] = useState<LandmarkData | null>(null);
  const [loadingState, setLoadingState] = useState<{ active: boolean; step: string }>({ active: false, step: '' });
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setUploadedImage({ file, url: URL.createObjectURL(file) });
    setLandmarkData(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!uploadedImage) return;

    setLoadingState({ active: true, step: 'Initializing analysis...' });
    setError(null);
    setLandmarkData(null);

    try {
      setLoadingState({ active: true, step: 'Identifying landmark from your photo...' });
      const landmarkName = await identifyLandmark(uploadedImage.file);
      if (!landmarkName || landmarkName.toLowerCase().includes("not a landmark")) {
        throw new Error("Could not identify a landmark in the photo. Please try another image.");
      }

      setLoadingState({ active: true, step: `Identified ${landmarkName}. Fetching historical info...` });
      const { text: info, groundingChunks: sources } = await fetchLandmarkInfo(landmarkName);

      setLoadingState({ active: true, step: 'Generating audio narration...' });
      const audioB64 = await generateSpeech(info);

      setLandmarkData({
        name: landmarkName,
        info,
        sources,
        audioB64,
        imageUrl: uploadedImage.url,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setLoadingState({ active: false, step: '' });
    }
  }, [uploadedImage]);

  const handleReset = () => {
    setUploadedImage(null);
    setLandmarkData(null);
    setError(null);
    setLoadingState({ active: false, step: '' });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <LandmarkIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Photo Tourism AI
            </h1>
          </div>
          <p className="text-lg text-slate-400">Your AI-powered travel guide.</p>
        </header>

        <main className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 transition-all duration-500">
          {loadingState.active ? (
            <LoadingDisplay step={loadingState.step} />
          ) : error ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : landmarkData ? (
            <ResultDisplay data={landmarkData} onReset={handleReset} />
          ) : !uploadedImage ? (
            <ImageUploader onImageSelect={handleImageSelect} />
          ) : (
            <div className="text-center flex flex-col items-center">
              <img
                src={uploadedImage.url}
                alt="Uploaded landmark"
                className="max-h-80 w-auto object-contain rounded-lg mb-6 shadow-lg"
              />
              <button
                onClick={handleAnalyze}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105"
              >
                Tell Me About This Place
              </button>
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini. Discover the stories behind the sights.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

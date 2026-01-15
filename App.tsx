
import React, { useState, useCallback, useEffect } from 'react';
import CameraScanner from './components/CameraScanner';
import PackingList from './components/PackingList';
import { PackingItem, DetectedItem, Fragility } from './types';
import { analyzeFrame } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedTime, setLastProcessedTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'camera' | 'list'>('camera');
  const [showDetectionAlert, setShowDetectionAlert] = useState<string | null>(null);

  const handleFrameCapture = useCallback(async (base64: string) => {
    const now = Date.now();
    if (isProcessing || now - lastProcessedTime < 4000) return;

    setIsProcessing(true);
    try {
      const detected = await analyzeFrame(base64);
      
      setItems(prev => {
        const newItems = [...prev];
        let foundNew = false;
        let lastItemName = "";

        detected.forEach(d => {
          const exists = prev.some(item => 
            item.name.toLowerCase() === d.name.toLowerCase()
          );

          if (!exists) {
            newItems.push({
              id: Math.random().toString(36).substr(2, 9),
              name: d.name,
              category: d.category,
              fragility: Object.values(Fragility).includes(d.fragility) ? d.fragility : Fragility.LOW,
              timestamp: Date.now()
            });
            foundNew = true;
            lastItemName = d.name;
          }
        });

        if (foundNew) {
          setShowDetectionAlert(lastItemName);
          setTimeout(() => setShowDetectionAlert(null), 2000);
        }

        return foundNew ? newItems : prev;
      });
    } catch (error) {
      console.error("Frame analysis failed:", error);
    } finally {
      setIsProcessing(false);
      setLastProcessedTime(Date.now());
    }
  }, [isProcessing, lastProcessedTime]);

  const toggleScanning = () => setIsScanning(prev => !prev);
  const deleteItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));
  const clearList = () => {
    if (window.confirm("Are you sure you want to clear your entire packing list?")) {
      setItems([]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-900">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between z-30 shadow-sm sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
            <i className="fas fa-truck-moving"></i>
          </div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">MoveMate</h1>
        </div>
        <div className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          <i className={`fas fa-circle mr-1.5 ${isScanning ? 'text-green-500 animate-pulse' : 'text-slate-300'}`}></i>
          {isScanning ? 'AI LIVE' : 'STANDBY'}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col md:flex-row h-full">
        {/* Camera Section - Hidden when List tab active on mobile */}
        <div className={`flex-1 relative bg-black ${activeTab === 'list' ? 'hidden md:flex' : 'flex'}`}>
          <CameraScanner isScanning={isScanning} onFrameCapture={handleFrameCapture} />
          
          {/* Overlay Notifications */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 pointer-events-none z-20">
            {showDetectionAlert && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center justify-center animate-bounce border-2 border-white/20">
                <i className="fas fa-plus-circle mr-2"></i>
                <span className="font-bold text-sm truncate">Added: {showDetectionAlert}</span>
              </div>
            )}
            {isProcessing && !showDetectionAlert && (
              <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center justify-center border border-white/20 animate-pulse">
                <i className="fas fa-brain mr-2 text-blue-400"></i>
                Gemini is looking...
              </div>
            )}
          </div>

          {/* Floating Action Button for Scanning */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 z-20">
            <button
              onClick={toggleScanning}
              className={`
                group relative flex items-center justify-center w-20 h-20 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all active:scale-90
                ${isScanning 
                  ? 'bg-rose-500 hover:bg-rose-600 ring-8 ring-rose-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 ring-8 ring-blue-600/20'
                }
              `}
            >
              <i className={`fas ${isScanning ? 'fa-stop text-2xl' : 'fa-video text-2xl'} text-white`}></i>
              <div className="absolute -bottom-10 whitespace-nowrap text-[10px] font-black text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar / List Section */}
        <div className={`
          w-full md:w-[400px] bg-white border-l shadow-2xl flex flex-col 
          ${activeTab === 'camera' ? 'hidden md:flex' : 'flex h-full'}
        `}>
          <div className="flex-1 overflow-hidden">
            <PackingList 
              items={items} 
              onDeleteItem={deleteItem} 
              onClearList={clearList} 
            />
          </div>
          
          <div className="p-4 bg-slate-50 border-t">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start">
              <i className="fas fa-mobile-alt text-blue-500 mt-1 mr-3 text-lg"></i>
              <p className="text-[11px] text-blue-800 leading-normal font-medium">
                <strong>Android Pro Tip:</strong> Point your camera at shelves, counters, or furniture. Move slowly to let Gemini identify every detail for your packing list.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden bg-white border-t px-6 py-3 flex justify-around items-center z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('camera')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'camera' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-camera text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Scanner</span>
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex flex-col items-center space-y-1 relative transition-colors ${activeTab === 'list' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-list-ul text-xl"></i>
          <span className="text-[10px] font-bold uppercase tracking-tighter">My List</span>
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {items.length}
            </span>
          )}
        </button>
      </nav>

      {/* Desktop Logo Overlay */}
      <div className="hidden md:flex fixed top-6 left-6 items-center space-x-3 bg-slate-900/80 backdrop-blur-lg p-3 rounded-2xl border border-white/10 z-50">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <i className="fas fa-truck-moving text-xl"></i>
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight tracking-tight">MoveMate AI</h1>
          <p className="text-blue-400 text-[10px] uppercase font-black tracking-widest">Vision Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default App;

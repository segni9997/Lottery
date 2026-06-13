'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Trophy, AlertCircle, ArrowRight, Landmark } from 'lucide-react';
import { useGetCampaignsQuery } from '../../store/apiSlice';

export default function DrawCountdown() {
  const { data: campaigns, isLoading } = useGetCampaignsQuery({ status: 'Active' });
  const [selectedCampId, setSelectedCampId] = useState('');
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isDrawEnabled, setIsDrawEnabled] = useState(false);

  const selectedCampaign = campaigns?.find(c => c.id === selectedCampId) || campaigns?.[0];

  // Set default selection when data loads
  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !selectedCampId) {
      setSelectedCampId(campaigns[0].id);
    }
  }, [campaigns, selectedCampId]);

  // Timer loop
  useEffect(() => {
    if (!selectedCampaign) return;

    const drawTime = new Date(selectedCampaign.draw_date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = drawTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsDrawEnabled(true);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsDrawEnabled(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [selectedCampaign]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-3">
        <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading campaign schedule...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center glass-card p-8 bg-white/70">
        <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-poppins font-bold text-slate-800">No Active Campaigns</h2>
        <p className="text-xs text-slate-500 mt-2">
          There are no scheduled draw campaigns. The official draws will be listed here when active.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-10 animate-in fade-in duration-500">
      
      {/* Selector and Title */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-poppins font-extrabold text-slate-900 flex items-center justify-center space-x-2">
          <Clock className="h-8 w-8 text-emerald-700" />
          <span>Draw Countdown Room</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Monitor the live timer leading up to the official draw event. Access to the live drawing panel unlocks automatically.
        </p>

        {/* Dropdown to switch campaigns */}
        {campaigns.length > 1 && (
          <div className="max-w-xs mx-auto">
            <select
              value={selectedCampId}
              onChange={(e) => setSelectedCampId(e.target.value)}
              className="input-field cursor-pointer text-sm py-2"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedCampaign && (
        <div className="space-y-8">
          
          {/* Main Countdown Display */}
          <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_36px]" />
            
            <div className="relative z-10 text-center space-y-8">
              <span className="text-[10px] tracking-widest font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 uppercase">
                {selectedCampaign.title}
              </span>

              {/* Countdown Numbers Grid */}
              <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-900/80 border border-slate-800 p-4 md:p-6 rounded-2xl flex flex-col items-center">
                    <span className="text-3xl md:text-5xl font-mono font-extrabold text-amber-400">
                      {item.value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest mt-1 md:mt-2 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Draw Time info */}
              <div className="text-xs text-slate-400 font-medium">
                Official Draw Scheduled for: <strong className="text-white font-mono">{new Date(selectedCampaign.draw_date).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Conditional Info card and drawing links */}
          <div className="glass-card p-6 border border-slate-200/50 bg-white/70">
            {!isDrawEnabled ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm text-slate-700 bg-amber-500/5 p-4 rounded-2xl border border-amber-200/50">
                  <AlertCircle className="h-5.5 w-5.5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-poppins font-bold text-slate-900">Draw Locked</h4>
                    <p className="text-xs text-slate-500">
                      "The official draw has not started yet." You cannot conduct or witness the draw until the countdown ends.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-sm">
                  <button
                    disabled
                    className="flex-grow py-3 px-6 rounded-xl font-poppins font-medium bg-slate-200 text-slate-400 cursor-not-allowed text-center flex items-center justify-center space-x-2"
                  >
                    <Trophy className="h-4.5 w-4.5" />
                    <span>Watch Live Draw (Locked)</span>
                  </button>
                  <Link
                    href={`/register?campaign_id=${selectedCampaign.id}`}
                    className="py-3 px-6 rounded-xl font-poppins font-semibold bg-berhan-deepGreen text-berhan-gold shadow-md hover:scale-[1.01] transition-all text-center"
                  >
                    Submit Entry
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-poppins font-bold text-slate-900">Countdown Completed!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The official countdown has ended! You can now watch the live draw and see the generated winners.
                </p>
                
                <div className="flex justify-center pt-2">
                  <Link
                    href={`/live-draw?campaign_id=${selectedCampaign.id}`}
                    className="btn-gold flex items-center space-x-2 px-8 shadow-md shadow-amber-500/10 hover:scale-[1.02] transition-all"
                  >
                    <span>Enter Live Draw Room</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

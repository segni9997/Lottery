'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trophy, Star, Landmark, Share2, Award, Calendar, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGetCampaignsQuery, useGetWinnersQuery } from '../../store/apiSlice';
import { Winner } from '../../types';

export default function WinnersShowcase() {
  const searchParams = useSearchParams();
  const campaignParamId = searchParams.get('campaign_id');

  const { data: campaigns } = useGetCampaignsQuery({ status: 'Drawn' }); // fetch drawn campaigns or all
  const [selectedCampId, setSelectedCampId] = useState(campaignParamId || '');

  const { data: winners, isLoading } = useGetWinnersQuery(
    selectedCampId ? { campaign: selectedCampId } : undefined
  );

  const [activeWinner, setActiveWinner] = useState<Winner | null>(null);

  // Set default selection when campaigns load
  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !selectedCampId) {
      setSelectedCampId(campaigns[0].id);
    }
  }, [campaigns, selectedCampId]);

  const handleRevealShare = (w: Winner) => {
    setActiveWinner(w);
    // Fire confetti for the modal reveal!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#006B3F', '#FFFFFF']
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-poppins font-extrabold text-slate-900 flex items-center justify-center space-x-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          <span>Winners Announcement Circle</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Celebrate and announce our staff winners. Select a campaign below to review full lists.
        </p>

        {/* Campaign Filter */}
        <div className="max-w-xs mx-auto pt-2">
          <select
            value={selectedCampId}
            onChange={(e) => setSelectedCampId(e.target.value)}
            className="input-field cursor-pointer text-sm py-2"
          >
            <option value="">All Campaigns</option>
            {campaigns?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-12 space-y-3">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Retrieving winner cards...</p>
          </div>
        )}

        {!isLoading && (!winners || winners.length === 0) ? (
          <div className="glass-card text-center p-12 max-w-lg mx-auto bg-white/70">
            <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-poppins font-bold text-slate-800">No Winners Found</h3>
            <p className="text-sm text-slate-500 mt-2">
              There are no winner records for this campaign yet. Check out the live draw room during the event!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {winners?.map((w) => (
              <div 
                key={w.id}
                onClick={() => handleRevealShare(w)}
                className="group glass-card overflow-hidden border border-slate-200/50 bg-white/70 hover:border-amber-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Gold Gradient Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 border-b border-slate-800 flex justify-between items-center text-white">
                  <span className="font-mono text-xs font-bold text-amber-400">RANK #{w.rank}</span>
                  <Trophy className="h-4 w-4 text-amber-400 group-hover:scale-115 transition-transform" />
                </div>
                
                {/* Body details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-poppins font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {w.registration_detail.full_name}
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-500">
                    Code: {w.registration_detail.lottery_number}
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Dept: {w.registration_detail.department_detail?.code}</span>
                    <span>Prize: {w.prize_description || 'Gift'}</span>
                  </div>
                </div>

                {/* Footer Link button */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:bg-amber-400/5">
                  <span>View Share Card</span>
                  <Share2 className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Card Modal Overlay */}
      {activeWinner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-8 border border-slate-800 shadow-2xl relative animate-in zoom-in duration-300 text-white text-center">
            
            <button 
              onClick={() => setActiveWinner(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {/* Congratulatory Share Card */}
            <div 
              className="bg-slate-950 border-2 border-amber-400/30 rounded-2xl p-6 relative overflow-hidden space-y-6 mb-6"
              style={{
                backgroundImage: 'linear-gradient(135deg, #022c19 0%, #004d2e 100%)'
              }}
            >
              <div className="absolute top-3 left-3 w-4.5 h-4.5 border-t border-l border-amber-400/40" />
              <div className="absolute top-3 right-3 w-4.5 h-4.5 border-t border-r border-amber-400/40" />
              <div className="absolute bottom-3 left-3 w-4.5 h-4.5 border-b border-l border-amber-400/40" />
              <div className="absolute bottom-3 right-3 w-4.5 h-4.5 border-b border-r border-amber-400/40" />

              <div className="flex justify-center">
                <div className="p-3 bg-amber-400 text-emerald-950 rounded-2xl shadow-lg">
                  <Landmark className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase font-bold">
                  Official Winner Announcement
                </span>
                <h3 className="text-lg font-poppins font-bold text-white tracking-wide">
                  BERHAN BANK S.C.
                </h3>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-sans">
                  CONGRATULATIONS
                </div>
                <h2 className="text-2xl font-poppins font-extrabold text-white px-2">
                  {activeWinner.registration_detail.full_name}
                </h2>
                <div className="py-1 px-4 rounded-xl bg-amber-400 text-slate-950 font-mono font-bold tracking-wide inline-block text-base">
                  {activeWinner.registration_detail.lottery_number}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-left text-slate-300 font-sans">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Department</span>
                  <span className="font-semibold text-white">{activeWinner.registration_detail.department_detail?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Prize Earned</span>
                  <span className="font-semibold text-amber-300">{activeWinner.prize_description || "Holiday Prize"}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-white/20 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(activeWinner.draw_time).toLocaleDateString()}
                </span>
                <span className="text-emerald-400 font-semibold uppercase">Verification code: BB-LOT-OK</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => {
                  setActiveWinner(null);
                }}
                className="flex-grow py-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trophy, RefreshCw, AlertTriangle, ShieldCheck, Volume2, Users, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  useGetCampaignsQuery, 
  useGetWinnersQuery, 
  useDrawWinnerMutation, 
  useGetAuditLogsQuery 
} from '../../store/apiSlice';
import { Winner } from '../../types';

export default function LiveDraw() {
  const searchParams = useSearchParams();
  const campaignParamId = searchParams.get('campaign_id');

  const { data: campaigns } = useGetCampaignsQuery({ status: 'Active' });
  const [selectedCampId, setSelectedCampId] = useState(campaignParamId || '');

  const selectedCampaign = campaigns?.find(c => c.id === selectedCampId) || campaigns?.[0];

  // RTK Queries
  const { data: winners, refetch: refetchWinners } = useGetWinnersQuery(
    selectedCampaign ? { campaign: selectedCampaign.id } : undefined,
    { pollingInterval: 3000 } // Poll every 3 seconds for public live updating!
  );
  
  const { data: auditLogs, refetch: refetchLogs } = useGetAuditLogsQuery(undefined, { pollingInterval: 5000 });
  const [drawWinner, { isLoading: drawing }] = useDrawWinnerMutation();

  // Component local states
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [latestWinner, setLatestWinner] = useState<Winner | null>(null);
  const [drawRank, setDrawRank] = useState(1);
  const [prizeDesc, setPrizeDesc] = useState('');
  const [drawError, setDrawError] = useState<string | null>(null);

  // Check if user is logged in as admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  // Set default selection when campaigns load
  useEffect(() => {
    if (campaigns && campaigns.length > 0 && !selectedCampId) {
      setSelectedCampId(campaigns[0].id);
    }
  }, [campaigns, selectedCampId]);

  // Track if a winner was added externally (for public viewers)
  const [prevWinnerCount, setPrevWinnerCount] = useState(0);
  useEffect(() => {
    if (winners) {
      if (winners.length > prevWinnerCount && prevWinnerCount > 0) {
        // A new winner was drawn! Fire confetti for public view.
        const newWinner = winners[winners.length - 1];
        setLatestWinner(newWinner);
        fireConfetti();
      }
      setPrevWinnerCount(winners.length);
    }
  }, [winners, prevWinnerCount]);

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#006B3F', '#FFFFFF', '#0F8A5F']
    });
  };

  const handleAdminDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    
    setDrawError(null);
    setIsSpinning(true);
    setLatestWinner(null);

    // Simulate 3 seconds of spinning wheel before hitting API
    setTimeout(async () => {
      try {
        const winnerResult = await drawWinner({
          campaign_id: selectedCampaign.id,
          rank: drawRank,
          prize_description: prizeDesc
        }).unwrap();

        setLatestWinner(winnerResult);
        fireConfetti();
        refetchWinners();
        refetchLogs();
        setPrizeDesc('');
        // Auto increment next rank
        setDrawRank(prev => prev + 1);
      } catch (err: any) {
        console.error(err);
        setDrawError(err?.data?.detail || 'Draw execution failed. Ensure there are eligible non-winning entries.');
      } finally {
        setIsSpinning(false);
      }
    }, 3500);
  };

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-500">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-poppins font-extrabold text-slate-900 flex items-center justify-center space-x-2">
          <Trophy className="h-8 w-8 text-amber-500 animate-bounce" />
          <span>Live Draw Room</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Experience the transparent drawing process. Live results refresh automatically for all viewers.
        </p>

        {campaigns && campaigns.length > 1 && (
          <div className="max-w-xs mx-auto pt-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Spin Wheel & Draw Console */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Animated Draw Screen */}
          <div className="glass-card bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white relative overflow-hidden h-[450px] flex flex-col justify-between items-center shadow-2xl">
            <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-1" />
              Live Stream
            </div>

            {/* Wheel Animation Container */}
            <div className="my-auto flex flex-col items-center justify-center relative w-full h-full">
              
              {!latestWinner && !isSpinning && (
                <div className="space-y-4">
                  <div className="w-40 h-40 rounded-full border-4 border-dashed border-amber-500/40 flex items-center justify-center text-slate-500">
                    <Trophy className="h-16 w-16 opacity-30" />
                  </div>
                  <div className="text-sm text-slate-400 font-poppins">
                    {isAdmin ? "Ready to spin the golden wheel" : "Waiting for the official draw to start..."}
                  </div>
                </div>
              )}

              {isSpinning && (
                <div className="space-y-6">
                  {/* CSS Golden Rotating Wheel */}
                  <div className="w-48 h-48 rounded-full border-8 border-amber-500 bg-gradient-radial from-amber-400/20 to-transparent flex items-center justify-center relative shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-[spin_0.8s_linear_infinite]">
                    <div className="absolute w-2 h-16 bg-gradient-to-t from-amber-500 to-transparent origin-bottom bottom-24 rounded" />
                    <div className="absolute w-16 h-2 bg-gradient-to-r from-transparent to-amber-500 origin-left left-24 rounded" />
                    <Landmark className="h-10 w-10 text-amber-400 animate-pulse" />
                  </div>
                  <div className="text-base font-poppins text-amber-300 font-bold uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Drawing Winner...</span>
                  </div>
                </div>
              )}

              {latestWinner && !isSpinning && (
                <div className="space-y-4 animate-in zoom-in duration-500 p-6 bg-slate-900/50 rounded-2xl border border-white/5 max-w-sm">
                  <div className="flex justify-center text-amber-400">
                    <Star className="h-12 w-12 fill-amber-400 animate-bounce" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold">
                    Rank #{latestWinner.rank} Winner Revealed
                  </div>
                  <h2 className="text-2xl font-poppins font-extrabold text-white">
                    {latestWinner.registration_detail.full_name}
                  </h2>
                  <div className="py-1 px-4 rounded-xl bg-amber-400 text-slate-950 font-mono font-bold tracking-wide inline-block text-lg">
                    {latestWinner.registration_detail.lottery_number}
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    Prize: {latestWinner.prize_description || "Special Holiday Prize"}
                  </p>
                </div>
              )}
            </div>

            {/* Live Stats */}
            <div className="w-full border-t border-white/5 pt-4 flex justify-around text-xs text-slate-400">
              <div>
                <span>Total Winners: </span>
                <strong className="text-white font-mono">{winners?.length || 0}</strong>
              </div>
              <div>
                <span>Campaign Status: </span>
                <strong className="text-amber-400 font-mono uppercase">{selectedCampaign?.status}</strong>
              </div>
            </div>
          </div>

          {/* Admin Control Console */}
          {isAdmin && selectedCampaign && (
            <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5">
              <h3 className="font-poppins font-bold text-slate-950 mb-3 flex items-center space-x-2 text-sm uppercase tracking-wide">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <span>Admin Draw Control Console</span>
              </h3>
              
              {drawError && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{drawError}</span>
                </div>
              )}

              <form onSubmit={handleAdminDraw} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Rank</label>
                  <input
                    type="number"
                    min="1"
                    value={drawRank}
                    onChange={(e) => setDrawRank(parseInt(e.target.value))}
                    className="input-field text-sm py-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Prize Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Laptop, Car, Cash"
                    value={prizeDesc}
                    onChange={(e) => setPrizeDesc(e.target.value)}
                    className="input-field text-sm py-2"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSpinning || drawing}
                    className="w-full btn-gold py-2.5 flex items-center justify-center space-x-2 font-semibold text-xs uppercase"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{isSpinning ? 'Spinning...' : 'Spin & Draw'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Col: Winners list & Audit log */}
        <div className="space-y-8">
          
          {/* Winners Board */}
          <div className="glass-card p-6 border border-slate-200/50 bg-white/70 flex flex-col h-[280px] overflow-hidden">
            <h3 className="font-poppins font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3 flex items-center space-x-2 text-sm uppercase tracking-wide">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              <span>Winners Circle</span>
            </h3>
            
            <div className="overflow-y-auto flex-grow space-y-2">
              {!winners || winners.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No winners drawn yet. Live results will pop up here.
                </div>
              ) : (
                winners.map((w) => (
                  <div 
                    key={w.id} 
                    onClick={() => {
                      setLatestWinner(w);
                      fireConfetti();
                    }}
                    className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 bg-white hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                  >
                    <div>
                      <div className="text-xs font-poppins font-bold text-slate-900 leading-tight">
                        {w.registration_detail.full_name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block mt-0.5">
                        Code: {w.registration_detail.lottery_number}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 font-mono text-[10px] font-bold">
                        Rank {w.rank}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="glass-card p-6 border border-slate-200/50 bg-white/70 flex flex-col h-[250px] overflow-hidden">
            <h3 className="font-poppins font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3 flex items-center space-x-2 text-sm uppercase tracking-wide">
              <ShieldCheck className="h-4.5 w-4.5 text-slate-700" />
              <span>Auditor Logs</span>
            </h3>

            <div className="overflow-y-auto flex-grow space-y-2.5">
              {!auditLogs || auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No audit logs generated yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="text-[10px] font-mono border-b border-slate-50 pb-2 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-700 leading-tight">
                      {log.details.winner_name ? (
                        <>Winner: {log.details.winner_name} ({log.details.winner_lottery_number}) - Rank {log.details.rank}</>
                      ) : (
                        <>{log.action} performed</>
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

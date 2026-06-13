'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Landmark, ArrowRight, Clock, Award, Users, CheckCircle2, Ticket } from 'lucide-react';
import { useGetCampaignsQuery } from '../store/apiSlice';

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: campaigns, isLoading } = useGetCampaignsQuery();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/check-status?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Filter campaigns
  const activeCampaigns = campaigns?.filter(c => c.status === 'Active') || [];
  const closedCampaigns = campaigns?.filter(c => c.status === 'Closed' || c.status === 'Drawn') || [];

  return (
    <div className="space-y-16 py-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative glass-card bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Glow Spheres */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Landmark className="h-3.5 w-3.5 mr-1" />
            Official Bank Staff Portal
          </div>
          
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold tracking-tight leading-tight">
            Berhan Bank Staff <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Lottery Management Platform
            </span>
          </h1>
          
          <p className="text-base text-slate-300 font-sans max-w-xl">
            Welcome to the official digital drawing space. Register for current holiday campaigns, manage installment plans, and view transparent live draw results instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/register" className="btn-gold flex items-center justify-center space-x-2">
              <span>Register for Draw</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/check-status" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center justify-center space-x-2">
              <span>Check Installment Progress</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search Lookup Block */}
      <section className="max-w-3xl mx-auto">
        <div className="glass-card p-6 border border-slate-200/50 bg-white/70">
          <h2 className="text-xl font-poppins font-bold text-slate-900 mb-2 flex items-center space-x-2">
            <Ticket className="h-5 w-5 text-emerald-700" />
            <span>Quick Ticket & Status Lookup</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Enter your Phone Number (e.g. 0911...) or unique Lottery Number (e.g. BRH00012026) to see your ticket, installments status, or request next payments.
          </p>
          <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. BRH00012026 or 0911223344"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field flex-grow"
              required
            />
            <button type="submit" className="btn-primary flex items-center justify-center space-x-2">
              <span>Search Status</span>
            </button>
          </form>
        </div>
      </section>

      {/* Active Campaigns List */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-poppins font-extrabold text-slate-950">
              Active Campaigns
            </h2>
            <p className="text-sm text-slate-500">
              Select an open holiday campaign to participate in the upcoming draw.
            </p>
          </div>
          <Link href="/register" className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 hover:underline">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card h-72 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : activeCampaigns.length === 0 ? (
          <div className="glass-card text-center p-12 max-w-lg mx-auto">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-poppins font-bold text-slate-800">No Active Campaigns</h3>
            <p className="text-sm text-slate-500 mt-2">
              There are currently no active lottery registration campaigns open. Please check back during holiday seasons!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeCampaigns.map((camp) => (
              <div 
                key={camp.id} 
                className="group glass-card border border-slate-200/60 overflow-hidden flex flex-col justify-between hover:border-emerald-700/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Visual Header */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative">
                  <div className="absolute top-4 right-4 py-1 px-3 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Registration Open
                  </div>
                  <h3 className="text-lg font-poppins font-bold group-hover:text-amber-400 transition-colors duration-200">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-emerald-300 font-medium tracking-wide mt-1">
                    Holiday: {camp.holiday_name}
                  </p>
                </div>
                
                {/* Details */}
                <div className="p-6 space-y-4 flex-grow">
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {camp.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Draw Date</span>
                      <span className="text-slate-800 font-semibold flex items-center mt-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                        {new Date(camp.draw_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Deadline</span>
                      <span className="text-slate-800 font-semibold flex items-center mt-1">
                        <Clock className="h-3.5 w-3.5 text-rose-600 mr-1" />
                        {new Date(camp.registration_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <Link 
                    href={`/register?campaign_id=${camp.id}`}
                    className="flex-1 btn-primary text-center text-sm py-2.5"
                  >
                    Register Now
                  </Link>
                  <Link 
                    href="/draw-countdown"
                    className="flex-1 btn-secondary text-center text-sm py-2.5 bg-white"
                  >
                    Draw Countdown
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">
              Eligible Branches
            </span>
            <span className="text-2xl font-poppins font-bold text-white">
              All Departments
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l sm:border-r border-slate-800 pt-4 sm:pt-0 sm:px-6">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">
              Draw Integrity
            </span>
            <span className="text-2xl font-poppins font-bold text-white">
              100% Audited
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-t sm:border-t-0 pt-4 sm:pt-0">
          <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">
              Transparency
            </span>
            <span className="text-2xl font-poppins font-bold text-white">
              Live Announcements
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

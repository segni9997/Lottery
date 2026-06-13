'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Ticket as TicketIcon, AlertCircle, HelpCircle } from 'lucide-react';
import { useLazyLookupRegistrationQuery } from '../../store/apiSlice';
import Ticket from '../../components/Ticket';

export default function MyTicket() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');

  const [searchTerm, setSearchTerm] = useState(queryParam || '');
  const [triggerLookup, { data: registrations, isLoading, isError }] = useLazyLookupRegistrationQuery();

  useEffect(() => {
    if (queryParam) {
      triggerLookup({ q: queryParam });
    }
  }, [queryParam, triggerLookup]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      triggerLookup({ q: searchTerm.trim() });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-poppins font-extrabold text-slate-900 flex items-center justify-center space-x-2">
          <TicketIcon className="h-8 w-8 text-emerald-700" />
          <span>My Ticket Portal</span>
        </h1>
        <p className="text-sm text-slate-500">
          Search, print, and download your official Berhan Bank staff lottery ticket.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-card p-6 border border-slate-200/50 bg-white/70">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Enter Phone Number or Lottery Number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
          <button type="submit" className="btn-primary flex items-center space-x-2 px-6 py-3">
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-12 space-y-3">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Looking up registration records...</p>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Search query failed. Please verify network connections and search values.</span>
          </div>
        )}

        {!isLoading && registrations && registrations.length === 0 && (
          <div className="glass-card text-center p-8 bg-amber-500/5 border border-amber-200 text-slate-700">
            <HelpCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <h3 className="font-poppins font-bold">No Registration Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any lottery registration linked with "{searchTerm}". Please verify the number or register for the current campaign.
            </p>
          </div>
        )}

        {!isLoading && registrations && registrations.length > 0 && (
          <div className="space-y-8">
            {registrations.map((reg) => (
              <div key={reg.id} className="space-y-3">
                <div className="text-center text-xs text-slate-500 tracking-wider font-mono">
                  Matching campaign: <strong>{reg.campaign_detail?.title}</strong>
                </div>
                <Ticket registration={reg} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, CheckCircle2, AlertTriangle, Clock, RefreshCw, 
  ArrowRight, Landmark, ExternalLink, HelpCircle 
} from 'lucide-react';
import { 
  useLazyLookupRegistrationQuery, 
  useRequestNextInstallmentMutation 
} from '../../store/apiSlice';

export default function CheckStatus() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(queryParam || '');
  const [triggerLookup, { data: registrations, isLoading, isError, refetch }] = useLazyLookupRegistrationQuery();
  const [requestInstallment, { isLoading: requesting }] = useRequestNextInstallmentMutation();

  const [requestMsg, setRequestMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (queryParam) {
      triggerLookup({ q: queryParam });
    }
  }, [queryParam, triggerLookup]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setRequestMsg(null);
      triggerLookup({ q: searchTerm.trim() });
    }
  };

  const handleRequestNext = async (installmentId: string) => {
    try {
      await requestInstallment({ installment: installmentId }).unwrap();
      setRequestMsg({ 
        type: 'success', 
        text: 'Installment request submitted successfully! Once approved by admin, you can pay this installment.' 
      });
      // Refresh lookup
      if (searchTerm.trim()) {
        triggerLookup({ q: searchTerm.trim() });
      }
    } catch (err: any) {
      console.error(err);
      setRequestMsg({ 
        type: 'error', 
        text: err?.data?.detail || 'Failed to submit installment request.' 
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-poppins font-extrabold text-slate-900 flex items-center justify-center space-x-2">
          <Landmark className="h-8 w-8 text-emerald-700" />
          <span>Payment Status & Installments</span>
        </h1>
        <p className="text-sm text-slate-500">
          Check your eligibility, track installment approvals, and request next payments.
        </p>
      </div>

      {/* Search Input Card */}
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
            <span>Check Status</span>
          </button>
        </form>
      </div>

      {requestMsg && (
        <div className={`p-4 rounded-xl text-sm border ${
          requestMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {requestMsg.text}
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-12 space-y-3">
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Fetching payment records...</p>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            Failed to lookup payment details. Please check connection.
          </div>
        )}

        {!isLoading && registrations && registrations.length === 0 && (
          <div className="glass-card text-center p-8 bg-amber-500/5 border border-amber-200 text-slate-700">
            <HelpCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <h3 className="font-poppins font-bold">No Registration Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any lottery registration linked with "{searchTerm}".
            </p>
          </div>
        )}

        {!isLoading && registrations && registrations.map((reg) => {
          const totalPaidCount = reg.installments?.filter(i => i.status === 'Approved').length || 0;
          const totalCount = reg.installments?.length || 1;
          const progressPercent = (totalPaidCount / totalCount) * 100;

          return (
            <div key={reg.id} className="glass-card border border-slate-200/60 overflow-hidden bg-white/70">
              
              {/* Top Banner (Eligibility block) */}
              <div className={`p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                reg.is_eligible 
                  ? 'bg-gradient-to-r from-emerald-800 to-teal-800' 
                  : 'bg-gradient-to-r from-slate-800 to-slate-900'
              }`}>
                <div>
                  <h3 className="text-lg font-poppins font-bold text-white leading-tight">
                    {reg.full_name}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    Lottery Code: <span className="text-amber-400 font-bold">{reg.lottery_number}</span> | Campaign: {reg.campaign_detail?.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  {reg.is_eligible ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="text-xs font-poppins font-bold tracking-wide uppercase text-emerald-300">
                        Eligible for Draw
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      <span className="text-xs font-poppins font-bold tracking-wide uppercase text-amber-300">
                        Ineligible (Pending Payments)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Installments Approved: {totalPaidCount} of {totalCount}</span>
                  <span className="font-mono text-emerald-600">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Installments Checklist */}
              <div className="p-6 space-y-4">
                <h4 className="font-poppins font-bold text-sm text-slate-900 border-l-4 border-emerald-700 pl-2">
                  Payment History & Next Actions
                </h4>

                <div className="space-y-4">
                  {reg.installments?.map((inst, index) => {
                    const isApproved = inst.status === 'Approved';
                    const isPaid = inst.status === 'Paid';
                    const isOpen = inst.status === 'Open';

                    // Check if previous are approved
                    const prevApproved = reg.installments?.slice(0, index).every(i => i.status === 'Approved');
                    
                    // Has pending request
                    const pendingRequest = inst.requests?.find(r => r.status === 'Pending');
                    
                    // Can request next
                    const canRequest = isOpen && !isApproved && prevApproved && !pendingRequest && index > 0;

                    return (
                      <div 
                        key={inst.id} 
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-all ${
                          isApproved 
                            ? 'bg-emerald-500/5 border-emerald-200/50' 
                            : isPaid 
                            ? 'bg-amber-500/5 border-amber-200/50' 
                            : 'bg-slate-50/50 border-slate-200/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold text-slate-400 block uppercase">
                            Installment #{inst.installment_number}
                          </span>
                          <span className="text-base font-bold text-slate-900 font-mono">
                            ETB {parseFloat(inst.amount).toFixed(0)}
                          </span>
                          {inst.due_date && (
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Due Date: {new Date(inst.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2">
                          {isApproved && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-poppins bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Approved
                            </span>
                          )}

                          {isPaid && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-poppins bg-amber-100 text-amber-800 animate-pulse">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Paid (Awaiting Approval)
                            </span>
                          )}

                          {isOpen && !isApproved && (
                            <>
                              {pendingRequest ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-poppins bg-sky-100 text-sky-800">
                                  <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                                  Request Pending
                                </span>
                              ) : index === 0 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-poppins bg-slate-200 text-slate-700">
                                  Open
                                </span>
                              ) : prevApproved ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-poppins bg-slate-200 text-slate-700">
                                  Ready to Unlock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-poppins bg-slate-100 text-slate-400">
                                  Locked
                                </span>
                              )}
                            </>
                          )}

                          {/* Action Button: Request next installment */}
                          {canRequest && (
                            <button
                              onClick={() => handleRequestNext(inst.id)}
                              disabled={requesting}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-poppins font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
                            >
                              {requesting ? 'Requesting...' : 'Request Next Installment'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions Callout */}
              {!reg.is_eligible && (
                <div className="p-6 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="max-w-md">
                    💡 Please submit your installment payment to the Bank and share the receipt inside our official Telegram channel so our admin team can verify and approve it.
                  </p>
                  {reg.campaign_detail?.telegram_link && (
                    <a 
                      href={reg.campaign_detail.telegram_link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#229ED9] hover:bg-[#208ebd] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs"
                    >
                      <span>Telegram Channel</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

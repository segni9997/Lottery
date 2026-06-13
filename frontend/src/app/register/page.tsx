'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Landmark, User, Phone, Briefcase, CreditCard, 
  Send, Ticket as TicketIcon, CheckCircle2, ChevronRight, X, Sparkles, Send as TelegramIcon
} from 'lucide-react';
import { 
  useGetCampaignsQuery, 
  useGetDepartmentsQuery, 
  useGetPaymentPlansQuery, 
  useCreateRegistrationMutation 
} from '../../store/apiSlice';
import { Registration } from '../../types';
import Ticket from '../../components/Ticket';

// Form validation schema
const registrationSchema = zod.object({
  campaign: zod.string().min(1, 'Please select a campaign'),
  full_name: zod.string().min(3, 'Full name must be at least 3 characters'),
  phone_number: zod.string().regex(/^(09|07|\+2519|\+2517)\d{8}$/, 'Enter a valid Ethiopian phone number (e.g. 0911223344)'),
  department: zod.string().min(1, 'Please select a department'),
  payment_plan: zod.string().min(1, 'Please select a payment plan'),
});

type RegistrationFormValues = zod.infer<typeof registrationSchema>;

export default function Register() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignParamId = searchParams.get('campaign_id');

  const { data: campaigns } = useGetCampaignsQuery({ status: 'Active' });
  const { data: departments } = useGetDepartmentsQuery({ status: 'Active' });
  const { data: plans } = useGetPaymentPlansQuery({ is_active: true });
  const [createRegistration, { isLoading: submitting, error: submitError }] = useCreateRegistrationMutation();

  const [registeredData, setRegisteredData] = useState<Registration | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Department search filter state
  const [deptSearch, setDeptSearch] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      campaign: campaignParamId || '',
      full_name: '',
      phone_number: '',
      department: '',
      payment_plan: '',
    }
  });

  const selectedCampaignId = watch('campaign');
  const selectedPlanId = watch('payment_plan');
  const selectedDeptId = watch('department');

  // Find objects
  const selectedCampaign = campaigns?.find(c => c.id === selectedCampaignId);
  const selectedPlan = plans?.find(p => p.id === selectedPlanId);
  const selectedDept = departments?.find(d => d.id === selectedDeptId);

  // Set initial campaign from query parameter
  useEffect(() => {
    if (campaignParamId) {
      setValue('campaign', campaignParamId);
    }
  }, [campaignParamId, setValue]);

  // Set input value when selecting a department from custom dropdown
  const selectDepartment = (id: string, name: string) => {
    setValue('department', id);
    setDeptSearch(name);
    setShowDeptDropdown(false);
  };

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      const result = await createRegistration(values).unwrap();
      setRegisteredData(result);
      setShowModal(true);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const filteredDepts = departments?.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) || 
    d.code.toLowerCase().includes(deptSearch.toLowerCase())
  ) || [];

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in slide-in-from-bottom duration-500">
      <div className="glass-card overflow-hidden border border-slate-200/50 bg-white/70">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-8 relative">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />
          <h1 className="text-2xl md:text-3xl font-poppins font-extrabold flex items-center space-x-3 text-white">
            <TicketIcon className="h-8 w-8 text-amber-400" />
            <span>Draw Registration</span>
          </h1>
          <p className="text-emerald-300 text-xs mt-2 tracking-wide font-medium">
            Register your name for the official Berhan Bank staff lottery drawing. No login required.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              <strong>Registration Error:</strong> {
                (submitError as any)?.data?.detail || 
                (submitError as any)?.data?.phone_number?.[0] ||
                (submitError as any)?.data?.campaign?.[0] ||
                "Failed to register. Please try again or verify phone registration."
              }
            </div>
          )}

          {/* Telegram Channel Callout */}
          {selectedCampaign?.telegram_link && (
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs animate-in fade-in duration-300">
              <div className="space-y-0.5 text-slate-700">
                <p className="font-semibold text-slate-900">Official Telegram Channel</p>
                <p className="text-slate-500">Join to submit your payment proof for faster manual verification.</p>
              </div>
              <a
                href={selectedCampaign.telegram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#229ED9] hover:bg-[#208ebd] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <TelegramIcon className="h-3.5 w-3.5" />
                <span>Join Channel</span>
              </a>
            </div>
          )}

          {/* 1. Campaign Selection */}
          <div className="space-y-2">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Lottery Campaign *
            </label>
            <div className="relative">
              <select
                {...register('campaign')}
                className="input-field appearance-none cursor-pointer pr-10"
              >
                <option value="">Select a holiday draw campaign</option>
                {campaigns?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.holiday_name})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
            {errors.campaign && (
              <span className="text-xs text-rose-600 block font-medium">{errors.campaign.message}</span>
            )}
          </div>

          {/* 2. Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Enter your full name as in bank records"
                {...register('full_name')}
                className="input-field pl-10"
              />
            </div>
            {errors.full_name && (
              <span className="text-xs text-rose-600 block font-medium">{errors.full_name.message}</span>
            )}
          </div>

          {/* 3. Phone Number */}
          <div className="space-y-2">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. 0911223344"
                {...register('phone_number')}
                className="input-field pl-10"
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Format: 09... or 07... (10 digits)</span>
            {errors.phone_number && (
              <span className="text-xs text-rose-600 block font-medium">{errors.phone_number.message}</span>
            )}
          </div>

          {/* 4. Searchable Department Dropdown */}
          <div className="space-y-2 relative">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Department *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search and select department..."
                value={deptSearch}
                onChange={(e) => {
                  setDeptSearch(e.target.value);
                  setShowDeptDropdown(true);
                  if (selectedDeptId) setValue('department', '');
                }}
                onFocus={() => setShowDeptDropdown(true)}
                className="input-field pl-10"
              />
              {deptSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setDeptSearch('');
                    setValue('department', '');
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {showDeptDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                {filteredDepts.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">No departments found</div>
                ) : (
                  filteredDepts.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => selectDepartment(d.id, d.name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-800 transition-colors flex justify-between items-center"
                    >
                      <span>{d.name}</span>
                      <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">{d.code}</span>
                    </button>
                  ))
                )}
              </div>
            )}
            {errors.department && (
              <span className="text-xs text-rose-600 block font-medium">{errors.department.message}</span>
            )}
          </div>

          {/* 5. Payment Plan Cards */}
          <div className="space-y-3">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Select Installment Plan *
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans?.map((plan) => {
                const active = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setValue('payment_plan', plan.id)}
                    className={`flex flex-col justify-between p-4 rounded-2xl text-left border transition-all duration-300 hover:scale-[1.01] ${
                      active
                        ? 'border-berhan-gold bg-amber-400/5 ring-1 ring-amber-500'
                        : 'border-slate-200 bg-white/50 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-poppins font-semibold ${active ? 'text-amber-600' : 'text-slate-600'}`}>
                        {plan.name}
                      </span>
                      <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                        ETB {parseFloat(plan.total_amount).toFixed(0)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1">
                        Base: {parseFloat(plan.base_amount).toFixed(0)} | Penalty: {parseFloat(plan.penalty_amount).toFixed(0)}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-semibold text-emerald-800">
                      <span>{plan.installment_count}x Installments</span>
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        ETB {parseFloat(plan.installment_amount).toFixed(0)}/mo
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.payment_plan && (
              <span className="text-xs text-rose-600 block font-medium">{errors.payment_plan.message}</span>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-4 flex items-center justify-center space-x-2 text-base font-semibold shadow-lg shadow-emerald-900/10"
          >
            <Send className="h-5 w-5" />
            <span>{submitting ? 'Registering...' : 'Submit Registration'}</span>
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && registeredData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-8 border border-slate-800 shadow-2xl relative animate-in zoom-in duration-300 text-white max-h-[90vh] overflow-y-auto">
            
            {/* Celebration Sparkles */}
            <div className="absolute top-6 right-6 text-amber-400 animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>

            {/* Modal Header */}
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-poppins font-extrabold text-white tracking-tight">
                Registration Successful!
              </h2>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                Your ticket has been generated. Please read the payment instructions below carefully.
              </p>
            </div>

            {/* Ticket rendering */}
            <div className="mb-6">
              <Ticket registration={registeredData} />
            </div>

            {/* Plan Info and Instructions */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4 text-sm mb-6">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800 text-slate-400 font-mono">
                <span>Selected Plan:</span>
                <span className="text-white font-semibold">{selectedPlan?.name}</span>
              </div>
              
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>💡 <strong>How to Pay:</strong> Submit your installment payments to the bank account and post proof in the Telegram channel.</p>
                <p>💡 <strong>Eligibility Rule:</strong> You will only enter the draw when all installments are status <strong>Approved</strong>.</p>
              </div>

              {selectedCampaign?.telegram_link && (
                <a 
                  href={selectedCampaign.telegram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#208ebd] text-white transition-all font-semibold font-poppins text-xs shadow-md"
                >
                  <TelegramIcon className="h-4 w-4" />
                  <span>Submit Payment Proof on Telegram</span>
                </a>
              )}
            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push(`/check-status?q=${registeredData.lottery_number}`);
                }}
                className="flex-1 py-3 text-center rounded-xl bg-slate-800 text-slate-300 font-semibold border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
              >
                Track Installments
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push('/');
                }}
                className="flex-1 py-3 text-center rounded-xl bg-berhan-deepGreen text-berhan-gold font-semibold hover:opacity-90 transition-all cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

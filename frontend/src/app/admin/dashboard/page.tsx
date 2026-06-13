'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Landmark, Users, ShieldCheck, Trophy, LogOut, CheckCircle2, 
  XCircle, Plus, FileSpreadsheet, RefreshCw, Layers, ClipboardList 
} from 'lucide-react';
import { 
  useGetCampaignsQuery, 
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  
  useGetInstallmentRequestsQuery,
  useApproveInstallmentRequestMutation,
  useRejectInstallmentRequestMutation,
  
  useGetInstallmentsQuery,
  useApproveInstallmentMutation,
  
  useGetRegistrationsQuery
} from '../../../store/apiSlice';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'approvals' | 'campaigns' | 'departments' | 'reports'>('approvals');
  
  // Create forms state
  const [newCampaign, setNewCampaign] = useState({
    title: '', holiday_name: '', description: '', draw_date: '', 
    registration_start_date: '', registration_end_date: '', telegram_link: '', status: 'Draft'
  });
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', status: 'Active' });

  // RTK Queries
  const { data: campaigns, refetch: refetchCampaigns } = useGetCampaignsQuery();
  const { data: departments, refetch: refetchDepartments } = useGetDepartmentsQuery();
  const { data: requests, refetch: refetchRequests } = useGetInstallmentRequestsQuery();
  const { data: installments, refetch: refetchInstallments } = useGetInstallmentsQuery();
  const { data: registrations } = useGetRegistrationsQuery();

  // RTK Mutations
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  
  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  
  const [approveRequest] = useApproveInstallmentRequestMutation();
  const [rejectRequest] = useRejectInstallmentRequestMutation();
  const [approveInstallment] = useApproveInstallmentMutation();

  const [downloadCampaignId, setDownloadCampaignId] = useState('');

  // Validate admin token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    router.push('/admin');
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign(newCampaign).unwrap();
      refetchCampaigns();
      setNewCampaign({
        title: '', holiday_name: '', description: '', draw_date: '', 
        registration_start_date: '', registration_end_date: '', telegram_link: '', status: 'Draft'
      });
      alert('Campaign created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create campaign');
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDept(newDept).unwrap();
      refetchDepartments();
      setNewDept({ name: '', code: '', description: '', status: 'Active' });
      alert('Department created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create department');
    }
  };

  const handleToggleCampaignStatus = async (id: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      'Draft': 'Active',
      'Active': 'Closed',
      'Closed': 'Drawn',
      'Drawn': 'Active'
    };
    const newStatus = nextStatusMap[currentStatus] || 'Draft';
    try {
      await updateCampaign({ id, body: { status: newStatus } }).unwrap();
      refetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDeptStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateDept({ id, body: { status: newStatus } }).unwrap();
      refetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest({ id: requestId }).unwrap();
      refetchRequests();
      refetchInstallments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest({ id: requestId }).unwrap();
      refetchRequests();
      refetchInstallments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovePayment = async (installmentId: string) => {
    try {
      await approveInstallment(installmentId).unwrap();
      refetchInstallments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadReport = () => {
    if (!downloadCampaignId) {
      alert('Please select a campaign first.');
      return;
    }
    const token = localStorage.getItem('token');
    // Open standard anchor download link using token authorization or direct redirect
    window.open(`http://localhost:8000/api/registrations/report/?campaign_id=${downloadCampaignId}&token=${token}`);
  };

  // Filter stats
  const eligibleCount = registrations?.filter(r => r.is_eligible).length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'Pending') || [];
  const unpaidInstallments = installments?.filter(i => i.status === 'Paid') || []; // Wait, paid but not approved!

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-berhan-gold rounded-xl text-emerald-950 shadow-md">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-poppins font-extrabold text-white">
              Berhan Staff Lottery Console
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
              Administrative Workstation
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-poppins text-xs font-semibold"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6 bg-white/70 border border-slate-200/50">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Total Entries</span>
          <span className="text-3xl font-poppins font-extrabold text-slate-900 mt-1 block">
            {registrations?.length || 0}
          </span>
        </div>
        <div className="glass-card p-6 bg-white/70 border border-slate-200/50">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Eligible Pool</span>
          <span className="text-3xl font-poppins font-extrabold text-emerald-700 mt-1 block">
            {eligibleCount}
          </span>
        </div>
        <div className="glass-card p-6 bg-white/70 border border-slate-200/50">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Pending Requests</span>
          <span className="text-3xl font-poppins font-extrabold text-sky-600 mt-1 block">
            {pendingRequests.length}
          </span>
        </div>
        <div className="glass-card p-6 bg-white/70 border border-slate-200/50">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Awaiting Payments</span>
          <span className="text-3xl font-poppins font-extrabold text-amber-600 mt-1 block">
            {unpaidInstallments.length}
          </span>
        </div>
      </div>

      {/* Main Working Tabs */}
      <div className="flex border-b border-slate-200 font-poppins text-sm">
        {[
          { id: 'approvals', label: 'Approvals Queue', icon: ShieldCheck },
          { id: 'campaigns', label: 'Campaigns CRUD', icon: Trophy },
          { id: 'departments', label: 'Departments CRUD', icon: Layers },
          { id: 'reports', label: 'Reports Panel', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-semibold transition-all ${
                active
                  ? 'border-emerald-700 text-emerald-700 bg-white/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* TAB 1: approvals */}
        {activeTab === 'approvals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Queue 1: Installment requests (to unlock installment) */}
            <div className="glass-card p-6 border border-slate-200/50 bg-white/70 space-y-4">
              <h3 className="font-poppins font-bold text-sm text-slate-900 border-l-4 border-sky-600 pl-2">
                1. Unlock Next Installment Requests ({pendingRequests.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No pending installment unlock requests.
                  </div>
                ) : (
                  pendingRequests.map((req) => {
                    const instItem = installments?.find(i => i.id === req.installment);
                    const regItem = registrations?.find(r => r.id === instItem?.registration);
                    
                    return (
                      <div key={req.id} className="p-4 rounded-2xl border border-slate-100 bg-white flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">{regItem?.full_name}</span>
                          <p className="text-[10px] text-slate-500">
                            Lottery: {regItem?.lottery_number} | Installment #{instItem?.installment_number}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleRejectRequest(req.id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                          <button 
                            onClick={() => handleApproveRequest(req.id)}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Queue 2: Paid installments (approving actual payments) */}
            <div className="glass-card p-6 border border-slate-200/50 bg-white/70 space-y-4">
              <h3 className="font-poppins font-bold text-sm text-slate-900 border-l-4 border-emerald-700 pl-2">
                2. Approve Paid Installments ({unpaidInstallments.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {unpaidInstallments.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No pending payment approvals. (Instruct staff to upload proof on Telegram).
                  </div>
                ) : (
                  unpaidInstallments.map((inst) => {
                    const regItem = registrations?.find(r => r.id === inst.registration);
                    return (
                      <div key={inst.id} className="p-4 rounded-2xl border border-slate-100 bg-white flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">{regItem?.full_name}</span>
                          <p className="text-[10px] text-slate-500">
                            Code: {regItem?.lottery_number} | Installment #{inst.installment_number}
                          </p>
                          <span className="font-mono text-emerald-700 font-bold block mt-0.5">ETB {parseFloat(inst.amount).toFixed(0)}</span>
                        </div>
                        <div>
                          <button 
                            onClick={() => handleApprovePayment(inst.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-sm"
                          >
                            Approve Payment
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: campaigns */}
        {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Campaign form */}
            <div className="glass-card p-6 border border-slate-200/50 bg-white/70 space-y-4">
              <h3 className="font-poppins font-bold text-sm text-slate-900 flex items-center gap-1">
                <Plus className="h-4.5 w-4.5 text-emerald-700" />
                <span>Create New Campaign</span>
              </h3>
              
              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Title</label>
                  <input
                    type="text"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Holiday Name</label>
                  <input
                    type="text"
                    value={newCampaign.holiday_name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, holiday_name: e.target.value })}
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Description</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="input-field py-2 h-16"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Draw Date</label>
                  <input
                    type="datetime-local"
                    value={newCampaign.draw_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, draw_date: e.target.value })}
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Start Reg</label>
                    <input
                      type="datetime-local"
                      value={newCampaign.registration_start_date}
                      onChange={(e) => setNewCampaign({ ...newCampaign, registration_start_date: e.target.value })}
                      className="input-field py-2"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">End Reg</label>
                    <input
                      type="datetime-local"
                      value={newCampaign.registration_end_date}
                      onChange={(e) => setNewCampaign({ ...newCampaign, registration_end_date: e.target.value })}
                      className="input-field py-2"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Telegram Link</label>
                  <input
                    type="url"
                    value={newCampaign.telegram_link}
                    onChange={(e) => setNewCampaign({ ...newCampaign, telegram_link: e.target.value })}
                    className="input-field py-2"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">
                  Save Campaign
                </button>
              </form>
            </div>

            {/* Campaigns list */}
            <div className="lg:col-span-2 glass-card p-6 border border-slate-200/50 bg-white/70 space-y-4">
              <h3 className="font-poppins font-bold text-sm text-slate-900 border-l-4 border-emerald-700 pl-2">
                Active & Scheduled Campaigns
              </h3>
              
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {campaigns?.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-2xl border border-slate-100 bg-white flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-950">{camp.title}</span>
                      <p className="text-[10px] text-slate-400">Draw Date: {new Date(camp.draw_date).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                        camp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        camp.status === 'Draft' ? 'bg-slate-100 text-slate-500' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {camp.status}
                      </span>
                      <button
                        onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                      >
                        Advance Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: departments */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Department form */}
            <div className="glass-card p-6 border border-slate-200/50 bg-white/70 space-y-4">
              <h3 className="font-poppins font-bold text-sm text-slate-900 flex items-center gap-1">
                <Plus className="h-4.5 w-4.5 text-emerald-700" />
                <span>Create Department</span>
              </h3>

              <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Department Name</label>
                  <input
                    type="text"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Department Code</label>
                  <input
                    type="text"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Description</label>
                  <textarea
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                    className="input-field py-2 h-20"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">
                  Save Department
                </button>
              </form>
            </div>

            {/* Departments list */}
            <div className="lg:col-span-2 glass-card p-6 border border-slate-200/50 bg-white/70 space-y-4">
              <h3 className="font-poppins font-bold text-sm text-slate-900 border-l-4 border-emerald-700 pl-2">
                Registered Bank Departments
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {departments?.map((dept) => (
                  <div key={dept.id} className="p-4 rounded-2xl border border-slate-100 bg-white flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-950">{dept.name}</span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded ml-2 uppercase">
                        {dept.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        dept.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {dept.status}
                      </span>
                      <button
                        onClick={() => handleToggleDeptStatus(dept.id, dept.status)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: reports */}
        {activeTab === 'reports' && (
          <div className="glass-card p-8 border border-slate-200/50 bg-white/70 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-extrabold text-slate-900 text-lg">
                Lottery Registration Reporting Panel
              </h3>
              <p className="text-xs text-slate-500">
                Export and download full campaign registrations spreadsheets grouped by bank departments.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Campaign
                </label>
                <select
                  value={downloadCampaignId}
                  onChange={(e) => setDownloadCampaignId(e.target.value)}
                  className="input-field cursor-pointer py-2.5 text-sm"
                >
                  <option value="">Choose campaign for export</option>
                  {campaigns?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.holiday_name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDownloadReport}
                className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2 text-sm font-semibold shadow-md cursor-pointer"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span>Export & Download Excel Report</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

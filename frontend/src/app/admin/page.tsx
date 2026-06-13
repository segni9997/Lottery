'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, Lock, User, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '../../store/apiSlice';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const response = await login({ username, password }).unwrap();
      
      // Save tokens in localStorage
      localStorage.setItem('token', response.access);
      localStorage.setItem('refresh', response.refresh);
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      // RTK Query errors are { status, data } — not plain Error objects
      console.error('Login error — status:', err?.status, '| data:', err?.data ?? err);
      setErrorMsg(
        err?.data?.detail ||
        err?.data?.non_field_errors?.[0] ||
        (err?.status === 'FETCH_ERROR' ? 'Network error — could not reach the server.' : null) ||
        (err?.status === 401 ? 'Invalid username or password.' : null) ||
        'Invalid administrative credentials.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8 animate-in fade-in duration-500">
      
      {/* Branding Logo */}
      <div className="text-center space-y-3">
        <div className="mx-auto p-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl shadow-lg text-emerald-950 inline-block">
          <Landmark className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-poppins font-extrabold text-slate-900 tracking-tight">
          Berhan Bank Staff Portal
        </h1>
        <p className="text-xs text-slate-500">
          Enter credentials to access administrative and approval workflows.
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-card p-8 border border-slate-200/50 bg-white/70">
        
        {errorMsg && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-10 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-poppins font-semibold text-slate-700 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-sm"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2 text-sm font-semibold shadow-md shadow-emerald-950/10 cursor-pointer"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>

      {/* Info Notice */}
      <div className="text-center text-[10px] text-slate-400 font-mono max-w-xs mx-auto leading-relaxed">
        🔒 Authorized access only. This session is monitored and logged in compliance with Bank Audit guidelines.
      </div>
    </div>
  );
}

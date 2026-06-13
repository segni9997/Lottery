'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Landmark, Trophy, Ticket, Clock, CheckCircle } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: Landmark },
    { href: '/register', label: 'Register', icon: Ticket },
    { href: '/check-status', label: 'Check Status', icon: CheckCircle },
    { href: '/my-ticket', label: 'My Ticket', icon: Ticket },
    { href: '/draw-countdown', label: 'Countdown', icon: Clock },
    { href: '/live-draw', label: 'Live Draw', icon: Trophy },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md group-hover:scale-115 transition-all duration-300">
                <Landmark className="h-6 w-6 text-emerald-900" />
              </div>
              <div className="flex flex-col">
                <span className="font-poppins font-bold text-lg tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  BERHAN BANK
                </span>
                <span className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">
                  Staff Lottery
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1 items-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-poppins text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-berhan-deepGreen text-berhan-gold shadow-sm border border-emerald-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Admin Panel Link button */}
          <div className="hidden md:block">
            <Link 
              href="/admin" 
              className="px-4 py-2 rounded-xl text-xs font-poppins font-medium border border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 transition-all duration-300"
            >
              Staff Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-all duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-poppins text-base font-medium transition-all duration-200 ${
                    active
                      ? 'bg-berhan-deepGreen text-berhan-gold border-l-4 border-berhan-gold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 pb-2 px-4 border-t border-slate-800">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-poppins font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

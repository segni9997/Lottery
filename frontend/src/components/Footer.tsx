import React from 'react';
import Link from 'next/link';
import { Landmark, Phone, Mail, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-berhan-gold rounded-lg shadow-sm">
                <Landmark className="h-5 w-5 text-emerald-900" />
              </div>
              <span className="font-poppins font-bold text-lg text-white tracking-wider">
                BERHAN BANK S.C.
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              A premium, secure digital lottery management platform built exclusively for Berhan Bank employees. Participate, track installments, and view live draws transparently.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Licensed by the National Lottery Administration of Ethiopia.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-white tracking-wide text-sm">
              Quick Actions
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-amber-400 transition-colors duration-200">
                  Register Ticket
                </Link>
              </li>
              <li>
                <Link href="/check-status" className="hover:text-amber-400 transition-colors duration-200">
                  Check Installment Status
                </Link>
              </li>
              <li>
                <Link href="/my-ticket" className="hover:text-amber-400 transition-colors duration-200">
                  Search & Download Ticket
                </Link>
              </li>
              <li>
                <Link href="/draw-countdown" className="hover:text-amber-400 transition-colors duration-200">
                  Live Draw Countdown
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-white tracking-wide text-sm">
              Support & Contact
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+251 116 185722</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>info@berhanbanket.com</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Bole, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Globe className="h-4 w-4 text-emerald-400" />
                <a 
                  href="https://www.berhanbanket.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors duration-200"
                >
                  www.berhanbanket.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Berhan Bank S.C. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 flex space-x-6">
            <Link href="/admin" className="hover:text-slate-300 transition-colors duration-200">
              Admin Portal
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">Secure Fintech Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

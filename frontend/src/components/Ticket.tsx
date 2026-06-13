'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Printer, Landmark, Copy, Check, QrCode } from 'lucide-react';
import { Registration } from '../types';

interface TicketProps {
  registration: Registration;
}

export default function Ticket({ registration }: TicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const {
    lottery_number,
    full_name,
    phone_number,
    department_detail,
    campaign_detail,
    payment_plan_detail,
    created_at
  } = registration;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lottery_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (ticketRef.current === null) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          borderRadius: '0px',
        }
      });
      const link = document.createElement('a');
      link.download = `Berhan_Ticket_${lottery_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading ticket image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-6 max-w-lg mx-auto">
      {/* Outer wrapper to restrict rendering dimension during capture */}
      <div className="w-full bg-slate-900 rounded-3xl p-1.5 shadow-2xl border-2 border-amber-500/20 overflow-hidden">
        {/* Ticket Container */}
        <div 
          ref={ticketRef} 
          className="relative w-full bg-slate-950 text-white font-sans p-8 rounded-[22px] overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 100% 50%, #000 16px, transparent 17px),
              radial-gradient(circle at 0% 50%, #000 16px, transparent 17px),
              linear-gradient(135deg, #022c19 0%, #004d2e 60%, #041d11 100%)
            `,
            backgroundSize: '100% 100%',
          }}
        >
          {/* Subtle Guilloche Watermark Effect */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
          
          {/* Gold Decorative Corner Borders */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400/40" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400/40" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400/40" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400/40" />

          {/* Ticket Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md text-emerald-950">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm tracking-widest text-amber-400 font-poppins font-bold uppercase">
                  BERHAN BANK S.C.
                </h3>
                <p className="text-[10px] text-emerald-400 tracking-widest font-semibold font-sans uppercase">
                  Official Staff Lottery
                </p>
              </div>
            </div>
            
            {/* Ticket Serial Indicator */}
            <div className="text-right">
              <span className="text-[9px] text-slate-400 tracking-widest font-mono uppercase block">
                Serial No
              </span>
              <span className="text-lg font-mono font-bold text-amber-300 tracking-wide">
                {lottery_number}
              </span>
            </div>
          </div>

          {/* Ticket Body Details */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 space-y-4">
              <div>
                <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase block">
                  Campaign
                </span>
                <span className="text-base font-poppins font-semibold text-white leading-tight">
                  {campaign_detail?.title || "Staff Holiday Draw"}
                </span>
              </div>
              
              <div>
                <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase block">
                  Participant Name
                </span>
                <span className="text-lg font-semibold text-amber-100">
                  {full_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase block">
                    Department
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {department_detail?.code || "STAFF"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase block">
                    Plan
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {payment_plan_detail?.name.split(' ')[0] || "Payment"}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code section & stamp */}
            <div className="flex flex-col items-center justify-center border-l border-white/10 pl-4">
              <div className="p-2 bg-white rounded-xl shadow-inner mb-2">
                <QrCode className="h-16 w-16 text-slate-950" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider">
                Scan Secure
              </span>
            </div>
          </div>

          {/* Footer of the ticket */}
          <div className="border-t border-dashed border-white/20 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <div>
              <span>Date: {created_at ? new Date(created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 uppercase font-semibold">
                Status: {registration.is_eligible ? "Eligible" : "Pending Approval"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-3 w-full">
        <button
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-all font-poppins text-sm border border-slate-700"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all font-poppins font-medium text-sm shadow-md"
        >
          <Download className="h-4 w-4" />
          <span>{downloading ? 'Downloading...' : 'Download PNG'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="p-3 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
          title="Print Ticket"
        >
          <Printer className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

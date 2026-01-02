import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extracting data from URL
  const amount = queryParams.get('amount') || "0.00";
  const item = queryParams.get('item') || "Secure Asset";
  const txHash = queryParams.get('tx') || "N/A";

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-sm w-full">
        
        {/* SUCCESS HEADER */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Payment Secured</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-1">VendorGuard Protocol</p>
        </div>

        {/* TRANSACTION CARD */}
        <div className="bg-[#111216] border border-white/5 rounded-[2.5rem] p-8 mb-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Decorative Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Item</p>
                <p className="text-lg font-bold italic uppercase leading-none">{item}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</p>
                <p className="text-2xl font-black text-emerald-400 italic leading-none">${amount}</p>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full"></div>

            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Reference ID</p>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-mono text-slate-400 break-all text-center leading-relaxed">
                  {txHash}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CLEAN NAVIGATION - NO RECEIPT, NO SHARE */}
        <Link 
          to="/" 
          className="w-full bg-white text-black font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          Finish & Return
          <ArrowRight size={16} />
        </Link>

        {/* SECURITY FOOTER */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-20">
          <ShieldCheck size={12} />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Verified Transaction</span>
        </div>

      </div>
    </div>
  );
};

export default SuccessPage;
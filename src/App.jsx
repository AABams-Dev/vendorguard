import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download, Share2, ShieldCheck } from 'lucide-react';
import { Toaster } from 'sonner'; // 1. Added import

// Import your custom pages
import MerchantDashboard from './MerchantDashboard'; 
import PaymentPage from './PaymentPage';

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get('amount') || "0.00";
  const item = queryParams.get('item') || "Secure Deal";
  const txHash = queryParams.get('tx') || "VG-TX-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center p-6 text-slate-200 font-sans">
      {/* BRAND HEADER (Replaces Vite Logo) */}
      <div className="flex items-center gap-3 mb-8 opacity-50">
        <ShieldCheck size={28} className="text-blue-500" />
        <span className="text-xl font-black tracking-tighter text-white italic uppercase">VendorGuard</span>
      </div>

      <div className="max-w-md w-full bg-[#0f1115] border border-white/5 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <CheckCircle2 size={40} className="text-black" />
        </div>
        
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Funds Secured</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 truncate px-4">TX ID: {txHash}</p>
        
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{item}</p>
          <h2 className="text-4xl font-black text-white">{amount} ETH</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl text-[10px] font-black uppercase transition-all border border-white/5">
            <Download size={16} className="text-blue-500" /> Receipt
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl text-[10px] font-black uppercase transition-all border border-white/5">
            <Share2 size={16} className="text-blue-500" /> Share
          </button>
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">
          Return to Dashboard <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      {/* 2. Added Toaster Container - Set to top-right for a modern look */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      <Routes>
        {/* Your Dynamic Routes */}
        <Route path="/" element={<MerchantDashboard />} />
        <Route path="/pay/:id" element={<PaymentPage />} />
        <Route path="/success" element={<SuccessPage />} />
        
        {/* Redirect any unknown routes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
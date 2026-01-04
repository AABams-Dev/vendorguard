import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download, Share2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Toaster } from 'sonner';

// Import your custom pages
import MerchantDashboard from './MerchantDashboard'; 
import PaymentPage from './PaymentPage';

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Data extraction from URL params
  const amount = queryParams.get('amount') || "0.00";
  const item = queryParams.get('item') || "Secure Deal";
  const txHash = queryParams.get('tx') || "0x" + Math.random().toString(16).substr(2, 32).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center p-6 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* BRAND HEADER */}
      <div className="flex items-center gap-3 mb-8 opacity-40 hover:opacity-100 transition-opacity">
        <ShieldCheck size={28} className="text-blue-500" />
        <span className="text-xl font-black tracking-tighter text-white italic uppercase">VendorGuard</span>
      </div>

      <div className="max-w-md w-full bg-[#0f1115] border border-white/5 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
        
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse"></div>
          <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
        </div>
        
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">Funds Secured</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 bg-white/5 py-2 px-4 rounded-full inline-block">
          TX: {txHash.slice(0, 12)}...
        </p>
        
        <div className="bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] p-8 mb-8 border border-white/5 shadow-inner">
          <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-2">{item}</p>
          <div className="flex items-baseline justify-center gap-1">
            <h2 className="text-5xl font-black text-white">{amount}</h2>
            <span className="text-xl font-bold text-slate-500 italic">ETH</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-[10px] font-black uppercase transition-all border border-white/5 active:scale-95">
            <Download size={16} className="text-blue-500" /> Receipt
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-[10px] font-black uppercase transition-all border border-white/5 active:scale-95">
            <Share2 size={16} className="text-blue-500" /> Share
          </button>
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group">
          Back to Terminal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
        <span>Verified by Base L2</span>
        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
        <ExternalLink size={10} />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        theme="dark" 
        richColors 
        closeButton 
        toastOptions={{
          style: {
            background: '#0f1115',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            fontFamily: 'inherit'
          }
        }}
      />
      
      <Routes>
        {/* UPDATED ROUTE: Captures tabs like /settings or /overview */}
        <Route path="/:tabId?" element={<MerchantDashboard />} />
        
        {/* Payment route */}
        <Route path="/pay/:id" element={<PaymentPage />} />
        
        {/* Success route */}
        <Route path="/success" element={<SuccessPage />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
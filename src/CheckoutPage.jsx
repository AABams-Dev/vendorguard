import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, Globe } from 'lucide-react';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();

  const item = searchParams.get('item') || 'Secure Transaction';
  const amount = searchParams.get('amount') || '0.00';
  const merchant = searchParams.get('merchant') || 'VendorGuard Merchant';
  const lock = searchParams.get('lock') || '24';

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f1115] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header/Badge */}
        <div className="bg-blue-600 p-8 text-center relative">
          <div className="absolute top-4 right-6 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-white/80 uppercase">Secured</span>
          </div>
          <ShieldCheck size={48} className="text-white mx-auto mb-4" />
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Secure Checkout</h1>
          <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mt-1">Order Ref: {id}</p>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-10 space-y-8">
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Merchant</p>
              <h3 className="text-white font-bold">{merchant}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Protection</p>
              <h3 className="text-blue-400 font-bold">{lock}h Escrow</h3>
            </div>
          </div>

          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Item to Purchase</p>
            <h2 className="text-xl font-black text-white uppercase italic mb-4">{item}</h2>
            <div className="text-4xl font-black text-blue-500 italic">{amount} ETH</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                Funds will be held in a secure vault. The merchant only receives payment after you confirm delivery.
              </p>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group">
            Pay with Wallet <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex justify-center items-center gap-6 opacity-30 grayscale">
             <Globe size={16} /> <Lock size={16} /> <ShieldCheck size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
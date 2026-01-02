import React, { useState } from 'react';
import { 
  User, Shield, Wallet, Globe, 
  Camera, CheckCircle, Copy, 
  ChevronRight, Building2, Bell 
} from 'lucide-react';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      {/* HEADER */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Merchant Identity</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your professional presence</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* SIDEBAR NAVIGATION */}
        <div className="col-span-4 space-y-2">
          {[
            { id: 'profile', label: 'Public Profile', icon: <User size={16}/> },
            { id: 'financials', label: 'Settlement', icon: <Wallet size={16}/> },
            { id: 'security', label: 'Security', icon: <Shield size={16}/> },
            { id: 'notifications', label: 'Alerts', icon: <Bell size={16}/> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600/10 border border-blue-600/20 text-blue-400' 
                : 'text-slate-500 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                {tab.icon} {tab.label}
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="col-span-8 bg-[#0f1115] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {/* AVATAR UPLOAD */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl">
                    <Building2 size={40} className="text-white" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Vendor Name</h3>
                    <CheckCircle size={16} className="text-blue-500" />
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Member since Jan 2026</p>
                </div>
              </div>

              {/* FIELDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Email</label>
                  <input type="email" placeholder="contact@company.com" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Support Website</label>
                  <input type="text" placeholder="https://" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio / Service Description</label>
                <textarea rows="3" className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all resize-none" placeholder="Briefly describe your services..."></textarea>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="text-emerald-500" size={20} />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Withdrawal Address</h4>
                </div>
                <div className="flex gap-2">
                  <input readOnly value="0x5804...78B4" className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] font-mono text-emerald-500 outline-none" />
                  <button className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors">
                    <Copy size={16} className="text-slate-400" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-4 font-bold uppercase tracking-tight">
                  Funds from completed sales are automatically routed to this Base address.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
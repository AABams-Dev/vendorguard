import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Wallet, History, Settings, Bell, 
  ShieldCheck, TrendingUp, RefreshCcw, User, 
  Menu, X, Activity, AlertCircle, Camera, Shield, Lock,
  LayoutDashboard, Copy, Download, Zap, Fingerprint, ShieldAlert,
  BadgeCheck, CreditCard, Globe, Eye, ArrowUpRight, CheckCircle2,
  Clock, Landmark, ChevronRight, Link as LinkIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // <--- NEW
import { ethers } from 'ethers';
import { toast } from 'sonner';

const MerchantDashboard = () => {
  // --- ROUTING HOOKS ---
  const navigate = useNavigate();
  const { tabId } = useParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  // --- ROUTING LOGIC (Maps URL to your existing tab logic) ---
  const activeTab = useMemo(() => {
    if (!tabId) return 'Overview';
    // Capitalizes the first letter (e.g., 'settings' becomes 'Settings')
    return tabId.charAt(0).toUpperCase() + tabId.slice(1);
  }, [tabId]);

  // Core Data
  const [isVerified, setIsVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [transactions, setTransactions] = useState([]);
  
  // Payouts & History
  const [withdrawableBalance, setWithdrawableBalance] = useState("0.00");
  const [lockedEscrow, setLockedEscrow] = useState("0.00");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'PY-9012', amount: '0.450', date: 'Oct 24, 2025', status: 'Completed' },
    { id: 'PY-8841', amount: '1.200', date: 'Oct 20, 2025', status: 'Completed' }
  ]);
  
  // Professional Settings States
  const [companyName, setCompanyName] = useState('VendorGuard Pro');
  const [lockDuration, setLockDuration] = useState('24');
  const [profileImage, setProfileImage] = useState(null);
  const [autoSettle, setAutoSettle] = useState(true);

  // --- WALLET CONNECT LOGIC (Unchanged) ---
  const connectAuditWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          setIsVerified(true);
          const currentSettings = JSON.parse(localStorage.getItem('merchantSettings') || '{}');
          localStorage.setItem('merchantSettings', JSON.stringify({ ...currentSettings, walletAddress: address }));
          toast.success("Audit address linked successfully");
        }
      } catch (err) {
        toast.error(err.code === 4001 ? "Connection denied" : "Failed to connect");
      }
    } else {
      toast.error("Please install MetaMask");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsVerified(false);
    const currentSettings = JSON.parse(localStorage.getItem('merchantSettings') || '{}');
    const updatedSettings = { ...currentSettings };
    delete updatedSettings.walletAddress;
    localStorage.setItem('merchantSettings', JSON.stringify(updatedSettings));
    toast.info("Wallet session cleared locally");
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsVerified(true);
        } else {
          setWalletAddress('');
          setIsVerified(false);
        }
      });
    }
  }, []);

  // --- IMAGE UPLOAD (Unchanged) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('merchantLogo', reader.result);
        toast.success("Identity visual updated");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ACTIONS (Unchanged) ---
  const handleCreateLink = (e) => {
    e.preventDefault();
    const randomId = Math.random().toString(36).substring(7);
    const paymentUrl = `/pay/${randomId}?amount=${amount}&item=${encodeURIComponent(itemName)}&lock=${lockDuration}&merchant=${encodeURIComponent(companyName)}`;
    toast.success("Redirecting to Payment Gateway...");
    setTimeout(() => { window.location.href = paymentUrl; }, 600);
  };

  const handleWithdraw = async () => {
    if (parseFloat(withdrawableBalance) <= 0) return toast.error("No funds available.");
    setIsWithdrawing(true);
    setTimeout(() => {
      const newPayout = {
        id: `PY-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: withdrawableBalance,
        date: new Date().toLocaleDateString(),
        status: 'Completed'
      };
      setPayoutHistory([newPayout, ...payoutHistory]);
      setWithdrawableBalance("0.00");
      setIsWithdrawing(false);
      toast.success("Settlement Successful");
    }, 2000);
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('merchantHistory') || '[]');
    setTransactions(data);
    const total = data.reduce((acc, tx) => tx.status === 'Completed' ? acc + parseFloat(tx.amount || 0) : acc, 0);
    setWithdrawableBalance(total.toFixed(4));
    
    const saved = JSON.parse(localStorage.getItem('merchantSettings') || '{}');
    if (saved.companyName) setCompanyName(saved.companyName);
    if (saved.walletAddress) { setWalletAddress(saved.walletAddress); setIsVerified(true); }
    const savedLogo = localStorage.getItem('merchantLogo');
    if (savedLogo) setProfileImage(savedLogo);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0b0d] text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f1115] p-6 border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]"><ShieldCheck size={24} className="text-white" /></div>
            <span className="text-xl font-black tracking-tighter text-white italic uppercase">VendorGuard</span>
          </div>
          <nav className="space-y-2 flex-1">
            {[
              { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
              { icon: History, label: 'Transactions', path: '/transactions' },
              { icon: Wallet, label: 'Payouts', path: '/payouts' },
              { icon: Settings, label: 'Settings', path: '/settings' },
            ].map((item) => (
              <button 
                key={item.label} 
                onClick={() => { 
                  navigate(item.path); // <--- Updated to use Navigate
                  setIsSidebarOpen(false); 
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.label ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
                <item.icon size={20} />
                <span className="text-sm font-bold tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#0a0b0d]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 text-blue-500 bg-white/5 border border-white/10 rounded-xl"><Menu size={20} /></button>
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{activeTab}</h2>
          </div>
          <div className="h-10 w-10 rounded-full border border-white/20 bg-blue-600 flex items-center justify-center overflow-hidden">
            {profileImage ? <img src={profileImage} className="w-full h-full object-cover" alt="Profile" /> : <User size={18} />}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Available</p>
                    <h3 className="text-3xl font-black italic">{withdrawableBalance} ETH</h3>
                </div>
                <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">In Escrow</p>
                    <h3 className="text-3xl font-black italic text-blue-400">{lockedEscrow} ETH</h3>
                </div>
                <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Transactions</p>
                    <h3 className="text-3xl font-black italic text-emerald-400">{transactions.length}</h3>
                </div>
              </div>

              <div className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><Plus size={160} /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"><Plus className="text-white" size={24} /></div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Initiate Secured Deal</h2>
                    </div>
                    <form onSubmit={handleCreateLink} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Product Information</label>
                           <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="E.g. Digital Assets, Software License" className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Contract Value (ETH)</label>
                           <input type="number" step="0.0001" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20">
                           PROCEED TO PAYMENT
                        </button>
                    </form>
                  </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'Transactions' && (
            <div className="bg-[#0f1115] p-8 rounded-[3rem] border border-white/5 animate-in fade-in">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black italic uppercase">Audit Ledger</h3>
                  <div className="p-2 bg-white/5 border border-white/5 rounded-xl"><History size={18} className="text-slate-400" /></div>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="text-[10px] font-black text-slate-500 uppercase border-b border-white/5">
                    <tr>
                      <th className="pb-6">Timestamp</th>
                      <th className="pb-6">Asset/Item</th>
                      <th className="pb-6">Value</th>
                      <th className="pb-6 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-300">
                    {transactions.length > 0 ? transactions.map((tx, idx) => (
                      <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                        <td className="py-6 text-slate-500 font-mono text-xs">{tx.date}</td>
                        <td className="py-6 uppercase italic">{tx.item}</td>
                        <td className="py-6 text-blue-400">{tx.amount} ETH</td>
                        <td className="py-6 text-right">
                           <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">{tx.status}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="py-20 text-center text-slate-600 uppercase text-xs font-black tracking-widest">No transaction records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYOUTS TAB */}
          {activeTab === 'Payouts' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-800 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-20"><Landmark size={140} /></div>
                      <div className="relative z-10">
                        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-4">Treasury Settlement</p>
                        <h1 className="text-6xl font-black italic tracking-tighter mb-10">{withdrawableBalance} ETH</h1>
                        <button onClick={handleWithdraw} disabled={isWithdrawing || parseFloat(withdrawableBalance) <= 0} className="px-10 py-5 bg-white text-blue-900 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50 shadow-xl">
                           {isWithdrawing ? <RefreshCcw className="animate-spin" size={18}/> : <ArrowUpRight size={18}/>}
                           Proceed with Settlement
                        </button>
                      </div>
                   </div>
                   <div className="bg-[#0f1115] border border-white/5 p-10 rounded-[3.5rem] flex flex-col justify-between">
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receiving Node</h4>
                         <div className="p-5 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs text-blue-400 truncate italic">
                            {walletAddress || 'AUTH_REQUIRED'}
                         </div>
                      </div>
                      <div className="pt-6 border-t border-white/5 flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full animate-pulse ${walletAddress ? 'bg-emerald-500' : 'bg-red-500'}`} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${walletAddress ? 'text-emerald-500' : 'text-red-500'}`}>
                            {walletAddress ? 'Node Online' : 'Node Offline'}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'Settings' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
               <div className="bg-gradient-to-br from-[#15181e] to-[#0f1115] p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-black/40 border-2 border-white/5 overflow-hidden flex items-center justify-center relative">
                      {profileImage ? <img src={profileImage} className="w-full h-full object-cover" alt="Profile" /> : <User size={40} className="text-slate-700" />}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform z-20">
                      <Camera size={18} className="text-white" />
                    </button>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-3xl font-black italic uppercase text-white">{companyName}</h1>
                        <BadgeCheck className="text-blue-500" size={24} />
                     </div>
                     <p className="text-slate-500 text-xs font-black uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                        <Globe size={14} /> Global Merchant • Verified Provider
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="bg-[#0f1115] p-8 rounded-[3rem] border border-white/5 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><CreditCard size={16} /> Identity Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Public Merchant Name</label>
                              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500" />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Audit Address</label>
                              <div className="flex gap-2">
                                <div onClick={!walletAddress ? connectAuditWallet : null} className={`flex-1 p-5 bg-black/40 border rounded-2xl text-[10px] font-mono truncate transition-all flex justify-between items-center group ${walletAddress ? 'border-emerald-500/30 text-emerald-500' : 'border-white/5 text-slate-500 cursor-pointer hover:border-blue-500/50'}`}>
                                  <span>{walletAddress || 'CLICK TO CONNECT WALLET'}</span>
                                  <Fingerprint size={14} className={`${walletAddress ? 'text-emerald-500' : 'group-hover:text-blue-400'} transition-colors`} />
                                </div>
                                {walletAddress && (
                                  <button onClick={disconnectWallet} className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
                                )}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="bg-[#0f1115] p-8 rounded-[3rem] border border-white/5 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Lock size={16} /> Protocol Logic</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div onClick={() => setLockDuration('24')} className={`p-8 rounded-[2rem] border transition-all cursor-pointer ${lockDuration === '24' ? 'bg-blue-600/10 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                              <Activity size={24} className="text-blue-500 mb-4" />
                              <p className="text-sm font-black italic uppercase">Standard Guard</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">24H Security Lock</p>
                           </div>
                           <div onClick={() => setLockDuration('0')} className={`p-8 rounded-[2rem] border transition-all cursor-pointer ${lockDuration === '0' ? 'bg-emerald-600/10 border-emerald-500' : 'bg-white/5 border-white/5'}`}>
                              <Zap size={24} className="text-emerald-500 mb-4" />
                              <p className="text-sm font-black italic uppercase">Instant Flow</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Zero Latency Payout</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="bg-[#0f1115] border border-white/5 p-8 rounded-[3rem] space-y-8">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trust Rating</span>
                           <span className="text-sm font-black italic text-white">99.8%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 w-[99.8%]" />
                        </div>
                        <div className="pt-8 border-t border-white/5 space-y-4">
                           <div className="flex items-center justify-between cursor-pointer" onClick={() => setAutoSettle(!autoSettle)}>
                              <span className="text-[10px] font-black uppercase text-slate-400">Auto-Settle</span>
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${autoSettle ? 'bg-blue-600' : 'bg-white/10'}`}>
                                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoSettle ? 'right-1' : 'left-1'}`} />
                              </div>
                           </div>
                        </div>
                        <button onClick={() => { localStorage.setItem('merchantSettings', JSON.stringify({ companyName, walletAddress, lockDuration, autoSettle })); toast.success("Configuration Secured"); }} className="w-full bg-white text-blue-900 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-slate-100 active:scale-95 transition-all">Save Settings</button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;
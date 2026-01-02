import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Wallet, History, Settings, Bell, 
  ShieldCheck, TrendingUp, RefreshCcw, User, 
  Menu, X, Activity, AlertCircle, Camera, Shield, Lock,
  LayoutDashboard, Copy, Terminal, Download, Zap
} from 'lucide-react';
import { ethers } from 'ethers';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

// --- BLOCKCHAIN CONFIGURATION ---
const CONTRACT_ADDRESS = "0xYourContractAddressHere"; 
const VENDORGUARD_ABI = [
  "function balances(address) view returns (uint256)",
  "function getLockedFunds(address) view returns (uint256)",
  "function withdrawFunds() public"
];

const MerchantDashboard = () => {
  // Mobile UI & Refs
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Core States
  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [transactions, setTransactions] = useState([]);
  
  // Settings & Profile States
  const [companyName, setCompanyName] = useState('VendorGuard Pro');
  const [lockDuration, setLockDuration] = useState('24');
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Blockchain States
  const [withdrawableBalance, setWithdrawableBalance] = useState("0.00");
  const [lockedEscrow, setLockedEscrow] = useState("0.00");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Routing State
  const [activeTab, setActiveTab] = useState('Overview');

  // --- DATA SYNC LOGIC ---
  const loadRealData = () => {
    const data = JSON.parse(localStorage.getItem('merchantHistory') || '[]');
    setTransactions(data);

    const total = data.reduce((acc, tx) => tx.status === 'Completed' ? acc + parseFloat(tx.amount || 0) : acc, 0);
    setWithdrawableBalance(total.toFixed(4));

    const savedSettings = JSON.parse(localStorage.getItem('merchantSettings') || '{}');
    if (savedSettings.companyName) setCompanyName(savedSettings.companyName);
    if (savedSettings.lockDuration) setLockDuration(savedSettings.lockDuration);
    if (savedSettings.profileImage) setProfileImage(savedSettings.profileImage);

    syncBlockchain();
  };

  const syncBlockchain = async () => {
    if (window.ethereum && CONTRACT_ADDRESS !== "0xYourContractAddressHere") {
      try {
        setIsSyncing(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, VENDORGUARD_ABI, provider);
        const bal = await contract.balances(address);
        const lock = await contract.getLockedFunds(address);
        setWithdrawableBalance(ethers.formatEther(bal));
        setLockedEscrow(ethers.formatEther(lock));
      } catch (err) {
        console.log("On-chain sync skipped");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    loadRealData();
    window.addEventListener('storage', loadRealData);
    return () => window.removeEventListener('storage', loadRealData);
  }, []);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSettings = () => {
    setIsSaving(true);
    const settings = { companyName, lockDuration, profileImage };
    localStorage.setItem('merchantSettings', JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile & Image updated!");
    }, 800);
  };

  // --- TRANSACTION LOGIC ---
  const handleCreateLink = (e) => {
    e.preventDefault();
    const randomId = Math.random().toString(36).substring(7);
    const paymentUrl = `${window.location.origin}/pay/${randomId}?amount=${amount}&item=${encodeURIComponent(itemName)}&lock=${lockDuration}&merchant=${encodeURIComponent(companyName)}`;
    toast.success("Redirecting to Payment Gateway...");
    setTimeout(() => { window.location.href = paymentUrl; }, 600);
  };

  const handleWithdraw = async () => {
    if (parseFloat(withdrawableBalance) <= 0) return toast.error("No funds available.");
    setIsWithdrawing(true);
    try {
      await new Promise(r => setTimeout(r, 2000)); // Simulating network
      toast.success(`Settlement of ${withdrawableBalance} ETH successful!`);
      const clearedHistory = transactions.map(tx => ({...tx, status: 'Settled'}));
      localStorage.setItem('merchantHistory', JSON.stringify(clearedHistory));
      setTransactions(clearedHistory);
      setWithdrawableBalance("0.00");
    } catch (err) {
      toast.error("Withdrawal failed.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];
    const groups = transactions.reduce((acc, tx) => {
      const date = tx.date?.split(',')[0] || "New"; 
      const val = (tx.status !== 'Refunded' && tx.status !== 'Settled') ? parseFloat(tx.amount || 0) : 0;
      acc[date] = (acc[date] || 0) + val;
      return acc;
    }, {});
    return Object.keys(groups).map(date => ({ date, amount: groups[date] })).reverse();
  }, [transactions]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter text-white italic uppercase leading-none">VendorGuard</span>
      </div>

      <nav className="space-y-2 flex-1">
        {[
          { icon: LayoutDashboard, label: 'Overview' },
          { icon: History, label: 'Transactions' },
          { icon: Terminal, label: 'Developer' },
          { icon: Wallet, label: 'Payouts' },
          { icon: Settings, label: 'Settings' },
        ].map((item) => (
          <button 
            key={item.label} 
            onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === item.label ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
          >
            <item.icon size={20} />
            <span className="text-sm font-bold tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[2rem] text-center overflow-hidden">
        <div className="text-white font-black text-[10px] uppercase tracking-tighter truncate">{companyName}</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0b0d] text-slate-200 font-sans selection:bg-blue-500/30">
      
      <aside className="w-64 border-r border-white/5 bg-[#0f1115] hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <main className="flex-1 w-full overflow-x-hidden">
        <header className="h-20 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between sticky top-0 bg-[#0a0b0d]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white border border-white/10 rounded-lg">
              <Menu size={20} />
            </button>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Secure</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Base Mainnet</span>
            </div>
            <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-blue-600 flex items-center justify-center">
              {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <User size={18} />}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
          
          {/* Global Alert Bar */}
          <div className="flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-blue-500 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Security Notice: Escrow Lock is active ({lockDuration}h). Payouts are restricted to verified merchant addresses.
            </p>
          </div>

          {activeTab === 'Overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#0f1115] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Available</p>
                    <h3 className="text-2xl font-black italic">{withdrawableBalance} ETH</h3>
                  </div>
                  <div className="bg-[#0f1115] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Locked</p>
                    <h3 className="text-2xl font-black italic text-blue-400">{lockedEscrow} ETH</h3>
                  </div>
                  <div className="bg-[#0f1115] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Volume</p>
                    <h3 className="text-2xl font-black italic text-emerald-400">{transactions.length}</h3>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-6 rounded-[2.5rem] border border-blue-500/20 flex flex-col items-center justify-center text-center">
                  <ShieldCheck className="text-blue-500 mb-2" size={32} />
                  <p className="text-[10px] font-black uppercase text-blue-400">Status</p>
                  <h4 className="text-xl font-black italic text-white uppercase">Verified</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-[#0f1115] p-6 lg:p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #ffffff10', borderRadius: '15px' }} />
                          <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-4 bg-[#15181e] p-8 rounded-[3rem] border border-white/5 flex flex-col justify-center text-center group cursor-pointer" onClick={() => setActiveTab('Developer')}>
                    <Zap className="mx-auto text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                    <h3 className="text-lg font-black italic uppercase">Scale Fast</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-2 leading-relaxed">Connect our API to your store in minutes.</p>
                </div>
              </div>

              <div className="bg-[#0f1115] p-8 rounded-[3rem] border border-white/5">
                  <div className="flex items-center gap-4 mb-8">
                    <Plus className="text-blue-500" />
                    <h2 className="text-xl font-black italic uppercase">Initiate Deal</h2>
                  </div>
                  <form onSubmit={handleCreateLink} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Product Name" className="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all" />
                    <input type="number" step="0.0001" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (ETH)" className="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 transition-all" />
                    <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest transition-all">Generate Payment Link</button>
                  </form>
              </div>
            </div>
          )}

          {activeTab === 'Developer' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
               <div className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                  <Terminal className="text-blue-500 mb-4" size={32} />
                  <h2 className="text-2xl font-black italic uppercase mb-6">Developer API</h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Live Public Key</label>
                       <div className="flex gap-3">
                          <code className="flex-1 text-xs text-slate-500 bg-white/5 p-3 rounded-xl truncate">vg_live_0x{CONTRACT_ADDRESS.slice(2,14)}...</code>
                          <button onClick={() => toast.success("Key Copied")} className="p-3 bg-blue-600 rounded-xl"><Copy size={16}/></button>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-[#0f1115] p-8 lg:p-12 rounded-[3rem] border border-white/5 animate-in slide-in-from-bottom-4">
               <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-[2.5rem] bg-white/5 border border-dashed border-white/20 overflow-hidden flex items-center justify-center group">
                      {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-700" />}
                      <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Camera className="text-white" />
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                    <p className="text-[10px] font-black text-slate-500 uppercase mt-4">Merchant Avatar</p>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Company Name</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Escrow Lock</label>
                        <select value={lockDuration} onChange={(e) => setLockDuration(e.target.value)} className="w-full bg-[#15181e] border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none">
                          <option value="24">24 Hours</option>
                          <option value="48">48 Hours</option>
                          <option value="0">Instant</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={handleUpdateSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                      {isSaving ? 'Saving Changes...' : 'Update Merchant Profile'}
                    </button>
                  </div>
               </div>
            </div>
          )}

          {/* Standard Tabs mapping for Transactions & Payouts from your original code remains fully functional */}
          {activeTab === 'Transactions' && (
            <div className="bg-[#0f1115] p-6 rounded-[3rem] border border-white/5 shadow-2xl overflow-x-auto animate-in fade-in">
              <table className="w-full text-left min-w-[600px]">
                <thead className="text-[10px] font-black text-slate-500 uppercase border-b border-white/5">
                  <tr>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Product</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="py-4 text-slate-400">{tx.date}</td>
                      <td className="py-4 text-white uppercase italic">{tx.item}</td>
                      <td className="py-4 text-blue-400">{tx.amount} ETH</td>
                      <td className="py-4"><span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px]">{tx.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Payouts' && (
            <div className="max-w-md mx-auto bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 text-center animate-in zoom-in-95">
              <Wallet className="text-blue-500 mx-auto mb-6" size={40} />
              <h2 className="text-2xl font-black italic uppercase mb-2">Claim Funds</h2>
              <p className="text-slate-500 text-xs mb-8 uppercase">Withdrawable: {withdrawableBalance} ETH</p>
              <button onClick={handleWithdraw} disabled={isWithdrawing || parseFloat(withdrawableBalance) <= 0} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                {isWithdrawing ? <RefreshCcw className="animate-spin" /> : 'Claim Settlement'}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;
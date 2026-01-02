import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Wallet, Package, CheckCircle, Copy, 
  LayoutDashboard, History, Settings, Bell, 
  Search, ShieldCheck, ArrowUpRight, TrendingUp,
  Clock, RefreshCcw, ExternalLink, Download, User, Shield, Menu, X,
  Zap, Activity, Key, AlertCircle, Globe, Terminal // Added for new modules
} from 'lucide-react';
import { ethers } from 'ethers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// --- BLOCKCHAIN CONFIGURATION ---
const CONTRACT_ADDRESS = "0xYourContractAddressHere"; 
const VENDORGUARD_ABI = [
  "function balances(address) view returns (uint256)",
  "function getLockedFunds(address) view returns (uint256)",
  "function withdrawFunds() public"
];

const MerchantDashboard = () => {
  // Mobile UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Existing States
  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [refunding, setRefunding] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Settings States
  const [companyName, setCompanyName] = useState('VendorGuard Pro');
  const [lockDuration, setLockDuration] = useState('24');
  const [isSaving, setIsSaving] = useState(false);

  // Blockchain & Payout States
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

    const total = data.reduce((acc, tx) => {
      return tx.status === 'Completed' ? acc + parseFloat(tx.amount || 0) : acc;
    }, 0);
    setWithdrawableBalance(total.toFixed(4));

    const savedSettings = JSON.parse(localStorage.getItem('merchantSettings') || '{}');
    if (savedSettings.companyName) setCompanyName(savedSettings.companyName);
    if (savedSettings.lockDuration) setLockDuration(savedSettings.lockDuration);

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

  const handleUpdateSettings = () => {
    setIsSaving(true);
    const settings = { companyName, lockDuration };
    localStorage.setItem('merchantSettings', JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated!");
    }, 800);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return toast.error("No data found.");
    const headers = ["Date", "Item", "Amount", "Status"];
    const csvRows = transactions.map(tx => [tx.date, tx.item, tx.amount, tx.status]);
    const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "VendorGuard_History.csv";
    link.click();
  };

  const handleWithdraw = async () => {
    if (parseFloat(withdrawableBalance) <= 0) return toast.error("No funds available.");
    setIsWithdrawing(true);
    try {
      if (window.ethereum && CONTRACT_ADDRESS !== "0xYourContractAddressHere") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, VENDORGUARD_ABI, signer);
        const tx = await contract.withdrawFunds();
        await tx.wait();
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
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

  const handleCreateLink = (e) => {
    e.preventDefault();
    const randomId = Math.random().toString(36).substring(7);
    const finalLink = `${window.location.origin}/pay/${randomId}?amount=${amount}&item=${encodeURIComponent(itemName)}&lock=${lockDuration}`;
    setGeneratedLink(finalLink);
    toast.info("Link generated!");
  };

  const handleRefund = async (tx) => {
    if (!window.ethereum) return toast.error("MetaMask required");
    try {
      setRefunding(tx.id);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const refundTx = await signer.sendTransaction({
        to: tx.customerAddress || "0x0000000000000000000000000000000000000000",
        value: ethers.parseUnits(tx.amount.toString(), "ether")
      });
      await refundTx.wait();
      const updated = transactions.map(item => item.id === tx.id ? { ...item, status: 'Refunded' } : item);
      setTransactions(updated);
      localStorage.setItem('merchantHistory', JSON.stringify(updated));
      toast.success("Refund Successful!");
    } catch (err) {
      toast.error("Refund failed.");
    } finally {
      setRefunding(null);
    }
  };

  // --- REUSABLE SIDEBAR COMPONENT ---
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
          { icon: Terminal, label: 'Developer' }, // NEW
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
        <button onClick={exportToCSV} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-white/5 transition-all mt-4">
          <Download size={20} />
          <span className="text-sm font-bold tracking-wide">Export CSV</span>
        </button>
      </nav>

      <div className="mt-auto bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[2rem] text-center">
        <div className="text-white font-black text-[10px] uppercase tracking-tighter truncate">{companyName}</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0b0d] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#0f1115] hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0f1115] p-6 border-r border-white/10 animate-in slide-in-from-left duration-300">
            <button className="absolute top-6 right-6 text-slate-400" onClick={() => setIsSidebarOpen(false)}><X /></button>
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 w-full overflow-x-hidden">
        {/* HEADER */}
        <header className="h-20 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between sticky top-0 bg-[#0a0b0d]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
              <Menu />
            </button>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{activeTab}</h2>
            {isSyncing && <RefreshCcw size={14} className="animate-spin text-blue-500" />}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Base Mainnet</span>
                <span className="text-[9px] text-slate-500 font-bold">Latency: 12ms</span>
            </div>
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-slate-500 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">
              {companyName.substring(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-10">
          
          {activeTab === 'Overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* 1. TOP STATS + TRUST SCORE (Filling the 4th column) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                  <div className="bg-[#0f1115] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Withdrawable</p>
                    <h3 className="text-2xl lg:text-3xl font-black italic text-white">{withdrawableBalance} ETH</h3>
                  </div>
                  <div className="bg-[#0f1115] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Locked Escrow</p>
                    <h3 className="text-2xl lg:text-3xl font-black italic text-blue-400">{lockedEscrow} ETH</h3>
                  </div>
                  <div className="bg-[#0f1115] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Orders</p>
                    <h3 className="text-2xl lg:text-3xl font-black italic text-emerald-400">{transactions.length}</h3>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-6 rounded-[2.5rem] border border-blue-500/20 flex flex-col items-center justify-center text-center">
                  <ShieldCheck className="text-blue-500 mb-2" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Merchant Trust</p>
                  <h4 className="text-2xl font-black italic text-white">98%</h4>
                </div>
              </div>

              {/* 2. CHART AREA & NETWORK HEALTH GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-[#0f1115] p-6 lg:p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                   <div className="flex justify-between items-center mb-8 px-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Revenue flow</h3>
                      <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                         <TrendingUp size={12} className="text-emerald-500"/>
                         <span className="text-[10px] font-black text-emerald-500">+12%</span>
                      </div>
                   </div>
                   <div className="h-[280px] w-full">
                      {transactions.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #ffffff10', borderRadius: '15px' }} />
                            <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl text-slate-600 text-[10px] uppercase font-black tracking-widest text-center px-4">Awaiting Data...</div>
                      )}
                   </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  {/* Network Health Widget */}
                  <div className="bg-[#15181e] p-6 rounded-[2.5rem] border border-white/5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
                      <Activity size={14} className="text-blue-500"/> Network Health
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">Base Status</span>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Operational
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">Gas (Gwei)</span>
                        <span className="text-xs font-mono text-white">1.2 Gwei</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth CTA Widget */}
                  <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl group cursor-pointer overflow-hidden relative" onClick={() => setActiveTab('Developer')}>
                    <Zap className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform" size={80} />
                    <h4 className="text-white font-black italic uppercase text-lg mb-1">Scale Fast</h4>
                    <p className="text-blue-100 text-[9px] leading-relaxed opacity-80 uppercase font-black">Integrate our API into your custom storefront in minutes.</p>
                  </div>
                </div>
              </div>

              {/* 3. ACTION TOOLS (Existing Deal Generation) */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
                <div className="xl:col-span-3 bg-[#0f1115] p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500"><Plus size={24} /></div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Generate Deal</h2>
                  </div>
                  <form onSubmit={handleCreateLink} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Product Name</label>
                        <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Digital Asset" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Amount (ETH)</label>
                        <input type="number" step="0.0001" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] transition-all active:scale-[0.98]">Generate Payment Link</button>
                  </form>

                  {generatedLink && (
                    <div className="mt-8 p-4 lg:p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl animate-in zoom-in-95 duration-300">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Link Ready</p>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input readOnly value={generatedLink} className="w-full flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-xs font-mono text-slate-300 outline-none overflow-hidden text-ellipsis" />
                        <button onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Link copied!"); }} className="w-full sm:w-auto p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white flex justify-center"><Copy size={18} /></button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="xl:col-span-2 bg-[#15181e] p-6 lg:p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Recent Activity</h4>
                  <div className="space-y-6">
                    {transactions.slice(0, 5).map((tx, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-300 uppercase truncate">{tx.item}</span>
                          <span className="text-[8px] text-slate-500">{tx.date}</span>
                        </div>
                        <span className={`text-xs font-black ml-4 ${tx.status === 'Settled' ? 'text-slate-500' : 'text-white'}`}>{tx.amount} ETH</span>
                      </div>
                    ))}
                    {transactions.length === 0 && <p className="text-center text-[10px] text-slate-600 font-black uppercase py-10">No Transactions Yet</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Developer' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-[#0f1115] p-8 lg:p-12 rounded-[3rem] border border-white/5">
                  <h2 className="text-xl font-black italic uppercase mb-2">API Access</h2>
                  <p className="text-slate-500 text-xs mb-10 uppercase tracking-widest">Connect your custom frontend to VendorGuard</p>
                  
                  <div className="space-y-8">
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Public API Key</label>
                       <div className="flex gap-3">
                          <code className="flex-1 text-xs text-slate-400 bg-white/5 p-3 rounded-xl truncate">vg_live_0x{CONTRACT_ADDRESS.slice(2,12)}...</code>
                          <button className="p-3 bg-blue-600 rounded-xl" onClick={() => toast.success("API Key Copied")}><Copy size={16}/></button>
                       </div>
                    </div>

                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Webhook Notification URL</label>
                       <div className="flex gap-3">
                          <input type="text" placeholder="https://your-api.com/v1/webhook" className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none" />
                          <button className="px-6 bg-blue-600 rounded-xl text-[10px] font-black uppercase">Save</button>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* ... Remaining Tabs: Transactions, Payouts, Settings (Same as your previous code) ... */}
          {activeTab === 'Transactions' && (
            <div className="bg-[#0f1115] p-4 lg:p-8 rounded-[2rem] lg:rounded-[3rem] border border-white/5 shadow-2xl overflow-x-auto">
               <table className="w-full text-left min-w-[600px]">
                  <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                    <tr>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Product</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 text-slate-400">{tx.date}</td>
                        <td className="py-4 text-white uppercase italic">{tx.item}</td>
                        <td className="py-4 text-blue-400">{tx.amount} ETH</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] ${
                            tx.status === 'Refunded' ? 'bg-red-500/10 text-red-500' : 
                            tx.status === 'Settled' ? 'bg-blue-500/10 text-blue-500' : 
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleRefund(tx)} disabled={tx.status === 'Refunded' || tx.status === 'Settled'} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg disabled:opacity-30"><RefreshCcw size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'Payouts' && (
            <div className="max-w-md mx-auto bg-[#0f1115] p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-white/5 text-center shadow-2xl">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="text-blue-500" size={32}/>
              </div>
              <h2 className="text-xl lg:text-2xl font-black italic uppercase mb-2">Claim Funds</h2>
              <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest">Available: {withdrawableBalance} ETH</p>
              <button onClick={handleWithdraw} disabled={isWithdrawing || parseFloat(withdrawableBalance) <= 0} className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${parseFloat(withdrawableBalance) > 0 ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}>
                {isWithdrawing ? <RefreshCcw size={18} className="animate-spin" /> : 'Claim Settlement'}
              </button>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-[#0f1115] p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3"><Settings className="text-blue-500"/> Account Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Company Name</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="VendorGuard Pro" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Escrow Lock Duration</label>
                  <select value={lockDuration} onChange={(e) => setLockDuration(e.target.value)} className="w-full bg-[#1a1d23] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer focus:border-blue-500/50 transition-all hover:bg-[#22262e]">
                    <option value="24">24 Hours (Default)</option>
                    <option value="48">48 Hours (High Security)</option>
                    <option value="0">Instant (Trusted Partners)</option>
                  </select>
                </div>
              </div>
              <div className="mt-10 pt-10 border-t border-white/5">
                <button onClick={handleUpdateSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-black px-8 py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  {isSaving ? 'Updating...' : 'Update Profile Settings'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;
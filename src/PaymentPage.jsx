import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Lock, CreditCard, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { toast } from 'sonner'; // 1. Added Sonner import

const PaymentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('none');
  const [status, setStatus] = useState('idle');

  const queryParams = new URLSearchParams(location.search);
  const realAmount = queryParams.get('amount') || "0.00"; 
  const itemName = queryParams.get('item') || "Secure Asset";

  // --- CONFIG ---
  const BASE_CHAIN_ID = '0x2105'; // Base Mainnet
  const MY_WALLET_ADDRESS = "0x5804c1B017a18a23460Eb0fBb1FC33684D3178B4"; 

  // --- REFINED SAVE LOGIC ---
  const saveToHistory = (txId, method, customerAddr = "Secure User") => {
    const newTx = {
      id: txId,
      amount: realAmount, 
      item: itemName,
      date: new Date().toLocaleString(),
      customerAddress: customerAddr,
      method: method,
      status: 'Completed'
    };
    
    const history = JSON.parse(localStorage.getItem('merchantHistory') || '[]');
    localStorage.setItem('merchantHistory', JSON.stringify([newTx, ...history]));
    window.dispatchEvent(new Event('storage'));
  };

  const handleCryptoPay = async () => {
    if (!window.ethereum) return toast.error("MetaMask extension not found."); // 2. Replaced Alert

    try {
      setStatus('processing');
      toast.info("Connecting to wallet...");

      // 1. Request Wallet Connection
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 2. Switch to Base
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_CHAIN_ID }],
        });
      } catch (err) {
        if (err.code === 4902) {
          toast.info("Adding Base Network to your wallet...");
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_CHAIN_ID,
              chainName: 'Base',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 3. EXECUTE REAL TRANSACTION
      toast.info("Waiting for your confirmation in MetaMask...");
      const tx = await signer.sendTransaction({
        to: MY_WALLET_ADDRESS,
        value: ethers.parseEther("0.00001") 
      });

      // 4. WAIT FOR CONFIRMATION
      toast.promise(tx.wait(), {
        loading: 'Verifying transaction on the blockchain...',
        success: 'Payment Verified!',
        error: 'Verification failed.',
      });

      await tx.wait(); 
      
      // 5. LOG TO MERCHANT DATABASE
      saveToHistory(tx.hash, 'Crypto (Base)', accounts[0]);
      
      // 6. SUCCESS REDIRECT
      toast.success("Payment complete! Redirecting...");
      setTimeout(() => {
        navigate(`/success?amount=${realAmount}&item=${encodeURIComponent(itemName)}&tx=${tx.hash}`);
      }, 1500);

    } catch (err) {
      console.error("Payment Error:", err);
      setStatus('idle');
      // 3. Professional error handling
      if (err.code === 4001) {
        toast.error("Transaction was cancelled by user.");
      } else {
        toast.error("Blockchain Error: " + (err.reason || "Payment failed"));
      }
    }
  };

  const handleSecureCardPay = (e) => {
    e.preventDefault();
    setStatus('processing');
    toast.info("Securing connection to card processor...");
    
    setTimeout(() => {
      const mockTxId = "CARD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      saveToHistory(mockTxId, 'Credit Card');
      toast.success("Card Authorized Successfully!");
      
      setTimeout(() => {
        navigate(`/success?amount=${realAmount}&item=${encodeURIComponent(itemName)}&tx=${mockTxId}`);
      }, 1000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-slate-200 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        
        {/* BRANDING */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] mb-4 transform rotate-12">
            <Zap size={32} className="text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">VendorGuard</h1>
          <span className="text-[10px] font-bold tracking-[0.3em] text-blue-500 uppercase mt-1 text-center">Protocol Secured</span>
        </div>

        <div className="bg-[#0f1115] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="p-8 border-b border-white/5 bg-white/[0.01]">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setPaymentMethod('none')} className="text-slate-500 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest text-center">Live Gateway</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{itemName}</p>
            <h2 className="text-4xl font-black text-white tracking-tighter">${realAmount}</h2>
          </div>

          <div className="p-8">
            {paymentMethod === 'none' && (
              <div className="space-y-4">
                <button onClick={() => setPaymentMethod('crypto')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                  <Zap size={18} className="fill-current" /> Pay with ETH (Base)
                </button>
                <button onClick={() => setPaymentMethod('card')} className="w-full bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                  <CreditCard size={18} /> Pay with Card
                </button>
              </div>
            )}

            {paymentMethod === 'card' && (
              <form onSubmit={handleSecureCardPay} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl mb-4 flex items-center gap-3">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <p className="text-[9px] text-blue-300 uppercase font-bold tracking-tight">SSL Encrypted Card Processing</p>
                </div>
                <div className="space-y-3">
                   <input required type="text" placeholder="CARDHOLDER NAME" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all uppercase text-white" />
                   <input required type="text" placeholder="CARD NUMBER" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all text-white" />
                   <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all text-white" />
                      <input required type="text" placeholder="CVC" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all text-white" />
                   </div>
                </div>
                <button type="submit" disabled={status === 'processing'} className="w-full bg-white text-black font-black py-5 rounded-2xl text-[12px] uppercase tracking-widest mt-4 flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95">
                  {status === 'processing' ? <Loader2 className="animate-spin" size={18} /> : `Confirm $${realAmount} Payment`}
                </button>
              </form>
            )}

            {paymentMethod === 'crypto' && (
              <div className="text-center py-6 animate-in fade-in">
                <div className="bg-blue-500/10 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Zap size={30} className="text-blue-500 fill-current" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1 tracking-tight">Base Network</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-8 px-4">Instant Transfer to {MY_WALLET_ADDRESS.substring(0,6)}...</p>
                <button onClick={handleCryptoPay} disabled={status === 'processing'} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[12px] uppercase tracking-widest transition-all">
                  {status === 'processing' ? <Loader2 className="animate-spin inline mr-2" /> : 'Confirm with MetaMask'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
import { useState } from 'react';
import { BiWallet, BiPlusCircle, BiHistory, BiX, BiCheckCircle, BiCoin, BiLockAlt, BiShieldQuarter, BiMinusCircle } from 'react-icons/bi';
import Input from '@/components/UI/Input';
import SubmitButton from '@/components/UI/submit-btn';
import mpes_logo from '@assets/branding/mpesa-logo.png';
import AuthLayout from '@/layouts/auth-layout';

interface TransactionLog {
  id: string;
  reference: string;
  type: 'topup' | 'payment' | 'escrow_hold' | 'escrow_release' | 'withdrawal';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
}

const DUMMY_HISTORY: TransactionLog[] = [
  { id: '1', reference: 'NLK83JD72S', type: 'topup', amount: 1500, date: '2026-06-11 14:22', status: 'completed', description: 'M-Pesa Deposit' },
  { id: '2', reference: 'NLM29DH83K', type: 'escrow_hold', amount: -1250, date: '2026-06-11 11:05', status: 'pending', description: 'Held for Order #4412' },
  { id: '3', reference: 'NLM29DH829', type: 'payment', amount: -420, date: '2026-06-10 09:15', status: 'completed', description: 'Delivery Rider Fee' },
  { id: '4', reference: 'NLN45GG21P', type: 'withdrawal', amount: -500, date: '2026-06-08 10:12', status: 'completed', description: 'M-Pesa B2C Payout' }
];

export default function WalletPage() {
  // Modal toggle engines
  const [activeModal, setActiveModal] = useState<'topup' | 'withdraw' | null>(null);
  
  // Shared structural state layers
  const [phone, setPhone] = useState('254');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Financial Architecture parameters
  const availableBalance = 2450.00;
  const heldBalance = 1250.00;
  const totalBalance = availableBalance + heldBalance;

  // Utility to clear modal configurations safely
  const closeModal = () => {
    setActiveModal(null);
    setValidationError(null);
    setAmount('');
    setSuccess(false);
    setLoading(false);
  };

  const handleMpesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Check phone context pattern
    const phoneRegex = /^254[1-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setValidationError('Provide a valid Kenyan number format starting with 254 (e.g., 254712345678).');
      return;
    }

    const numericAmount = parseFloat(amount);

    // 2. Conditional action validation logic
    if (activeModal === 'topup') {
      if (isNaN(numericAmount) || numericAmount < 1 || numericAmount > 150000) {
        setValidationError('Topup value metrics must span inside Ksh 1 to Ksh 150,000 layers.');
        return;
      }
    } else if (activeModal === 'withdraw') {
      if (isNaN(numericAmount) || numericAmount < 10 || numericAmount > 50000) {
        setValidationError('M-Pesa channel payout limits require values between Ksh 10 and Ksh 50,000.');
        return;
      }
      if (numericAmount > availableBalance) {
        setValidationError('Insufficient spendable balance. Locked escrow funds cannot be withdrawn.');
        return;
      }
    }

    // Trigger synthetic pipeline latency simulation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 2500);
    }, 2000);
  };

  return (
    <section className="min-h-screen bg-surface p-4 md:p-6 font-sans antialiased">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Dynamic State Portfolio Dashboard Balance Grid */}
        <div className="bg-surface-container-highest border border-outline-variant rounded-3xl shadow-elevation-2 overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-outline-variant">
            
            {/* Available Spendable Liquidity */}
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-primary-container text-on-primary-container rounded-2xl shrink-0">
                <BiWallet className="text-2xl" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant block">Available Cash</span>
                <h2 className="text-2xl font-black-tight tracking-tight text-on-surface">Ksh {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
            </div>

            {/* Escrow Block Allocation */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="p-3.5 bg-tertiary-container text-on-tertiary-container rounded-2xl shrink-0">
                <BiLockAlt className="text-2xl" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant block">Held / In Escrow</span>
                <h2 className="text-2xl font-black-tight tracking-tight text-on-surface-variant">Ksh {heldBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
            </div>

            {/* Combined Capital Statement */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="p-3.5 bg-surface-container-low border border-outline-variant text-on-surface rounded-2xl shrink-0">
                <BiShieldQuarter className="text-2xl" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant block">Total Asset Cap</span>
                <h2 className="text-2xl font-black-tight tracking-tight text-primary">Ksh {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
            </div>

          </div>

          {/* Bi-Directional Interactive Portal Controls */}
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="body-sm text-on-surface-variant text-center sm:text-left">
              Escrow assets clear securely automatically processing ongoing delivery arrivals.
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setActiveModal('withdraw')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-surface-container-highest border border-outline-variant text-on-surface hover:bg-surface-variant/50 font-bold rounded-xl flex items-center justify-center gap-1.5 text-sm transition-all"
              >
                <BiMinusCircle className="text-lg text-error" /> Withdraw
              </button>
              <button 
                onClick={() => setActiveModal('topup')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-primary text-on-primary hover:bg-primary/90 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-elevation-1 transition-all text-sm shrink-0"
              >
                <BiPlusCircle className="text-lg" /> Topup
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Tracking Ledger Log */}
        <div className="border border-outline-variant bg-surface-container-lowest rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-3 text-on-surface-variant">
            <BiHistory className="text-xl" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Account Transaction History</h3>
          </div>

          <div className="divide-y divide-outline-variant">
            {DUMMY_HISTORY.map((tx) => (
              <div key={tx.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 animate-slide-up">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase ${
                      tx.type === 'topup' ? 'bg-success-container text-on-success-container' : 
                      tx.type === 'escrow_hold' ? 'bg-warning-container text-on-warning-container' : 
                      tx.type === 'withdrawal' ? 'bg-error-container text-on-error-container' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {tx.type === 'topup' && 'M-Pesa Deposit'}
                      {tx.type === 'escrow_hold' && 'Escrow Locked'}
                      {tx.type === 'payment' && 'Order Payment'}
                      {tx.type === 'withdrawal' && 'Cashout Outflow'}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant tracking-wider">{tx.reference}</span>
                  </div>
                  <p className="text-xs font-medium text-on-surface">{tx.description}</p>
                  <p className="text-[11px] text-on-surface-variant">{tx.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-base font-black-tight ${tx.amount > 0 ? 'text-success' : tx.type === 'escrow_hold' ? 'text-on-surface-variant opacity-70' : 'text-on-surface'}`}>
                    {tx.amount > 0 ? `+Ksh ${tx.amount.toLocaleString()}` : `-Ksh ${Math.abs(tx.amount).toLocaleString()}`}
                  </span>
                  <span className={`block text-[10px] font-bold ${tx.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Polymorphic Dynamic M-Pesa Transaction Overlay Sheet Interface */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-surface-container-lowest border border-outline-variant w-full max-w-md rounded-3xl p-6 shadow-elevation-5 relative space-y-6">
              
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div className="flex items-center gap-3">
                  <img src={mpes_logo} className="h-7 object-contain" alt="M-Pesa Logo" />
                  <span className="text-xs text-on-surface-variant font-bold border-l border-outline-variant pl-3">
                    {activeModal === 'topup' ? 'STK Push System' : 'B2C Pay Outport'}
                  </span>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-surface-variant rounded-xl text-on-surface-variant transition-colors">
                  <BiX className="text-2xl" />
                </button>
              </div>

              {success ? (
                <div className="py-8 text-center space-y-3 flex flex-col items-center animate-scale-in">
                  <BiCheckCircle className="text-6xl text-success animate-bounce" />
                  <h4 className="title-md font-bold text-on-surface">
                    {activeModal === 'topup' ? 'Prompt Transmitted' : 'Disbursement Dispatched'}
                  </h4>
                  <p className="body-sm text-on-surface-variant max-w-xs mx-auto text-center">
                    {activeModal === 'topup' 
                      ? 'Check your handset screen context layer for the authorization pin validation grid.' 
                      : 'The requested liquidation payload has issued. You will receive a notification via Safaricom utility shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMpesaSubmit} className="space-y-5">
                  {validationError && (
                    <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-medium border border-error/20">
                      {validationError}
                    </div>
                  )}

                  <Input 
                    label={activeModal === 'topup' ? "Safaricom Registered Phone Number *" : "Destination Mobile Wallet Number *"}
                    placeholder="254712345678" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.trim())}
                    disabled={loading}
                  />

                  <Input 
                    label={activeModal === 'topup' ? "Topup Loading Amount (Ksh) *" : "Withdrawal Liquidate Volume (Ksh) *"}
                    type="number"
                    placeholder={activeModal === 'topup' ? "Min: 1, Max: 150,000" : `Max Spendable: Ksh ${availableBalance}`} 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                  />

                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-start gap-2.5">
                    <BiCoin className="text-lg text-primary mt-0.5" />
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {activeModal === 'topup' 
                        ? 'Submitting will broadcast an instant, secure Safaricom cryptographic STK menu window directly onto your active SIM line to prompt manual PIN insertion safely.'
                        : 'Submitting executes an asynchronous institutional bank settlement routing directly to the specified destination Safaricom ledger node immediately.'}
                    </p>
                  </div>

                  <SubmitButton 
                    className='bg-green-500 text-white w-full'
                    label={
                      loading 
                        ? 'Processing Interconnect Link...' 
                        : activeModal === 'topup' 
                          ? 'Initiate M-Pesa Topup' 
                          : 'Confirm Cash Outbound'
                    } 
                    disabled={loading || !amount || !phone} 
                  />
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
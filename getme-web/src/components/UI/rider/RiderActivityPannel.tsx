import React, { useState } from 'react';
import { TiMessages } from 'react-icons/ti';
import { 
  FaPhoneAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCoins, 
  FaCheckCircle, 
  FaExpandAlt, 
  FaCompressAlt 
} from 'react-icons/fa';
import { useUIStore } from '@/stores/uiStore';
import map_dark from '@/assets/map-dark.png';
import map_light from '@/assets/map-light.png';
import StageTracker from '@/components/user/stage-tracker';

export interface RiderLiveActivityPanelProps {
  stages: {
    label: string;
    id: string;
    icon: React.ReactNode;
  }[];
  activeStageIndex: number;
}

function RiderLiveActivityPanel({ stages, activeStageIndex: initialStageIndex }: RiderLiveActivityPanelProps) {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  
  const [activeStageIndex, setActiveStageIndex] = useState(initialStageIndex);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [jobCompleted, setJobCompleted] = useState(false);

  // Simulated operational order metadata
  const paymentMethod = 'CASH_ON_DELIVERY'; // Changes alert layout color variables
  const transportFee = 350;
  const clientName = "Dennis N.";
  const dropoffLocation = "Kilimani, Woodley Estate";

  const handleNextStep = () => {
    if (activeStageIndex < stages.length - 1) {
      setActiveStageIndex(prev => prev + 1);
    } else {
      setJobCompleted(true);
    }
  };

  return (
    <div className={`w-full flex flex-col transition-all duration-300 font-sans antialiased ${
      isMapExpanded ? 'md:basis-full lg:basis-full' : 'md:basis-2/5'
    }`}>
      <div className="border mx-4 rounded-3xl bg-surface flex-1 min-h-0 overflow-hidden shadow-xl border-outline-variant/30 flex flex-col">
        
        {/* 1. Header Row - Telemetry Status */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-outline-variant/10 bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${jobCompleted ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`} />
            <p className="font-black text-sm tracking-tight text-on-surface uppercase">
              {jobCompleted ? 'Job Settled' : 'Live Vector Feed'}
            </p>
          </div>
          <div className="text-[11px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
            ID: #RUN-9082
          </div>
        </div>

        {/* 2. Interactive Map Viewport with Expand Toggle */}
        <div className={`relative transition-all duration-300 overflow-hidden ${
          isMapExpanded ? 'h-[320px]' : 'h-[160px]'
        }`}>
          <img 
            src={isDark ? map_dark : map_light} 
            className="w-full h-full object-cover object-center" 
            alt="Live Navigation Map" 
          />
          
          {/* Glass Overlay Map Controls */}
          <button 
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-md border border-outline-variant/40 rounded-xl text-on-surface hover:bg-background transition-all shadow-md text-xs flex items-center gap-1.5 font-bold"
          >
            {isMapExpanded ? <><FaCompressAlt /> Minimize</> : <><FaExpandAlt /> Expand View</>}
          </button>

          {/* Quick HUD Overlay banner for riders */}
          <div className="absolute bottom-2 left-3 bg-neutral-900/90 text-white rounded-lg text-[11px] px-2 py-1 font-semibold tracking-wide flex items-center gap-1">
            <FaClock className="text-emerald-400" /> Traffic: Clear along Ngong Rd
          </div>
        </div>

        {/* 3. Financial Payout Ledger strip */}
        <div className="flex items-center justify-between px-5 py-3 bg-surface-container-highest border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FaCoins className="text-xs" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Net Guarnteed Pay</p>
              <p className="text-base font-black text-on-surface">Ksh {transportFee.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Est. Drop Window</p>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">~ 12 Mins Remaining</p>
          </div>
        </div>

        {/* 4. Cash Collection Warning (Operational Risk Mitigator) */}
        {paymentMethod === 'CASH_ON_DELIVERY' && !jobCompleted && (
          <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
            <div className="text-xs">
              <p className="font-extrabold text-amber-800 dark:text-amber-400">Collect Cash From Client</p>
              <p className="text-amber-700/80 dark:text-amber-300/70 font-medium">Confirm you receive exactly Ksh {transportFee} before handing over packages.</p>
            </div>
          </div>
        )}

        {/* 5. Client Metadata Hub Card */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="flex items-start gap-3.5 bg-surface-container-low border border-outline-variant/20 p-3.5 rounded-2xl">
            {/* Customer Visual Bubble */}
            <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center text-sm font-black shadow-inner shrink-0">
              {clientName.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Core Address Block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-black text-on-surface truncate">{clientName}</p>
                <span className="text-[9px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded">Dropoff Client</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant/90 font-medium mt-1 min-w-0">
                <FaMapMarkerAlt className="text-primary shrink-0 text-[10px]" />
                <span className="truncate">{dropoffLocation}</span>
              </div>
            </div>

            {/* Comms Panel Access Matrix */}
            <div className="flex gap-1.5 shrink-0">
              <a
                href="tel:#"
                className="w-9 h-9 rounded-xl bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm text-xs"
                title="Voice Call"
              >
                <FaPhoneAlt />
              </a>
              <button
                onClick={() => console.log('Firing chat overlay context')}
                className="w-9 h-9 rounded-xl bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-on-surface hover:bg-neutral-800 hover:text-white transition-all shadow-sm text-base"
                title="Secure Chat Messaging"
              >
                <TiMessages />
              </button>
            </div>
          </div>

          {/* 6. Dynamic Pipeline Pipeline & Step Completer Button */}
          <div className="mt-4 space-y-4">
            <div className="bg-surface-container-low/50 rounded-2xl p-2 border border-outline-variant/10">
              <StageTracker stages={stages} activeIndex={activeStageIndex} />
            </div>

            {/* Core Action Driver */}
            <button
              onClick={handleNextStep}
              disabled={jobCompleted}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                jobCompleted
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-muted-foreground cursor-not-allowed shadow-none'
                  : 'bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.99]'
              }`}
            >
              {jobCompleted ? (
                <><FaCheckCircle className="text-base" /> Delivery Dispatched & Completed</>
              ) : (
                <>Advance Status: Progress to "{stages[Math.min(activeStageIndex + 1, stages.length - 1)].label}"</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RiderLiveActivityPanel;
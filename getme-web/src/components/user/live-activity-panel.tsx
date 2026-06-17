import React, { useState } from 'react';
import { TiMessages } from 'react-icons/ti';
import { useUIStore } from '@/stores/uiStore';
import StageTracker from '../user/stage-tracker'; // Reusing your tracking layout layout
import map_dark from '@/assets/map-dark.png';
import map_light from '@/assets/map-light.png';
import { HiClock } from 'react-icons/hi';
import { HiMapPin } from 'react-icons/hi2';
import { BiPhone } from 'react-icons/bi';

export interface RiderLiveActivityPanelProps {
  stages: {
    label: string;
    id: string;
    icon: React.ReactNode;
  }[];
  activeStageIndex: number;
}

function RiderLiveActivityPanel({ stages, activeStageIndex }: RiderLiveActivityPanelProps) {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const [notified, setNotified] = useState(false);

  return (
    <div className="md:basis-2/5 w-full flex flex-col h-full font-sans antialiased">
      <div className="border mx-4 rounded-2xl bg-surface flex-1 min-h-0 overflow-auto border-outline-variant/30">
        
        {/* Header - Active Assignment Monitor Indicator */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-bold text-base tracking-tight text-on-surface">
            Active Job Monitor
          </p>
        </div>

        {/* Inner Panel Card Workspace */}
        <div className="rounded-2xl mx-3 mb-3 overflow-hidden shadow-sm bg-surface-container-low border border-outline-variant/20">
          
          {/* Active Job Payload Overview */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs text-on-surface-variant/70 uppercase tracking-wider font-bold">Current Delivery Run</p>
            <p className="text-sm font-semibold text-on-surface">Weekly Groceries Run</p>
          </div>

          {/* Map Tracking Viewport */}
          {isDark ? (
            <img src={map_dark} className="w-full object-cover max-h-[160px]" alt="Navigation Map" />
          ) : (
            <img src={map_light} className="w-full object-cover max-h-[160px]" alt="Navigation Map" />
          )}

          {/* Delivery Payout & Logistics Ledger Metrics Row */}
          <div className="flex items-center relative -top-8 card-elevated rounded-none justify-between px-4 py-2 bg-surface-container-highest border-y border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
              <HiClock className="text-emerald-500 w-4 h-4" />
              Est. Pay / Time
            </div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Ksh 350.00 · ~12 min run
            </p>
          </div>

          {/* Customer Metadata Card (Replaced Rider Profile details row) */}
          <div className="flex relative -top-12 elevated-card elevation-5 border-none rounded-b-2xl items-center gap-3 px-4 pt-6 py-3 bg-surface-container-low">
            {/* Customer Initials Bubble Placeholder */}
            <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold shrink-0">
              DN
            </div>
            
            {/* Customer Contact Details Block */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">
                Dennis N.
              </p>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant/80 font-medium truncate">
                <HiMapPin className="text-primary shrink-0" />
                Kilimani, Woodley Estate
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Dropoff Client</p>
            </div>

            {/* Rider Secure Communication Triggers Layout Matrix */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => console.log('Dialing customer phone path...')}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors shadow-sm text-sm"
                aria-label="Call customer"
              >
                <BiPhone />
              </button>
              <button
                onClick={() => console.log('Opening direct chat window context...')}
                className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors shadow-sm text-base"
                aria-label="Text customer"
              >
                <TiMessages />
              </button>
            </div>
          </div>

          {/* Localized Stage Tracker Progress Pipeline */}
          <div className="pt-2 pb-4 bg-surface-container-low px-1">
            <StageTracker stages={stages} activeIndex={activeStageIndex} />
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default RiderLiveActivityPanel;
import { TiMessages } from 'react-icons/ti';
import StageTracker from './stage-tracker';
import { useState } from 'react';
import { FaStar, FaPhoneAlt } from 'react-icons/fa';
import { HiClock } from 'react-icons/hi';
import { useUIStore } from '@/stores/uiStore';
import map_dark from '@/assets/map-dark.png';
import map_light from '@/assets/map-light.png';

export interface LiveActivityPanelProps {
  stages: {
    label: string;
    id: string;
    icon: React.ReactNode;
  }[];
  activeStageIndex: number;
}
function LiveActivityPanel({ stages, activeStageIndex }: any) {
  const { theme } = useUIStore();

  const isDark = theme === 'dark';
  const [called, setCalled] = useState(false);

  return (
    <div className="md:basis-2/5 w-full flex flex-col h-full">
      <div className="border mx-4 rounded-2xl bg-surface flex-1 min-h-0 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <p className="font-semibold text-base  tracking-tight">
            Live Activity
          </p>
        </div>

        {/* Inner card */}
        <div className="bg- rounded-2xl mx-3 mb-3 overflow-hidden shadow-sm">
          {/* Order label */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs ">Ongoing order</p>
            <p className="text-sm font-semibold ">Weekly Groceries Run</p>
          </div>

          {/* Map */}
          {isDark ? (
            <img src={map_dark} className="w-full " />
          ) : (
            <img src={map_light} className="w-full " />
          )}

          {/* ETA row */}
          <div className="flex items-center relative -top-8 card-elevated  rounded-none justify-between px-4 py-2 bg-transparent">
            <div className="flex items-center gap-1.5 text-xs ">
              <HiClock />
              Estimated arrival
            </div>
            <p className="text-xs font-semibold ">2:34 PM · ~4 min</p>
          </div>

          {/* Rider info */}
          <div className="flex relative -top-12 elevated-card elevation-5 border-none rounded-b-2xl items-center gap-3 px-4 pt-6 py-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-info text-surface flex items-center justify-center text-on-info text-xs font-semibold shrink-0">
              JK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface-variant truncate">
                James Kariuki
              </p>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <FaStar className="" />
                4.9 (12)
              </div>
              <p className="text-xs text-gray-400">Boda · KMGZ 412Y</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCalled(!called)}
                className="ml-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-indigo-100 transition-colors"
                aria-label="Call rider"
              >
                <FaPhoneAlt />
              </button>
              <button
                onClick={() => setCalled(!called)}
                className="ml-1 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary hover:bg-indigo-100 transition-colors"
                aria-label="Text rider"
              >
                <TiMessages />
              </button>
            </div>
          </div>

          {/* Delivery stages */}
          <div className="pt-3">
            <StageTracker stages={stages} activeIndex={activeStageIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default LiveActivityPanel;

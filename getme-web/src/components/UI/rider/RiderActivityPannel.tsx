import React, { useState, useEffect, useMemo } from 'react';
import { TiMessages } from 'react-icons/ti';
import { IoIosSpeedometer } from "react-icons/io";
import {
  FaPhoneAlt,

  FaMapMarkerAlt,
  FaCoins,
  FaCheckCircle,
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { TbArrowsMinimize, TbArrowsMaximize } from 'react-icons/tb';
import { BiMoon, BiSun } from 'react-icons/bi';
import StageTracker from '@/components/user/stage-tracker';

export interface RiderLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
}

export interface RiderLiveActivityPanelProps {
  stages: {
    label: string;
    id: string;
    icon: React.ReactNode;
  }[];
  activeStageIndex: number;
  location: RiderLocation;
}

function MapController({
  location,
  isMapExpanded,
}: {
  location: RiderLocation;
  isMapExpanded: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 320);
    return () => clearTimeout(timer);
  }, [isMapExpanded, map]);

  useEffect(() => {
    map.panTo([location.lat, location.lng], { animate: true, duration: 2 });
  }, [location.lat, location.lng, map]);

  return null;
}

function RiderLiveActivityPanel({
  stages,
  activeStageIndex: initialStageIndex,
  location,
}: RiderLiveActivityPanelProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(initialStageIndex);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [jobCompleted, setJobCompleted] = useState(false);
  const [mapIsDark, setMapIsDark] = useState(false);

  const paymentMethod = 'CASH_ON_DELIVERY';
  const transportFee = 350;
  const clientName = 'Dennis N.';
  const dropoffLocation = 'Kilimani, Woodley Estate';

  const handleNextStep = () => {
    if (activeStageIndex < stages.length - 1) {
      setActiveStageIndex((prev) => prev + 1);
    } else {
      setJobCompleted(true);
    }
  };

  // const locationArray = useMemo(() => Object.values(location), [location]);

  return (
    <div
      className={`w-full flex flex-col transition-all duration-300 font-sans antialiased ${
        isMapExpanded ? 'md:basis-full lg:basis-full h-full' : 'md:basis-2/5'
      }`}
    >
      {/* Mobile responsive container margins (px-4 on desktop, compact on tiny screens) */}
      <div className="border sm:mx-4 rounded-3xl bg-surface flex-1 min-h-0 overflow-hidden shadow-xl border-outline-variant/30 flex flex-col">
        {/* 1. Header Control bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">

            <div className="relative flex items-center justify-center h-5 w-5">
              <span
                className={`animate-ping absolute inline-flex h-5 w-5 rounded-full opacity-55 bg-emerald-200`}
              />
              <span
                className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 bg-emerald-400`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 bg-emerald-500`}
              />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase opacity-70 text-on-surface">
              {jobCompleted ? '' : 'Live '}
            </span>
          </div>

          <div className="flex gap-1.5 text-primary">
            <button
              onClick={() => setMapIsDark(!mapIsDark)}
              className="p-2 rounded-xl bg-background border border-outline-variant/40  hover:bg-surface-container-high transition-colors text-base"
              aria-label="Toggle map theme"
            >
              {mapIsDark ? <BiSun /> : <BiMoon />}
            </button>

            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="p-2 rounded-xl bg-background border border-outline-variant/40  hover:bg-surface-container-high transition-colors text-base"
              aria-label="Toggle expand map"
            >
              {isMapExpanded ? <TbArrowsMinimize /> : <TbArrowsMaximize />}
            </button>
          </div>
        </div>

        {/* 2. Map Container Wrapper (Responsive height transitions) */}
        <div
          className={`relative transition-all duration-300 ease-in-out overflow-hidden z-10 bg-surface-container-dark ${
            isMapExpanded ? 'h-[360px] sm:h-[450px]' : 'h-[180px] sm:h-[220px]'
          }`}
        >
          <MapContainer
            center={[location?.lat ?? -1.286389, location?.lng ?? 36.817223]}
            zoom={15}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            {mapIsDark ? (
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap &copy; CARTO"
              />
            ) : (
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            )}

            {typeof location?.lat === 'number' &&
              typeof location?.lng === 'number' && (
                <Marker position={[location.lat, location.lng]}  />
              )}

            {/* Controller smoothly handles flyovers and pane resizes dynamically */}
            <MapController location={location} isMapExpanded={isMapExpanded} />
          </MapContainer>

          {/* Quick HUD Overlay banner for riders */}
          <div className="absolute bottom-3 left-3 bg-neutral-900/90 text-white rounded-lg text-[11px] px-2.5 py-1.5 font-semibold tracking-wide flex items-center gap-1.5 pointer-events-none shadow-md z-[400]">
            <IoIosSpeedometer className="text-emerald-400 shrink-0" /> {location.speed} km/h

          </div>
        </div>

        {/* 3. Financial Payout Ledger strip */}
        <div className="flex items-center justify-between px-5 py-3 bg-surface-container-highest border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FaCoins className="text-xs" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Net Guaranteed Pay
              </p>
              <p className="text-base font-black text-on-surface">
                Ksh {transportFee.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Est. Drop Window
            </p>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              ~ 12 Mins Remaining
            </p>
          </div>
        </div>

        {/* Scrollable container content context below the map for shorter mobile screens */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4">
          {/* 4. Cash Collection Warning */}
          {paymentMethod === 'CASH_ON_DELIVERY' && !jobCompleted && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <span
                className="text-amber-500 text-sm mt-0.5"
                role="img"
                aria-label="warning"
              >
                ⚠️
              </span>
              <div className="text-xs">
                <p className="font-extrabold text-amber-800 dark:text-amber-400">
                  Collect Cash From Client
                </p>
                <p className="text-amber-700/80 dark:text-amber-300/70 font-medium">
                  Confirm you receive exactly Ksh {transportFee} before handing
                  over packages.
                </p>
              </div>
            </div>
          )}

          {/* 5. Client Metadata Hub Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 bg-surface-container-low border border-outline-variant/20 p-3.5 rounded-2xl">
            <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center text-sm font-black shadow-inner shrink-0">
              {clientName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <p className="text-sm font-black text-on-surface truncate">
                  {clientName}
                </p>
                <span className="self-center sm:self-start text-[9px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded w-max mx-auto sm:mx-0">
                  Dropoff Client
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-on-surface-variant/90 font-medium mt-1 w-full">
                <FaMapMarkerAlt className="text-primary shrink-0 text-[10px]" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {dropoffLocation}
                </span>
              </div>
            </div>

            {/* Thumb-friendly communication buttons for mobile */}
            <div className="flex gap-2 w-full sm:w-auto justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-none border-outline-variant/10">
              <a
                href="tel:#"
                className="flex-1 sm:flex-initial w-12 h-10 sm:w-9 sm:h-9 rounded-xl bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all text-sm"
                title="Voice Call"
              >
                <FaPhoneAlt />
              </a>
              <button
                onClick={() => console.log('Firing chat overlay context')}
                className="flex-1 sm:flex-initial w-12 h-10 sm:w-9 sm:h-9 rounded-xl bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-on-surface hover:bg-neutral-800 hover:text-white transition-all text-base"
                title="Secure Chat Messaging"
              >
                <TiMessages />
              </button>
            </div>
          </div>

          {/* 6. Dynamic Pipeline Tracking Matrix & Action Call to Action */}
          <div className="space-y-4 mt-auto">
            <div className="bg-surface-container-low/50 rounded-2xl p-2 border border-outline-variant/10 overflow-x-auto">
              <StageTracker stages={stages} activeIndex={activeStageIndex} />
            </div>

            <button
              onClick={handleNextStep}
              disabled={jobCompleted}
              className={`w-full py-4 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md min-h-[48px] touch-manipulation ${
                jobCompleted
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-muted-foreground cursor-not-allowed shadow-none'
                  : 'bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98]'
              }`}
            >
              {jobCompleted ? (
                <>
                  <FaCheckCircle className="text-base" /> Delivery Dispatched &
                  Completed
                </>
              ) : (
                <>
                  Advance Status: Progress to "
                  {
                    stages[Math.min(activeStageIndex + 1, stages.length - 1)]
                      .label
                  }
                  "
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiderLiveActivityPanel;

import { useState } from 'react';
import ItemCard from '@/components/UI/ItemCard';
import {
  HiClipboardList,
  HiCurrencyDollar,
  HiStar,
  HiLightningBolt,
  HiTrendingUp,
} from 'react-icons/hi';
import { TbMapRoute, TbTruckDelivery } from 'react-icons/tb';
import { LuPackageOpen, LuClock } from 'react-icons/lu';
import RiderLiveActivityPanel, {
  RiderLocation,
} from '@/components/UI/rider/RiderActivityPannel';
import { useRiderLocation, useRiderLocationSimulated } from '@/hooks/useRiderLocation';
import { useRiderStore } from '@/stores/useRiderStore';
import { riderService } from '@/services/riderService';
import { useToastStore } from '@/stores/useToastStore';
import { useQuery } from '@tanstack/react-query';
import { RiderDashboard } from '@/types/riders';
import { useAuthStore } from '@/stores/authStore';
import live from '@assets/branding/live.svg';

function RiderHomePage() {
  const toast = useToastStore((state) => state.toast);
  const { isOnline, setOnlineStatus } = useRiderStore();

  const { data: dashboard, isLoading: isLoadingDashboard } =
    useQuery<RiderDashboard>({
      queryKey: ['rider', 'dashboard'],
      queryFn: () => riderService.getDashboardData(),
      enabled: isOnline,
    });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [liveLocation, setLiveLocation] = useState<RiderLocation>({
    lat: -1.286389,
    lng: 36.817223,
    heading: 0,
    speed: 0,
  });

  const handleOnlineStatusChange = async () => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    const previousState = isOnline;
    setOnlineStatus(!previousState);

    try {
      const response = await riderService.toggleOnlineStatus();
      setOnlineStatus(response.status);
    } catch (error) {
      setOnlineStatus(previousState);

      toast({
        message: 'Error',
        variant: 'error',
        description: 'Failed to switch online status.',
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const riderStages = [
    { id: 'accepted', label: 'Accepted', icon: '✓' },
    { id: 'at_store', label: 'At Pickup', icon: '✓' },
    { id: 'transit', label: 'In Transit', icon: <TbTruckDelivery /> },
    { id: 'dropped', label: 'Completed', icon: <LuPackageOpen /> },
  ];

  const currentAssignmentStageIndex = 3;

  useRiderLocationSimulated({
    isActive: isOnline,
    onLocationUpdate: async (coords) => {
      setLiveLocation({
          lat: coords.lat,
          lng: coords.lng,
          heading: coords.heading || 0,
          speed: coords.speed ||0
        });
        
       riderService.updateLocation(
        coords.lat,
        coords.lng,
        coords.heading || 0,
        coords.speed || 0,
      );
    },
  });

  return (
    <section className="md:px-6 flex-1 antialiased font-sans bg-surface transition-colors duration-300">
      <div className="container mx-auto py-6 h-full min-h-full">
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-full  ">
          <div className="lg:basis-3/5 w-full flex flex-col px-2 lg:px-4 min-h-full  space-y-6">
            {/* Greeting & Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="lg:text-4xl md:text-3xl text-2xl font-black tracking-tight text-on-surface">
                  Ready for your next run {dashboard?.name}?
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  Keep tabs on your earnings and live dispatch parameters.
                </p>
              </div>
            </div>

            <div  
              className={`p-1.5 border rounded-2xl flex justify-between items-center transition-all duration-300 ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-surface-container-highest border-outline-variant/40'
              }`}
            >
              <div className="flex items-center gap-3 pl-3">
                <div className="w-10 h-10">
                  <img src={live} />
                </div>
                <span className="text-sm font-bold text-on-surface">
                  Status:{' '}
                  {isOnline ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Receiving Jobs
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Offline</span>
                  )}
                </span>
              </div>

              <button
                onClick={() => handleOnlineStatusChange()}
                className={`p-2 px-6 rounded-xl text-xs uppercase font-black tracking-wider transition-all duration-200 shadow-sm ${
                  isOnline
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center py-1">
                <div className="flex items-center gap-1 text-muted-foreground text-[11px] uppercase tracking-wider font-bold mb-1">
                  <LuClock className="text-primary" /> Active Hours
                </div>
                <p className="text-xl font-extrabold text-on-surface">
                  5.4 hrs
                </p>
              </div>
              <div className="flex flex-col items-center justify-center text-center py-1 border-x border-outline-variant/20">
                <div className="flex items-center gap-1 text-muted-foreground text-[11px] uppercase tracking-wider font-bold mb-1">
                  <HiLightningBolt className="text-emerald-500" /> Trips Today
                </div>
                <p className="text-xl font-extrabold text-on-surface">
                  14 runs
                </p>
              </div>
              <div className="flex flex-col items-center justify-center text-center py-1">
                <div className="flex items-center gap-1 text-muted-foreground text-[11px] uppercase tracking-wider font-bold mb-1">
                  <HiTrendingUp className="text-warning" /> Accept Rate
                </div>
                <p className="text-xl font-extrabold text-on-surface">98.2%</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col bottom-0  justify-end pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ItemCard
                  title="Available Jobs"
                  description="12 matches waiting near you"
                  Icon={HiClipboardList}
                  variant="primary"
                />
                <ItemCard
                  title="Earnings Ledger"
                  description="Ksh 4,250.00 compiled today"
                  Icon={HiCurrencyDollar}
                  variant="secondary"
                />
                <ItemCard
                  title="Route Optimizer"
                  description="View priority delivery lanes"
                  Icon={TbMapRoute}
                  variant="info"
                />
                <ItemCard
                  title="Performance Metrics"
                  description="4.95 Excellent Rating Status"
                  Icon={HiStar}
                  variant="warning"
                />
              </div>
            </div>
          </div>

          {isOnline ? (
            <RiderLiveActivityPanel
              location={liveLocation}
              stages={riderStages}
              activeStageIndex={currentAssignmentStageIndex}
            />
          ) : (
            <div className="md:basis-3/5 w-full flex flex-col h-full">
              <div className="border border-dashed border-outline-variant mx-4 rounded-2xl bg-surface-container-low flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[350px]">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant mb-3 text-muted-foreground">
                  📴
                </div>
                <h3 className="font-bold text-base text-on-surface">
                  Monitor Disengaged
                </h3>
                <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
                  Flip your duty switch back to online to scan local coordinates
                  for requests.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RiderHomePage;

import ItemCard from '@/components/UI/ItemCard';
import {
  HiSearch,
  HiShoppingBag,
  HiCamera,
  HiTruck,
  HiFastForward,
} from 'react-icons/hi';
import { TbTruckDelivery } from 'react-icons/tb';
import { LuPackageCheck } from 'react-icons/lu';
import LiveActivityPanel from '@/components/user/live-activity-panel';

function UserHomePage() {
  const stages = [
    { id: 'placed', label: 'Order placed', icon: '✓' },
    { id: 'pickup', label: 'Picked up', icon: '✓' },
    { id: 'ontheway', label: 'On the way', icon: <TbTruckDelivery/> },
    { id: 'delivered', label: 'Delivered', icon: <LuPackageCheck/> },
  ];
  const activeStageIndex = 3; 

  return (
    <section className="md:px-6 flex-1 min-h-0">
      <div className="container mx-auto py-6 h-full min-h-full">
        <div className="flex flex-col md:flex-row gap-4 h-full min-h-full">
          <div className="md:basis-3/5 w-full flex flex-col px-2 lg:px-6 h-full">
            <div className="flex flex-col flex-1 min-h-0">
              <h1 className="lg:text-4xl md:text-3xl text-2xl font-extrabold mb-4">
                What do you need today?
              </h1>

              <div className="border p-1 bg-indigo-600/10 border-secondary rounded-full flex justify-between mb-6">
                <div className="rounded-full bg-secondary p-1.5 flex items-center">
                  <HiSearch className="w-8 h-8 text-on-secondary" />
                </div>
                <div className="p-1 px-4 bg-primary rounded-full text-on-primary justify-center lg:text-xl font-bold items-center flex cursor-pointer">
                  Send Request
                </div>
              </div>

              <div className="min-h-110 p-3 flex flex-col justify-end col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ItemCard
                    title="Groceries"
                    description="Shop, Market"
                    Icon={HiShoppingBag}
                    variant="primary"
                  />
                  <ItemCard
                    title="Electronics"
                    description="Gadgets, Phones"
                    Icon={HiCamera}
                    variant="secondary"
                  />
                  <ItemCard
                    title="Food Delivery"
                    description="Restaurants, Meals"
                    Icon={HiFastForward}
                    variant="warning"
                  />
                  <ItemCard
                    title="Package"
                    description="Documents, Parcels"
                    Icon={HiTruck}
                    variant="info"
                  />
                </div>
              </div>
            </div>
          </div>

          <LiveActivityPanel stages={stages} activeStageIndex={activeStageIndex} />
        </div>
      </div>
    </section>
  );
}

export default UserHomePage;
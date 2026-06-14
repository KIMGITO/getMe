import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { SignupButton } from '@/components/UI/AuthButtons';
import {
  HiShoppingBag,
  HiTruck,
  HiFastForward,
  HiShieldCheck,
  HiLightningBolt,
  HiClock,
} from 'react-icons/hi';
import ScooterLoader from '@/components/UI/ScooterLoader';
import mpesa from '@assets/branding/mpesa-logo.png';
import groceries from '@assets/images/groceries.png';
import foods from '@assets/images/foods.png';
import documents from  '@assets/images/docs.png';
import { useAuthStore } from '@/stores/authStore';

export default function LandingPage() {

  const {isAuthenticated} = useAuthStore();
  const serviceCategories = [
    {
      icon: groceries,
      title: 'Market Groceries',
      subtitle: 'Sourced & Handpicked',
      color: 'text-success bg-success/10 border-success/20',
    },
    {
      icon: foods,
      title: 'Express Food',
      subtitle: 'Hot & On Time',
      color: 'text-warning bg-warning/10 border-warning/20',
    },
    {
      icon: documents,
      title: 'Instant Courier',
      subtitle: 'Documents & Parcels',
      color: 'text-info bg-info/10 border-info/20',
    },
    {
      icon: foods,
      title: 'Custom Errands',
      subtitle: 'Anything You Need',
      color: 'text-pickup bg-pickup/10 border-pickup/20',
    },
  ];

  return (
    <div className="w-full bg-background min-h-screen flex flex-col selection:bg-primary selection:text-on-primary overflow-x-hidden">
      {/* 1. Hero Marketing Section */}
      <section className="relative py-16 lg:py-28 px-4 max-w-screen-xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ">
        {/* Left Focus: Advertising Hooks & Call To Actions */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-6 text-left z-10">
          <h1 className="display-heavy-sm text-center md:display-heavy-md lg:display-heavy text-on-surface">
            Don't go out
            <br />
            <p className='text-secondary'>We'll handle it</p>
            <br />
            <span className="text-primary bg-primary/5 px-3 rounded-2xl">
              GetME
            </span>{' '}
          </h1>

          <p className="body-lg text-on-surface-variant max-w-xl font-medium leading-relaxed">
            Skip the traffic, the queues, and the hassle. From quick store run
            pickups to automated corporate document deliveries, deploy a trusted
            runner across Nairobi and It's surroundings instantly.
          </p>

          {/* Action Hub */}
        { !isAuthenticated && <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <SignupButton className="!px-10 !py-4 text-base font-black shadow-elevation-3 shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all" />
            <Link
              to={ROUTES.LOGIN_INIT}
              className="px-10 py-4 border-2 border-outline rounded-full text-sm font-black text-center bg-surface hover:bg-surface-container-low transition-colors"
            >
              Sign In
            </Link>
          </div>
}
          {/* Marketing Trust Benchmarks */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-outline-variant max-w-md">
            <div>
              <p className="stat-value text-primary">~24m</p>
              <p className="stat-label text-on-surface-variant mt-1">
                Rapid Turnaround
              </p>
            </div>
            <div>
              <p className="stat-value text-on-surface ">100%</p>
              <p className="stat-label text-on-surface-variant mt-1">
                Escrow Protected
              </p>
            </div>
            <div>
              <p className="stat-value text-on-surface ">
                <img className="h-9" src={mpesa} />
              </p>
              <p className="stat-label text-on-surface-variant mt-1">
                Instant Payment
              </p>
            </div>
          </div>
        </div>

        {/* Right Focus: Dedicated Video Component Container */}
        <div className="lg:col-span-5 flex   w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/10 rounded-[2rem] filter blur-3xl -z-10" />

          {/* Framed Media Aspect Container */}
          <div className="relative aspect-video lg:aspect-[1] w-full shadow-elevation-5 rounded-[28px] bg-surface-container overflow-hidden group">
            <ScooterLoader size="hero" />

            {/* Visual overlay gradient for text clarity context */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Minimal floating live node feedback flag */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-sm">
              Live Reel
            </div>
          </div>
        </div>
      </section>

      {/* 2. Simplified Conversion Value Banner */}
      <section className="bg-surface-container-low border-y border-outline-variant py-14 px-4">
        <div className="max-w-screen-xl mx-auto w-full text-center">
          <div className="max-w-xl mx-auto mb-10 flex flex-col items-center space-y-2">
            <h2 className="headline-lg text-on-surface tracking-tight">
              One app, infinite possibilities.
            </h2>
            <p className="body-md text-on-surface-variant font-medium">
              Choose your lane. Tell your assigned runner exactly what needs to
              be picked up, delivered, or done.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceCategories.map((srv, idx) => {
              return (
                <div
                  key={idx}
                  className="group flex flex-col items-center rounded-[24px] border border-outline-variant bg-surface p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-elevation-2"
                >
                  {/* Thumbnail Aspect Container Frame */}
                  <div
                    className={`relative mb-4 aspect-video h-20 w-20  overflow-hidden rounded-2xl border ${srv.color}`}
                  >
                    <img
                      src={srv.icon}
                      alt={srv.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {/* Subtle decorative inner shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  </div>

                  {/* Meta Text Stack */}
                  <h3 className="title-md text-on-surface mb-1">{srv.title}</h3>
                  <p className="label-md text-on-surface-variant">
                    {srv.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Operational Trust Vectors */}
      <section className="py-20 px-4 max-w-screen-xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-2 text-left">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <HiLightningBolt className="text-xl" />
            </div>
            <h3 className="title-lg text-on-surface">
              Zero Friction Logistics
            </h3>
            <p className="body-md text-on-surface-variant font-medium leading-relaxed">
              We track driver availability algorithms in your immediate radius
              to lock down assignments within seconds of order initialization.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <HiShieldCheck className="text-xl" />
            </div>
            <h3 className="title-lg text-on-surface">
              Guaranteed Escrow Protection
            </h3>
            <p className="body-md text-on-surface-variant font-medium leading-relaxed">
              Your money sits protected inside our ledger space. Payment goes
              live to the courier node only when you inspect and approve the
              drop.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <HiClock className="text-xl" />
            </div>
            <h3 className="title-lg text-on-surface">On-Demand or Scheduled</h3>
            <p className="body-md text-on-surface-variant font-medium leading-relaxed">
              Book an emergency bike unit for instant transit or pre-schedule a
              grocery list routing checklist ahead of time.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Promotional Engagement Call-to-Action */}
      <section className="bg-primary text-on-primary py-16 px-4 m-4 md:m-8 rounded-[2rem] relative overflow-hidden shadow-elevation-4">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center space-y-6 relative z-10">
          <h2 className="display-heavy-sm md:display-heavy-md tracking-tight !leading-tight text-on-primary">
            Stop waiting.
            <br />
            Get moving with GetME.
          </h2>
          <p className="body-lg opacity-90 font-medium max-w-sm">
            Set up your deployment workspace wallet profile and delegate your
            local errands under two minutes.
          </p>
          <Link
            to={ROUTES.SIGNUP}
            className="bg-surface text-on-surface px-10 py-4 rounded-full font-black text-sm tracking-wide shadow-elevation-2 hover:bg-surface-container-high transition-all transform hover:scale-[1.03]"
          >
            Create Your Account Natively
          </Link>
        </div>
      </section>

      {/* 5. Footer Anchor */}
      <footer className="mt-auto border-t border-outline-variant bg-surface py-6 px-4 text-center">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-on-surface-variant">
          <p>© 2026 GetME Logistics Network.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-primary transition-colors">
              Privacy Infrastructure
            </a>
            <a href="#terms" className="hover:text-primary transition-colors">
              Service Standards Protocol
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

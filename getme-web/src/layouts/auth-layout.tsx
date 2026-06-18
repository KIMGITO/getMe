import Navigation, { ContextualNavItem } from '@/layouts/nav/navigation';

function AuthLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems?: ContextualNavItem[];
}) {
  return (
    <div className="bg-surface h-[100dvh] flex flex-col overflow-hidden">
      <Navigation customNavItems={navItems} />
      {children}
    </div>
  );
}
export default AuthLayout;

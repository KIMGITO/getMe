export const BASE_URL = import.meta.env.VITE_API_BASE_URL; 

export const ROUTES = {
  LANDING: '/',

  // auth routes
  LOGIN_INIT: '/login/init',
  LOGIN: '/login',
  SIGNUP: '/signup',
  OTP: '/otp',
  PASSWORD: '/password',

  // market routes
  SHOPPING_LIST: '/orders',

  // client routes
  CLIENT_HOME: '/client/home',
  CLIENT_PROFILE: '/client/profile',

  // rider routes
  RIDER_HOME: '/rider/home',
  RIDER_PROFILE: '/rider/profile',

  // admin routes
  ADMIN_HOME: '/admin/home',
  ADMIN_PROFILE: '/admin/profile',

  // shared routes
  WALLET: '/wallet',
} as const;  

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]; 

export const routeTitles: Record<RoutePath, string> = {
  [ROUTES.LANDING]: 'Welcome', 
  [ROUTES.LOGIN_INIT]: 'Get Started', 
  [ROUTES.LOGIN]: 'Log In', 
  [ROUTES.SIGNUP]: 'Register Account', 
  [ROUTES.OTP]: 'Verify Security OTP', 
  [ROUTES.PASSWORD]: 'Reset Password', 
  [ROUTES.SHOPPINGLIST]: 'My Orders', 
  [ROUTES.CLIENT_HOME]: 'Client Terminal', 
  [ROUTES.CLIENT_PROFILE]: 'Client Profile Settings',
  [ROUTES.RIDER_HOME]: 'Rider Command', 
  [ROUTES.RIDER_PROFILE]: 'Rider Portal Profile',
  [ROUTES.ADMIN_HOME]: 'Admin Engine', 
  [ROUTES.ADMIN_PROFILE]: 'Admin Infrastructure Matrix',
  [ROUTES.WALLET]: 'Wallet Balance', 
};

export const routeMessages: Record<RoutePath, string> = {
  [ROUTES.LANDING]: 'Experience the future of local shopping with GetME.', 
  [ROUTES.LOGIN_INIT]: 'Enter your phone number or email to get started.', 
  [ROUTES.LOGIN]: 'Welcome back! Please log in to continue.', 
  [ROUTES.SIGNUP]: 'Join GetME today and start shopping!', 
  [ROUTES.OTP]: 'Enter the OTP sent to your device to verify your account.', 
  [ROUTES.PASSWORD]: 'Reset your password to regain access to your account.', 
  [ROUTES.SHOPPINGLIST]: 'Your shopping list is ready to go!', 
  [ROUTES.CLIENT_HOME]: 'Welcome to Your Dashboard', 
  [ROUTES.CLIENT_PROFILE]: 'Manage your individual client profile records.',
  [ROUTES.RIDER_HOME]: 'Welcome to Your Logistics Hub', 
  [ROUTES.RIDER_PROFILE]: 'Review and update your dispatch criteria variables.',
  [ROUTES.ADMIN_HOME]: 'System Management Engine Portal', 
  [ROUTES.ADMIN_PROFILE]: 'Superuser administrative system panel access override controls.',
  [ROUTES.WALLET]: 'Monitor your transactional statements and available balance tokens.', 
};
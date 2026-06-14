export const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const ROUTES = {
  LANDING: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  SHOPPINGLIST: '/orders',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/profile',
  WALLET: '/wallet',
  LOGIN_INIT: '/login/init',
  LOGIN: '/login',
  SIGNUP: '/signup',
  OTP: '/otp',
  PASSWORD: '/password',
  HOME: '/home',

  CLIENT_HOME: '/client/home',
  RIDER_HOME: '/rider/home',
  ADMIN_HOME: '/admin/home',

} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export const routeTitles: Record<RoutePath, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LANDING]: 'Welcome',
  [ROUTES.PRODUCTS]: 'Products',
  [ROUTES.PRODUCT_DETAIL]: 'Product Detail',
  [ROUTES.SHOPPINGLIST]: 'My Orders',
  [ROUTES.CART]: 'Shopping Cart',
  [ROUTES.CHECKOUT]: 'Checkout Address',
  [ROUTES.ACCOUNT]: 'Profile Settings',
  [ROUTES.WALLET]: 'Wallet Balance',
  [ROUTES.LOGIN]: 'Log In',
  [ROUTES.LOGIN_INIT]: 'Get Started',
  [ROUTES.SIGNUP]: 'Register Account',
  [ROUTES.OTP]: 'Verify Security OTP',
  [ROUTES.PASSWORD]: 'Reset Password',
  [ROUTES.CLIENT_HOME]: 'Client Terminal',
  [ROUTES.RIDER_HOME]: 'Rider Command',
  [ROUTES.ADMIN_HOME]: 'Admin Engine',
};

export const routeMessages: Record<RoutePath, string> = {
  [ROUTES.HOME]: 'Welcome to GetME!',
  [ROUTES.LANDING]: 'Experience the future of local shopping with GetME.',
  [ROUTES.PRODUCTS]: 'Browse our wide selection of fresh groceries.',
  [ROUTES.PRODUCT_DETAIL]: 'Discover more about this product.',
  [ROUTES.SHOPPINGLIST]: 'Your shopping list is ready to go!',
  [ROUTES.CART]: 'Review your cart before checkout.',
  [ROUTES.CHECKOUT]: 'Almost there! Complete your purchase.',
  [ROUTES.ACCOUNT]: 'Manage your account details and preferences.',
  [ROUTES.WALLET]: 'Monitor your transactional statements and available balance tokens.',
  [ROUTES.LOGIN]: 'Welcome back! Please log in to continue.',
  [ROUTES.LOGIN_INIT]: 'Enter your phone number or email to get started.',
  [ROUTES.SIGNUP]: 'Join GetME today and start shopping!',
  [ROUTES.OTP]: 'Enter the OTP sent to your device to verify your account.',
  [ROUTES.PASSWORD]: 'Reset your password to regain access to your account.',
  [ROUTES.CLIENT_HOME]: 'Welcome to Your Dashboard',
  [ROUTES.RIDER_HOME]: 'Welcome to Your Logistics Hub',
  [ROUTES.ADMIN_HOME]: 'System Management Engine Portal',
};
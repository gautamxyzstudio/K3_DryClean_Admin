export const BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL;

export const ENDPOINTS = {
  // authentication endpoints
  login: `${BASE_URL}/api/auth/login`,
  forgotPassword: `${BASE_URL}/api/forgot-password`,
  resetPassword: `${BASE_URL}/api/reset-password`,
  verifyOtp: `${BASE_URL}/api/verify-otp`,
  resendOtp: `${BASE_URL}/api/resend-otp`,

  // dashboard endpoints
  getOrderServiceStats: `${BASE_URL}/api/admin/order-service-stats`,
  getRevenueTrends: `${BASE_URL}/api/admin/revenue-trends`,
  getAllDashboardStats: `${BASE_URL}/api/admin/all-dashboard-stats`,

  // customer endpoints
  createCustomer: `${BASE_URL}/api/create-user-manually`,
  getCustomer: `${BASE_URL}/api/user-profiles`,

  // order endpoints
  getStats: `${BASE_URL}/api/admin/order-stats`,
  getAllOrder: `${BASE_URL}/api/orders`,
  createOrder: `${BASE_URL}/api/admin/create-order`,
  getServicesWithVariants: `${BASE_URL}/api/admin/services-with-variants?category=Laundry`,

  // service and variant management endpoints
  getAllServices: `${BASE_URL}/api/services`,
  createService: `${BASE_URL}/api/services`,
  updateService: (docId: string) => `${BASE_URL}/api/services/${docId}`,
  deleteService: (docId: string) => `${BASE_URL}/api/services/${docId}`,

  getAllServiceVariants: `${BASE_URL}/api/service-variants`,
  createServiceVariant: `${BASE_URL}/api/service-variants`,
  updateServiceVariant: (docId: string) =>
    `${BASE_URL}/api/service-variants/${docId}`,
  deleteServiceVariant: (docId: string) =>
    `${BASE_URL}/api/service-variants/${docId}`,

  // notification endpoints
  getAllNotification: `${BASE_URL}/api/notifications`,
  getMarkAllNotificationsAsRead: `${BASE_URL}/api/notifications/mark-all-read`,
  getMarkNotificationAsRead: (docId: string) =>
    `${BASE_URL}/api/notifications/${docId}/read`,

  // driver endpoints
  getAllDriver: `${BASE_URL}/api/driver-details`,
  getDriverDetialsById: (docId: string) =>
    `${BASE_URL}/api/driver-details/${docId}`,
  getDriverDetailsById: (docId: string) =>
    `${BASE_URL}/api/driver-details/${docId}`,
  createDriver: `${BASE_URL}/api/driver-details`,
  updateDriver: (docId: string) => `${BASE_URL}/api/driver-details/${docId}`,
  deleteDriver: (docId: string) => `${BASE_URL}/api/driver-details/${docId}`,

  // upload endpoints
  uploadDoc: `${BASE_URL}/api/upload`,

  // payment endpoints
  getAllPayments: `${BASE_URL}/api/payment-collections/logs`,
  processRefund: (id: string) =>
    `${BASE_URL}/api/payment-collections/${id}/refund`,

  // coupon endpoints
  getAllCoupons: `${BASE_URL}/api/coupons`,
  getCouponById: (id: string) => `${BASE_URL}/api/coupons/${id}`,
  createCoupon: `${BASE_URL}/api/coupons`,
  updateCoupon: (id: string) => `${BASE_URL}/api/coupons/${id}`,
  updateCouponStatus: (id: string) => `${BASE_URL}/api/coupons/${id}/status`,
  deleteCoupon: (id: string) => `${BASE_URL}/api/coupons/${id}`,
  getCouponUsages: `${BASE_URL}/api/coupon-usages`,
};


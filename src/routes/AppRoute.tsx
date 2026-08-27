import type React from "react";
import { Routes, Route, Navigate } from "react-router";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import SetNewPasswordPage from "../pages/auth/SetNewPasswordPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import OrdersPage from "../pages/orders/OrdersPage";
import CreateOrderPage from "../pages/orders/CreateOrderPage";
import CustomersPage from "../pages/customers/CustomersPage";
import AddCustomerPage from "../pages/customers/AddCustomerPage";
import DriversPage from "../pages/drivers/DriversPage";
import AddDriverPage from "../pages/drivers/AddDriverPage";
import ServicesPage from "../pages/services/ServicesPage";
import PaymentsPage from "../pages/payments/PaymentsPage";
import PlaceholderPage from "../pages/common/PlaceholderPage";
import CouponsListPage from "../pages/admin/coupons/CouponsListPage";
import CreateCouponPage from "../pages/admin/coupons/CreateCouponPage";
import CouponDetailsPage from "../pages/admin/coupons/CouponDetailsPage";
import EditCouponPage from "../pages/admin/coupons/EditCouponPage";
import CouponUsagePage from "../pages/admin/coupons/CouponUsagePage";
import useAuthStore from "../store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoute = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicOnlyRoute>
            <VerifyOtpPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/set-new-password"
        element={
          <PublicOnlyRoute>
            <SetNewPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={<Navigate to="/set-new-password" replace />}
      />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/create" element={<CreateOrderPage />} />
        <Route path="/orders/new" element={<CreateOrderPage />} />
        <Route path="/orders/add" element={<CreateOrderPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/add" element={<AddCustomerPage />} />
        <Route path="/customers/new" element={<AddCustomerPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/drivers/add" element={<AddDriverPage />} />
        <Route path="/drivers/new" element={<AddDriverPage />} />
        <Route
          path="/staff"
          element={
            <PlaceholderPage
              title="Staff Roster"
              icon="badge"
              description="Manage store employees, shift schedules, and operational permissions."
            />
          }
        />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/items" element={<ServicesPage />} />
        <Route path="/services/new" element={<ServicesPage />} />
        <Route path="/services/add" element={<ServicesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        
        {/* Promotions & Coupon Management Routes */}
        <Route path="/promotions" element={<CouponsListPage />} />
        <Route path="/promotions/create" element={<CreateCouponPage />} />
        <Route path="/promotions/new" element={<CreateCouponPage />} />
        <Route path="/promotions/add" element={<CreateCouponPage />} />
        <Route path="/promotions/:id" element={<CouponDetailsPage />} />
        <Route path="/promotions/:id/edit" element={<EditCouponPage />} />
        <Route path="/promotions/:id/usages" element={<CouponUsagePage />} />

        {/* /admin/coupons Route Aliases */}
        <Route path="/admin/coupons" element={<CouponsListPage />} />
        <Route path="/admin/coupons/create" element={<CreateCouponPage />} />
        <Route path="/admin/coupons/:id" element={<CouponDetailsPage />} />
        <Route path="/admin/coupons/:id/edit" element={<EditCouponPage />} />
        <Route path="/admin/coupons/:id/usages" element={<CouponUsagePage />} />

        <Route
          path="/reports"
          element={
            <PlaceholderPage
              title="Analytics & Reports"
              icon="assessment"
              description="Generate detailed revenue, order volume, and driver performance reports."
            />
          }
        />
        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="System Settings"
              icon="settings"
              description="Configure store details, notification preferences, and system parameters."
            />
          }
        />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoute;

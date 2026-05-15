import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import { ScrollToTop } from '@shared/components/ScrollToTop'
import HomePage from '@pages/HomePage'
import ProductDetailPage from '@pages/ProductDetailPage'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import ProfilePage from '@pages/ProfilePage'
import CheckoutPage from '@pages/CheckoutPage'
import OrdersPage from '@pages/OrdersPage'
import OrderDetailPage from '@pages/OrderDetailPage'
import ForgotPasswordPage from '@pages/ForgotPasswordPage'
import ResetPasswordPage from '@pages/ResetPasswordPage'
import VerifyEmailPage from '@pages/VerifyEmailPage'
import PaymentReturnPage from '@pages/PaymentReturnPage'
import AdminPage from '@pages/AdminPage'
import AdminDashboard from '@pages/AdminDashboard'
import NotFound from '@pages/NotFound'
import { CategoryListPage } from '@features/admin/categories'
import { IngredientListPage } from '@features/admin/ingredients'
import { ProductListPage } from '@features/admin/products'
import { StockAlertsPage } from '@features/admin/StockAlertsPage'
import { AdminOrderListPage } from '@features/admin/orders'
import { AdminOrderDetailPage } from '@features/admin/orders/AdminOrderDetailPage'

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />


        {/* Protected routes */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/mp/return" element={<PaymentReturnPage />} />
        </Route>
      </Route>

      {/* Admin routes — standalone layout, no customer header */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryListPage />} />
          <Route path="ingredients" element={<IngredientListPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="stock-alerts" element={<StockAlertsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}

export default App

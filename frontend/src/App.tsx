import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardLayout from "./components/common/DashboardLayout"
import ClientDashboard from "./pages/ClientDashboard"
import ProviderDashboard from "./pages/ProviderDashboard"
import NewAppointmentPage from "./pages/NewAppointmentPage"
import AppointmentsList from "./pages/AppointmentsList"
import Settings from "./pages/Settings"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { useAuthStore } from "./store/useAuthStore"

function DashboardIndex() {
  const { user } = useAuthStore()
  if (user?.role === 'PROVIDER') {
    return <Navigate to="/dashboard/provider" replace />
  }
  return <ClientDashboard />
}

function AppointmentsRoute() {
  const { user } = useAuthStore()
  if (user?.role === 'PROVIDER') {
    return <div>Agenda del Proveedor</div>
  }
  return <AppointmentsList />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardIndex />} />
          <Route path="provider" element={<ProviderDashboard />} />
          <Route path="appointments" element={<AppointmentsRoute />} />
          <Route path="new-appointment" element={<NewAppointmentPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

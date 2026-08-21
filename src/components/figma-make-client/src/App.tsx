import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import BookingConfirmedPage from "./pages/BookingConfirmedPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./pages/AuthPages";
import type { Appointment } from "./data/mock";

export type View =
  | "home"
  | "login"
  | "register"
  | "forgot-password"
  | "booking"
  | "booking-confirmed"
  | "appointments"
  | "notifications"
  | "profile";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [unreadCount, setUnreadCount] = useState(2);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    service: string; specialist: string; date: string; time: string;
    duration: number; price: number; code: string;
  } | null>(null);

  const navigate = (v: View) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setView(v);
  };

  const handleLogin = () => { setIsLoggedIn(true); navigate("home"); };
  const handleLogout = () => { setIsLoggedIn(false); navigate("home"); };

  const handleBookingComplete = (booking: typeof confirmedBooking) => {
    setConfirmedBooking(booking);
    navigate("booking-confirmed");
  };

  const handleBookingAction = () => {
    if (!isLoggedIn) navigate("login");
    else navigate("booking");
  };

  const showShell = !["login", "register", "forgot-password"].includes(view);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showShell && (
        <Navbar
          view={view}
          isLoggedIn={isLoggedIn}
          onNavigate={navigate}
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />
      )}

      {/* Page transition wrapper — key forces remount + animation on every navigation */}
      <main className={`flex-1 ${showShell ? "pb-20 md:pb-0" : ""}`}>
        <div key={view} className="animate-fade-in h-full">
          {view === "home" && <HomePage onNavigate={navigate} onBooking={handleBookingAction} />}
          {view === "booking" && <BookingPage onNavigate={navigate} onComplete={handleBookingComplete} />}
          {view === "booking-confirmed" && confirmedBooking && (
            <BookingConfirmedPage booking={confirmedBooking} onNavigate={navigate} />
          )}
          {view === "appointments" && (
            <AppointmentsPage
              onNavigate={navigate}
              onBooking={handleBookingAction}
              selectedAppointment={selectedAppointment}
              onSelectAppointment={setSelectedAppointment}
            />
          )}
          {view === "notifications" && (
            <NotificationsPage unreadCount={unreadCount} onMarkAllRead={() => setUnreadCount(0)} />
          )}
          {view === "profile" && <ProfilePage onLogout={handleLogout} />}
          {view === "login" && <LoginPage onLogin={handleLogin} onNavigate={navigate} />}
          {view === "register" && <RegisterPage onLogin={handleLogin} onNavigate={navigate} />}
          {view === "forgot-password" && <ForgotPasswordPage onNavigate={navigate} />}
        </div>
      </main>

      {showShell && (
        <>
          {view === "home" && <Footer onNavigate={navigate} />}
          <BottomNav
            view={view}
            isLoggedIn={isLoggedIn}
            onNavigate={navigate}
            onBooking={handleBookingAction}
            unreadCount={unreadCount}
          />
        </>
      )}
    </div>
  );
}

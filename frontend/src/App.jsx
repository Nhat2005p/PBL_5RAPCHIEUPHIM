import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react'; // Thêm useContext để điều hướng trang chủ
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- COMPONENTS ---
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';

// --- AUTH PAGES ---
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// --- CLIENT PAGES ---
import PublicHomePage from './pages/PublicHomePage'; // Trang chào mừng chung
import HomePage from './pages/client/HomePage'; // Dashboard khách đã đăng nhập
import MovieDetailPage from './pages/client/MovieDetailPage';
import BookingPage from './pages/Booking/BookingPage';
import Profile from './pages/client/Profile';

// --- ADMIN PAGES ---
import MovieManager from './pages/admin/MovieManager';
import RoomManager from './pages/admin/RoomManager';
import ShowtimeManager from './pages/admin/ShowtimeManager';
import EmployeeManager from './pages/admin/EmployeeManager';
import PromotionManager from './pages/admin/PromotionManager';
import ConcessionManager from './pages/admin/ConcessionManager';
import Dashboard from './pages/admin/Dashboard';
import SupportManager from './pages/admin/SupportManager';
import WarehouseManager from './pages/admin/WarehouseManager';

// --- STAFF PAGES ---
import PosPage from './pages/staff/PosPage';
import CheckInPage from './pages/staff/CheckInPage';
import CustomerPage from './pages/staff/CustomerPage';
import RefundPage from './pages/staff/RefundPage';

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative">
      <Navbar />
      <ChatWidget />

      <Routes>
        {/* --- PUBLIC ROUTES: AI CŨNG VÀO ĐƯỢC --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        
        {/* Điều hướng trang chủ thông minh */}
        <Route path="/" element={
            !user ? <PublicHomePage /> : 
            user.role?.toLowerCase() === 'admin' ? <Navigate to="/admin/dashboard" /> :
            user.role?.toLowerCase() === 'staff' ? <Navigate to="/staff/pos" /> :
            <HomePage />
        } />

        {/* --- PROTECTED: KHÁCH HÀNG + NHÂN VIÊN + ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin']} />}>
            <Route path="/booking/:showtimeId" element={<BookingPage />} />
            <Route path="/profile" element={<Profile />} />
        </Route>

        {/* --- STAFF: CHỈ NHÂN VIÊN + ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
            <Route path="/staff/pos" element={<PosPage />} />
            <Route path="/staff/check-in" element={<CheckInPage />} />
            <Route path="/staff/customers" element={<CustomerPage />} />
            <Route path="/staff/refund" element={<RefundPage />} />
        </Route>

        {/* --- ADMIN: CHỈ DUY NHẤT ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/movies" element={<MovieManager />} />
            <Route path="/admin/rooms" element={<RoomManager />} />
            <Route path="/admin/showtimes" element={<ShowtimeManager />} />
            <Route path="/admin/employees" element={<EmployeeManager />} />
            <Route path="/admin/promotions" element={<PromotionManager />} />
            <Route path="/admin/concessions" element={<ConcessionManager />} />
            <Route path="/admin/support" element={<SupportManager />} />
            <Route path="/admin/warehouse" element={<WarehouseManager />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // Đợi kiểm tra token xong

    // Nếu chưa đăng nhập -> đá về trang chủ
    if (!user) return <Navigate to="/" replace />;

    // Nếu role không phù hợp -> đá về trang chủ
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
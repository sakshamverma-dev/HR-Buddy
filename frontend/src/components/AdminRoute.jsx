import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;

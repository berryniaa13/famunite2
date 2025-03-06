// In App.js or your router component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import StudentDashboard from "./pages/StudentDashboard";
import EventModeratorPage from "./pages/EventModeratorPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/admin-dashboard" element={<DashboardPage />} />  {/* Admin Dashboard */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />   {/* User Dashboard */}
                <Route path="/event-moderator-dashboard" element={<EventModeratorPage />} />   {/* EventModerator Dashboard */}
            </Routes>
        </Router>
    );
}

export default App;


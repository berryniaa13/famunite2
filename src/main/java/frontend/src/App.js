import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/home/Dashboard';
import LoginPage from './pages/LoginPage';
import StudentDashboard from "./pages/home/StudentDashboard";
import EventModeratorPage from "./pages/home/EventModeratorPage";
import OrganizationLiasonPage from "./pages/home/OrganizationLiaisonPage";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SignUpPage from "./pages/SignUpPage";
import SelectLiaisonToChat from "./pages/SelectLiaisonToChat";
import SelectStudentToChat from "./pages/SelectStudentToChat";
import './styles/global.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/admin-dashboard" element={<DashboardPage />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/event-moderator-dashboard" element={<EventModeratorPage />} />
                <Route path="/organization-liaison-dashboard" element={<OrganizationLiasonPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/events" element={<Events />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat-select" element={<SelectLiaisonToChat />} />
                <Route path="/messages/:receiver_id" element={<Messages />} />
                <Route path="/messages" element={<Navigate to="/chat-select" />} />
                <Route path="/chat-select-student" element={<SelectStudentToChat />} />



            </Routes>
        </Router>
    );
}

export default App;

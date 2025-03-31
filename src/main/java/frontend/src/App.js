// In App.js or your router component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import StudentDashboard from "./pages/StudentDashboard";
import EventModeratorPage from "./pages/EventModeratorPage";
import OrganizationLiasonPage from "./pages/OrganizationLiasonPage";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/admin-dashboard" element={<DashboardPage />} />  {/* Admin Dashboard */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />   {/* User Dashboard */}
                <Route path="/event-moderator-dashboard" element={<EventModeratorPage />} />   {/* EventModerator Dashboard */}
                <Route path="/organization-liason-dashboard" element={<OrganizationLiasonPage />} />   {/* OrganizationLiason Dashboard */}
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/events" element={<Events/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/messages" element={<Messages/>}/>
            </Routes>
        </Router>
    );
}

export default App;


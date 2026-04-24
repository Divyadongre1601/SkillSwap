import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import Chat        from './pages/Chat';
import Requests    from './pages/Requests';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"              element={<Login />} />
                <Route path="/register"      element={<Register />} />
                <Route path="/dashboard"     element={<Dashboard />} />
                <Route path="/user/:id"      element={<UserProfile />} />
                <Route path="/profile/edit"  element={<EditProfile />} />
                <Route path="/chat"          element={<Chat />} />
                <Route path="/chat/:userId"  element={<Chat />} />
                <Route path="/requests"      element={<Requests />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

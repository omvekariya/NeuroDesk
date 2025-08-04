import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TicketForm from './components/TicketForm';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard.jsx';
import TicketDetailsPage from './components/TicketDetails.jsx';
import UserList from './components/Test';
import { UserDetails } from './pages/UserDetail.jsx';
import { TechnicianProfilePage } from './pages/TechnicianDetails.jsx';
import { TicketCreatePage } from './pages/TicketCreation.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { UserPage } from './pages/UserPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { TechnicianPage } from './pages/TechnicianPage.jsx';
import { ManagerPage } from './pages/ManagerPage.jsx';


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />} />
                <Route path='/ticket' element={<TicketCreatePage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route path='/tickets/:id' element={<TicketDetailsPage />} />
                <Route path='/users/:id' element={<UserDetails />} />
                <Route path="/technicians/:id" element={<TechnicianProfilePage />} />
                <Route path='/about' element={<About />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/test' element={<UserList />} />
                
                {/* Role-based routes */}
                <Route path='/user' element={<UserPage />} />
                <Route path='/admin' element={<AdminPage />} />
                <Route path='/technician' element={<TechnicianPage />} />
                <Route path='/manager' element={<ManagerPage />} />

            </Routes>
        </BrowserRouter>
    </StrictMode>,
)

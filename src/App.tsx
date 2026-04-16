import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { RegisterEntry } from './components/RegisterEntry';
import { RegisterExit } from './components/RegisterExit';
import { ViewVehicles } from './components/ViewVehicles';
import { ManageRates } from './components/ManageRates';
import { Reports } from './components/Reports';
import { UserProfile } from './components/UserProfile';

export type Screen = 
  | 'login' 
  | 'dashboard' 
  | 'register-entry' 
  | 'register-exit' 
  | 'view-vehicles' 
  | 'manage-rates' 
  | 'reports' 
  | 'user-profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Mobile Container - 360x640 viewport */}
      <div className="w-full max-w-[360px] h-[640px] bg-white rounded-[24px] shadow-2xl overflow-hidden relative">
        {currentScreen === 'login' && <Login onLogin={handleLogin} />}
        {currentScreen === 'dashboard' && <Dashboard navigate={navigate} />}
        {currentScreen === 'register-entry' && <RegisterEntry navigate={navigate} />}
        {currentScreen === 'register-exit' && <RegisterExit navigate={navigate} />}
        {currentScreen === 'view-vehicles' && <ViewVehicles navigate={navigate} />}
        {currentScreen === 'manage-rates' && <ManageRates navigate={navigate} />}
        {currentScreen === 'reports' && <Reports navigate={navigate} />}
        {currentScreen === 'user-profile' && <UserProfile navigate={navigate} onLogout={handleLogout} />}
      </div>
    </div>
  );
}

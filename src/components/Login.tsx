import React, { useState } from 'react';
import { Button } from './figma/ui/button';
import { Input } from './figma/ui/input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      {/* Decorative Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-lg flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 14C8 11.7909 9.79086 10 12 10H28C30.2091 10 32 11.7909 32 14V30C32 32.2091 30.2091 34 28 34H12C9.79086 34 8 32.2091 8 30V14Z" fill="white"/>
              <rect x="12" y="6" width="16" height="4" rx="2" fill="white"/>
              <circle cx="15" cy="22" r="2" fill="#2563EB"/>
              <circle cx="25" cy="22" r="2" fill="#2563EB"/>
              <path d="M12 28H28" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Parkcontrol</h1>
          <p className="text-gray-600">Gestiona tu estacionamiento fácilmente</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email o Usuario"
            placeholder="tu@email.com"
            icon={<Mail size={20} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            icon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button 
            type="button"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>

          <div className="pt-4">
            <Button type="submit" fullWidth size="lg">
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-gray-500 text-sm mt-8">
        © 2025 Parkcontrol. Todos los derechos reservados.
      </div>
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormLabel } from '@/components/ui/FormLabel';
import { ShieldCheck, Info } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'worknoon123!') {
        localStorage.setItem('worknoon_admin_auth', 'true');
        const redirect = searchParams.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 text-center bg-slate-50/60 border-b border-slate-100">
          <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to access the refund dashboard</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <Info className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Demo Credentials:</p>
            <p>User: <span className="font-mono text-slate-600 font-medium">admin</span> | Pass: <span className="font-mono text-slate-600 font-medium">worknoon123!</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

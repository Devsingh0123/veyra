import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../api/authApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const QUICK_TEST_ROLES = [
  {
    role: 'Super Admin',
    email: 'admin@veyra.internal',
    password: 'AdminPassword123!',
    desc: 'Full system privileges',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    role: 'Inventory Manager',
    email: 'warehouse@veyra.internal',
    password: 'WarehousePass123!',
    desc: 'Stock & reservation matrix',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    role: 'Order Operator',
    email: 'orders@veyra.internal',
    password: 'OrderOpsPass123!',
    desc: 'Dispatch & returns FSM',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      await login({ email, password }).unwrap();
      // On success, navigate to dashboard home
      navigate('/');
    } catch (err) {
      const errorMsg =
        err?.data?.error ||
        err?.data?.message ||
        err?.error ||
        'Authentication failed. Please check your credentials.';
      setFormError(errorMsg);
    }
  };

  const handleApplyPreset = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setFormError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3 shadow-lg shadow-indigo-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Veyra Control Plane
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Administrative Access &amp; Operations Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-white">
              Sign In to Admin
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enter your privileged credentials to proceed
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@veyra.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" /> Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* 1-Click Role Presets */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> 1-Click Test Roles
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-fill</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {QUICK_TEST_ROLES.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleApplyPreset(item.email, item.password)}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-left text-xs transition hover:border-slate-700 hover:bg-slate-800/40"
                    >
                      <div>
                        <div className="font-medium text-slate-200">{item.role}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] border ${item.badge}`}>
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 text-sm shadow-md shadow-indigo-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500">
          Veyra E-Commerce Core &bull; Port 5174 &bull; API Gateway Target
        </p>
      </div>
    </div>
  );
}

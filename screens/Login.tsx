import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../service/AuthService.js';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  employeeId: string;
  password:   string;
}

interface FieldError {
  employeeId?: string;
  password?:   string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname ?? '/';

  const [form, setForm]               = useState<FormState>({ employeeId: '', password: '' });
  const [errors, setErrors]           = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState('');

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FieldError = {};
    if (!form.employeeId.trim())  e.employeeId = 'Employee ID is required.';
    if (!form.password)           e.password   = 'Password is required.';
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await AuthService.login(form.employeeId, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setApiError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
      if (apiError)      setApiError('');
    };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#0d121b] overflow-hidden">

      {/* ── Hero / Brand Section ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center flex-shrink-0 pt-14 pb-10 px-6">

        {/* Ambient glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72
                        bg-[#00a99d]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-0 w-40 h-40
                        bg-[#135bec]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-40 h-40
                        bg-[#00a99d]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden
                        ring-2 ring-[#00a99d]/40 shadow-2xl shadow-[#00a99d]/20 mb-5">
          <img
            src="/assets/hospitonetLogo.jpeg"
            alt="Hospitonet Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand name + sub-tagline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Hospitonet
        </h1>
        <p className="mt-1 text-sm font-medium tracking-widest uppercase
                      text-[#00a99d]">
          HRMS Portal
        </p>
        <p className="mt-3 text-sm text-gray-400 text-center max-w-xs leading-relaxed">
          Sign in with your employee credentials to access your workspace.
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-[#f6f6f8] dark:bg-[#101622] rounded-t-3xl
                      shadow-[0_-4px_32px_rgba(0,0,0,0.25)] px-6 pt-8 pb-10">

        <h2 className="text-xl font-bold text-[#0d121b] dark:text-[#f0f2f5] mb-1">
          Welcome back 👋
        </h2>
        <p className="text-sm text-[#4c669a] dark:text-[#a0aec0] mb-7">
          Enter your details to continue.
        </p>

        {/* API-level error banner */}
        {apiError && (
          <div className="flex items-center gap-3 mb-5 px-4 py-3
                          bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-xl text-red-600 dark:text-red-400 text-sm">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── Employee ID ─────────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="employeeId"
              className="block text-xs font-semibold tracking-wide
                         text-[#4c669a] dark:text-[#a0aec0] mb-2 uppercase"
            >
              Employee ID
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2
                               material-symbols-outlined text-[20px]
                               text-[#4c669a] dark:text-[#a0aec0]">
                badge
              </span>
              <input
                id="employeeId"
                type="text"
                autoComplete="username"
                placeholder="e.g. DOC56789"
                value={form.employeeId}
                onChange={handleChange('employeeId')}
                className={`
                  w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium
                  bg-white dark:bg-[#1c2436]
                  text-[#0d121b] dark:text-[#f0f2f5]
                  placeholder-gray-400 dark:placeholder-gray-600
                  border transition-all outline-none
                  ${errors.employeeId
                    ? 'border-red-400 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900/40'
                    : 'border-gray-200 dark:border-[#2d3748] focus:border-[#135bec] focus:ring-2 focus:ring-[#135bec]/20'
                  }
                `}
              />
            </div>
            {errors.employeeId && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error_outline</span>
                {errors.employeeId}
              </p>
            )}
          </div>

          {/* ── Password ────────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wide
                           text-[#4c669a] dark:text-[#a0aec0] uppercase"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-[#135bec]
                           hover:text-[#0e46b9] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2
                               material-symbols-outlined text-[20px]
                               text-[#4c669a] dark:text-[#a0aec0]">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                className={`
                  w-full pl-12 pr-12 py-3.5 rounded-xl text-sm font-medium
                  bg-white dark:bg-[#1c2436]
                  text-[#0d121b] dark:text-[#f0f2f5]
                  placeholder-gray-400 dark:placeholder-gray-600
                  border transition-all outline-none
                  ${errors.password
                    ? 'border-red-400 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900/40'
                    : 'border-gray-200 dark:border-[#2d3748] focus:border-[#135bec] focus:ring-2 focus:ring-[#135bec]/20'
                  }
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2
                           material-symbols-outlined text-[20px]
                           text-[#4c669a] dark:text-[#a0aec0]
                           hover:text-[#135bec] transition-colors"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error_outline</span>
                {errors.password}
              </p>
            )}
          </div>

          {/* ── Sign In Button ───────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-xl font-bold text-sm text-white tracking-wide
              bg-[#135bec] hover:bg-[#0e46b9] active:scale-[0.98]
              transition-all shadow-lg shadow-[#135bec]/30
              disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
              flex items-center justify-center gap-2 mt-2
            "
          >
            {loading ? (
              <>
                {/* Spinner */}
                <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>

        </form>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 my-7">
          <div className="flex-1 h-px bg-gray-200 dark:bg-[#2d3748]" />
          <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">
            Secure Access
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-[#2d3748]" />
        </div>

        {/* ── Security Badges ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-6">
          {[
            { icon: 'shield',         label: 'Encrypted'  },
            { icon: 'verified_user',  label: 'Verified'   },
            { icon: 'lock',           label: 'Private'    },
          ].map(b => (
            <div key={b.label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-[#00a99d]/10 dark:bg-[#00a99d]/10
                              flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#00a99d]">
                  {b.icon}
                </span>
              </div>
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600">
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          © {new Date().getFullYear()} Hospitonet · All rights reserved
        </p>
        <p className="text-center text-[10px] text-gray-300 dark:text-gray-700 mt-1">
          Empowering Hospitals, Enhancing Care
        </p>

      </div>
    </div>
  );
};

export default Login;

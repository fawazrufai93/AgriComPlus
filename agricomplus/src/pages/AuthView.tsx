import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  UserCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useApp } from '../context/AppContext';

interface AuthViewProps {
  initialMode?: 'login' | 'signup' | 'landing';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login' }) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    goToScreen,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(
    initialMode === 'signup' ? 'signup' : 'login'
  );
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, fullName, username || email.split('@')[0]);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      // Supabase auth errors surface as a plain message string (no error
      // "code" enum like Firebase), so we match on the message text instead.
      const message: string = err?.message || '';
      if (/invalid login credentials/i.test(message)) {
        setErrorMessage('Invalid email or password. Please verify and try again.');
      } else if (/already registered|already exists/i.test(message)) {
        setErrorMessage('This email is already registered. Please switch to Log In.');
      } else if (/password.*(least|characters)/i.test(message)) {
        setErrorMessage('Password should be at least 6 characters.');
      } else if (/email.*not confirmed/i.test(message)) {
        setErrorMessage('Please confirm your email address before logging in (check your inbox).');
      } else {
        setErrorMessage(message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] p-4 pb-12 flex flex-col justify-between max-w-md mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between py-2">
          <button
            type="button"
            onClick={() => goToScreen({ type: 'home' })}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/logo-mark.png" alt="AgriCom+ logo" className="w-8 h-8 object-contain" />
            <span className="font-heading text-sm font-bold text-[#234D33]">
              AgriCom<span className="text-[#E8622C]">+</span>
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Tab Switcher: Log In / Sign Up */}
        <div className="mt-4 p-1 bg-stone-200/80 rounded-xl grid grid-cols-2 text-xs font-bold text-stone-600">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-[#234D33] shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#234D33] shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Heading */}
        <div className="mt-6 mb-4">
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-stone-900">
            {mode === 'login' ? 'Welcome Back to AgriCom+' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login'
              ? 'Log in to trace harvests and order produce across Kumasi'
              : 'Sign up to connect directly with Kumasi farmers'}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3 px-4 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-stone-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-stone-800 cursor-pointer disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <span className="text-xs text-stone-500">Connecting to Google...</span>
          ) : (
            <>
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <div className="flex items-center gap-2">
                <span>Continue with Google</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  1-Click
                </span>
              </div>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#F6F8F6] px-2 text-stone-400 font-semibold">
              Or with email & password
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === 'signup' && (
            <>
              <TextField
                label="Full Name"
                placeholder="e.g. Kwame Mensah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <TextField
                label="Username"
                placeholder="e.g. kwame_kumasi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<UserCheck className="w-4 h-4" />}
              />
            </>
          )}

          <TextField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:text-stone-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            required
          />

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    setErrorMessage('Enter your email above first, then tap "Forgot password?" again.');
                    return;
                  }
                  try {
                    await sendPasswordReset(email);
                    setErrorMessage('');
                    alert('Password reset email sent — check your inbox.');
                  } catch (err: any) {
                    setErrorMessage(err.message || 'Could not send reset email.');
                  }
                }}
                className="text-[11px] text-[#234D33] font-semibold underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signup' ? 'Create Account' : 'Log In'}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer Switcher */}
      <div className="pt-6 text-center">
        {mode === 'login' ? (
          <p className="text-xs text-stone-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className="text-[#234D33] font-bold underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p className="text-xs text-stone-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className="text-[#234D33] font-bold underline cursor-pointer"
            >
              Log In
            </button>
          </p>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3A7D44]" />
          <span>Secured with Supabase Authentication & Database</span>
        </div>
      </div>
    </div>
  );
};

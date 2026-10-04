import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  Truck,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { OnboardingFeature } from '../components/ui/OnboardingFeature';
import { useApp } from '../context/AppContext';

type OnboardingStep = 'splash' | 'auth_landing' | 'signup' | 'login';

export const OnboardingView: React.FC = () => {
  const {
    goToScreen,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
  } = useApp();

  const [step, setStep] = useState<OnboardingStep>('splash');

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSkipToMarket = () => {
    goToScreen({ type: 'home' });
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !fullName) {
      setError('Please complete all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, fullName, username || email.split('@')[0]);
    } catch (err: any) {
      console.error('Signup error', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Could not sign up. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      console.error('Login error', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google auth error', err);
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] flex flex-col justify-between p-5 pb-8 relative overflow-hidden">
      {/* Decorative background foliage accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-10 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -ml-24" />

      {/* TOP HEADER / LOGO BAR */}
      <div className="pt-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <img src="/logo-mark.png" alt="AgriCom+ logo" className="w-10 h-10 object-contain" />
          <span className="font-heading text-lg font-bold text-[#234D33] tracking-tight">
            AgriCom<span className="text-[#E8622C]">+</span>
          </span>
        </div>

        {step !== 'splash' && (
          <button
            type="button"
            onClick={handleSkipToMarket}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-1 rounded-full hover:bg-stone-200/50 cursor-pointer"
          >
            Skip to Market
          </button>
        )}
      </div>

      {/* SCREEN 1: SPLASH */}
      {step === 'splash' && (
        <div className="flex-1 flex flex-col justify-between py-6 z-10 animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6">
            {/* Centered Logo Mark */}
            <div className="relative mb-4">
              <img src="/logo.png" alt="AgriCom+ — Your ultimate choice to healthy food" className="w-56 h-56 object-contain" />
              <div className="absolute bottom-3 right-0 bg-[#E8622C] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Ghana Direct
              </div>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#234D33] tracking-tight">
              Welcome to AgriComPlus
            </h1>
            <p className="text-sm font-semibold text-[#E8622C] uppercase tracking-wider mt-1.5">
              The Choice Of Healthy Food
            </p>

            <p className="text-xs sm:text-sm text-stone-600 max-w-xs mt-3 leading-relaxed">
              Connect directly with verified local farmers across Kumasi. Enjoy harvested-at-dawn produce and scan QR package seals to trace your food right to the farm.
            </p>

            {/* Feature Highlights */}
            <div className="w-full max-w-sm mt-7 space-y-2.5">
              <OnboardingFeature
                icon={<Sprout className="w-5 h-5" />}
                title="Cut Out the Middleman"
                description="Buy fresh foodstuffs directly from Offinso, Ejisu, and Mampong farmers at genuine farm-gate prices."
              />
              <OnboardingFeature
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Tamper-Proof QR Traceability"
                description="Every delivery package has a scannable QR code revealing harvest time, field test, and farmer identity."
              />
              <OnboardingFeature
                icon={<Truck className="w-5 h-5" />}
                title="Under 3-Hour Kumasi Delivery"
                description="Direct to your doorstep in Ahodwo, Adum, KNUST, Nhyiaeso, and all Kumasi metro areas."
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={() => setStep('auth_landing')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Let's Go
            </Button>
          </div>
        </div>
      )}

      {/* SCREEN 2: AUTH LANDING */}
      {step === 'auth_landing' && (
        <div className="flex-1 flex flex-col justify-between py-6 z-10 animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
            <img src="/logo.png" alt="AgriCom+ logo" className="w-40 h-40 object-contain mb-4" />

            <h2 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">
              Eat Fresh. Know Your Farmer.
            </h2>
            <p className="text-xs text-stone-500 max-w-xs mt-2">
              Sign up or log in to order farm-fresh produce and trace your delivery right to the farm.
            </p>

            <div className="w-full max-w-xs mt-8 space-y-3">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-3.5 px-4 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-stone-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-stone-800 cursor-pointer"
              >
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
                <span>Continue with Google</span>
              </button>

              <Button
                size="lg"
                onClick={() => setStep('signup')}
              >
                Sign Up with Email
              </Button>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="w-full py-2.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#234D33] transition-colors cursor-pointer"
              >
                Already have an account? <span className="text-[#234D33] font-bold underline">Log In</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-stone-400">
              Secured with Supabase Authentication & Database
            </p>
          </div>
        </div>
      )}

      {/* SCREEN 3: SIGN UP FORM */}
      {step === 'signup' && (
        <div className="flex-1 flex flex-col justify-between py-4 z-10 animate-in fade-in duration-300">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-4">
              <h2 className="font-heading text-xl font-bold text-stone-900">
                Create Your Account
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Fresh organic produce delivered to your Kumasi doorstep
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full mb-3 py-2.5 px-4 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-stone-50 flex items-center justify-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#F6F8F6] px-2 text-stone-400 font-semibold">
                  Or with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kwabena Osei-Tutu"
                icon={<User className="w-4 h-4" />}
                required
              />

              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. kwabena_gh"
                icon={<UserCheck className="w-4 h-4" />}
              />

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kwabena@gmail.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

              <div className="pt-2">
                <Button type="submit" size="lg" isLoading={isLoading}>
                  Signup
                </Button>
              </div>
            </form>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setStep('login');
                setError('');
              }}
              className="text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Already have an account?{' '}
              <span className="text-[#234D33] font-bold underline">Login</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: LOGIN FORM */}
      {step === 'login' && (
        <div className="flex-1 flex flex-col justify-between py-4 z-10 animate-in fade-in duration-300">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-4">
              <h2 className="font-heading text-xl font-bold text-stone-900">
                Welcome Back
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Log into your AgriCom+ account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full mb-3 py-2.5 px-4 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-stone-50 flex items-center justify-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#F6F8F6] px-2 text-stone-400 font-semibold">
                  Or with email
                </span>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

              <div className="pt-2">
                <Button type="submit" size="lg" isLoading={isLoading}>
                  Log In
                </Button>
              </div>
            </form>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setStep('signup');
                setError('');
              }}
              className="text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Don't have an account yet?{' '}
              <span className="text-[#234D33] font-bold underline">Sign Up</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

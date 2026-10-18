import React, { useState } from 'react';
import { 
  X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, 
  CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck, 
  LogOut, Package, ChefHat, KeyRound
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithEmail, 
  registerWithEmail, 
  sendPasswordReset, 
  signInAsGuest, 
  googleSignIn,
  logout 
} from '../services/firebaseAuth';
import { SELLER_EMAIL } from '../services/gmailService';
import { BrandLogo } from './BrandLogo';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess?: (user: User) => void;
  onOpenMyOrders?: () => void;
  onOpenSellerPortal?: () => void;
}

type AuthTab = 'signin' | 'register' | 'forgot';

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onOpenMyOrders,
  onOpenSellerPortal,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSeller = Boolean(
    currentUser?.email &&
    currentUser.email.toLowerCase().trim() === SELLER_EMAIL.toLowerCase().trim()
  );

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await signInWithEmail(email, password);
      setSuccessMsg(`Welcome back, ${user.displayName || user.email}!`);
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and a secure password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await registerWithEmail(email, password, displayName);
      setSuccessMsg(`Account created successfully! Welcome to Adrit Creations, ${user.displayName || user.email}!`);
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendPasswordReset(email);
      setSuccessMsg(`Password reset instructions have been dispatched to ${email}. Check your inbox!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await googleSignIn();
      if (res?.user) {
        setSuccessMsg(`Connected successfully as ${res.user.displayName || res.user.email}!`);
        if (onAuthSuccess) onAuthSuccess(res.user);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await signInAsGuest();
      setSuccessMsg('Signed in as Guest Connoisseur! You can track orders and browse.');
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    setIsLoading(true);
    try {
      await logout();
      setSuccessMsg('Successfully signed out.');
      resetForm();
    } catch (err: any) {
      setErrorMsg('Sign out error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-rose-200 rounded-3xl shadow-2xl overflow-hidden text-[#2c180e] my-6">
        
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center justify-center mb-2">
            <span className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </span>
          </div>

          <h3 className="font-serif text-2xl font-bold tracking-tight">
            Adrit Creations
          </h3>
          <p className="text-xs text-rose-100 mt-1 max-w-xs mx-auto">
            Firebase Authentication &bull; Secure Customer & Kitchen Portal
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* If already signed in: Profile & Management view */}
          {currentUser ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 border border-rose-200 text-center space-y-3">
                <div className="relative inline-block">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User Avatar'}
                      className="w-16 h-16 rounded-full mx-auto border-2 border-rose-400 object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  {isSeller && (
                    <span 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-md"
                      title="Store Owner"
                    >
                      👑
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-base text-[#2a160d]">
                    {currentUser.displayName || 'Chocolate Connoisseur'}
                  </h4>
                  <p className="text-xs text-[#6b4733] font-medium">
                    {currentUser.email || (currentUser.isAnonymous ? 'Guest User' : 'Anonymous Account')}
                  </p>
                  
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
                    {isSeller ? (
                      <span className="bg-amber-100 text-amber-900 border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                        <span>Store Owner & Chocolatière</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-900 border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Customer Account</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 pt-1">
                  Firebase UID: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-rose-100 text-[10px]">{currentUser.uid.slice(0, 14)}...</code>
                </div>
              </div>

              {/* Quick Navigation based on role */}
              <div className="space-y-2">
                {isSeller && onOpenSellerPortal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSellerPortal();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Open Mom’s Kitchen Portal</span>
                  </button>
                )}

                {onOpenMyOrders && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMyOrders();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-rose-600" />
                    <span>View My Orders & Real-time Tracking</span>
                  </button>
                )}

                <button
                  onClick={handleLogoutClick}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 text-stone-500" />
                  <span>{isLoading ? 'Signing Out...' : 'Sign Out from Firebase'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated: Auth Tabs & Forms */
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="flex border-b border-rose-100 text-xs font-bold text-stone-500">
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className={`flex-1 pb-2.5 text-center cursor-pointer transition-all border-b-2 ${
                    activeTab === 'signin'
                      ? 'border-rose-600 text-rose-700'
                      : 'border-transparent hover:text-stone-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`flex-1 pb-2.5 text-center cursor-pointer transition-all border-b-2 ${
                    activeTab === 'register'
                      ? 'border-rose-600 text-rose-700'
                      : 'border-transparent hover:text-stone-700'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('forgot')}
                  className={`flex-1 pb-2.5 text-center cursor-pointer transition-all border-b-2 ${
                    activeTab === 'forgot'
                      ? 'border-rose-600 text-rose-700'
                      : 'border-transparent hover:text-stone-700'
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* Feedback Notifications */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: SIGN IN */}
              {activeTab === 'signin' && (
                <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#4a2e1b]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTabChange('forgot')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 underline font-medium cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-9 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs hover:opacity-95 shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In with Firebase'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTER */}
              {activeTab === 'register' && (
                <form onSubmit={handleEmailRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Neetu Yadav"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-9 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:opacity-95 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* TAB 3: FORGOT PASSWORD */}
              {activeTab === 'forgot' && (
                <form onSubmit={handlePasswordReset} className="space-y-3.5">
                  <div className="text-xs text-stone-600">
                    Enter your registered email address and we will dispatch a secure Firebase password reset link to your inbox.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#2a160d] placeholder-stone-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold text-xs hover:opacity-95 shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Sending...' : 'Send Password Reset Link'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleTabChange('signin')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                    >
                      &larr; Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Social / One-Click Options Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rose-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-3 text-stone-400 font-bold">
                    Or instant options
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Guest Demo Login Button */}
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 border border-amber-200 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Demo Guest Sign In (No password needed)</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer info note */}
        <div className="bg-stone-50 border-t border-rose-100 p-3 text-center text-[10px] text-stone-500">
          Powered by Firebase Authentication &bull; Protected with SSL Encryption
        </div>

      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, Mail, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';

type LoginStep = 'email-pass' | 'otp-request' | 'otp-verify' | 'forgot-password' | 'reset-password-verify';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email-pass');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, requestOtp, loginOtp, forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await requestOtp(email);
      setStep('otp-verify');
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginOtp(email, otp);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setStep('reset-password-verify');
      setSuccess('Reset code sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, newPassword);
      setStep('email-pass');
      setSuccess('Password reset successfully. You can now login.');
      setPassword('');
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-grid-white/[0.02] relative">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                {step === 'email-pass' ? <LogIn className="w-6 h-6 text-primary" /> : <Mail className="w-6 h-6 text-primary" />}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {step === 'email-pass' && "Welcome Back"}
                {step === 'otp-request' && "OTP Login"}
                {step === 'otp-verify' && "Verify Your Identity"}
                {step === 'forgot-password' && "Reset Password"}
                {step === 'reset-password-verify' && "New Password"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {step === 'email-pass' && "Enter your credentials to access your account"}
                {step === 'otp-request' && "Enter your email to receive a secure login code"}
                {step === 'otp-verify' && `We've sent a 6-digit code to ${email}`}
                {step === 'forgot-password' && "We'll send a code to reset your password"}
                {step === 'reset-password-verify' && "Enter the code and your new secure password"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                {success}
              </div>
            )}

            {step === 'email-pass' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="username">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="username"
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="password">Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setStep('forgot-password'); setError(''); setSuccess(''); }}
                      className="text-[11px] font-black uppercase text-primary hover:underline tracking-widest"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
                >
                  {isLoading ? "Signing in..." : "SIGN IN"}
                </button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/20"></span></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-card px-2 text-muted-foreground tracking-widest">OR</span></div>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep('otp-request'); setError(''); setSuccess(''); }}
                  className="w-full py-2.5 bg-secondary text-foreground font-black rounded-lg hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> LOGIN WITH OTP
                </button>
              </form>
            )}

            {step === 'otp-request' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? "Sending..." : "SEND CODE"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email-pass')}
                  className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/50 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Password
                </button>
              </form>
            )}

            {step === 'otp-verify' && (
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="otp">6-Digit Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono tracking-[0.5em] text-center text-lg"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? "Verifying..." : "VERIFY & LOGIN"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('otp-request')}
                  className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/50 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Resend Code
                </button>
              </form>
            )}

            {step === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? "Sending..." : "SEND RESET CODE"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email-pass')}
                  className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/50 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </form>
            )}

            {step === 'reset-password-verify' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="reset-otp">Verification Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="reset-otp"
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono tracking-widest"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-password">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      id="new-password"
                      type="password"
                      className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? "Resetting..." : "SET NEW PASSWORD"}
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-xs text-muted-foreground font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-black hover:underline tracking-tight">
            REGISTER FOR FREE
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

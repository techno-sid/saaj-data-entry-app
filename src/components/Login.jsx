import React, { useState } from 'react';

function Login({ onLoginSuccess, settings }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate a tiny delay for a premium feel / loading effect
    setTimeout(() => {
      if (username === 'Saaj' && password === 'Neha') {
        localStorage.setItem('saaj_logged_in', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid username or password. Please try again.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-surface px-4 animate-fadeIn">
      {/* Login Card */}
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-lg flex flex-col gap-6">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img 
            src="/logo.png" 
            alt="Saaj Creation Logo" 
            className="h-20 w-20 rounded-full object-cover border border-outline-variant shadow-md"
            onError={(e) => {
              // Fallback if logo.png doesn't exist
              e.target.style.display = 'none';
            }}
          />
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-md text-headline-md text-primary">
              {settings.businessName || 'Saaj Creation'}
            </h2>
            <p className="font-body-md text-on-surface-variant text-xs">
              Sign in to manage sales, inventory and database.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg flex items-start gap-2 border border-error/20 text-xs animate-shake">
            <span className="material-symbols-outlined text-sm mt-0.5 select-none">error</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">USERNAME</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline select-none">
                person
              </span>
              <input
                className="w-full bg-surface border border-outline rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">PASSWORD</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline select-none">
                lock
              </span>
              <input
                className="w-full bg-surface border border-outline rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 rounded-full text-outline hover:bg-surface-variant transition-colors flex items-center justify-center cursor-pointer"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined select-none text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary h-12 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all font-bold cursor-pointer shadow-sm mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-[11px] text-outline font-semibold tracking-wider uppercase select-none">
        &copy; {new Date().getFullYear()} {settings.businessName || 'Saaj Creation'}. All Rights Reserved.
      </footer>
    </div>
  );
}

export default Login;

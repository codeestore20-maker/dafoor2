import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authService.register({ name, email, password });
      login(data.token, data.user);
      navigate('/app');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      if (errorMsg === 'User already exists') setError(t('user_exists'));
      else setError(t('registration_failed'));
    }
  };

  return (
    <AuthLayout 
      title={t('new_here')} 
      subtitle={t('create_account_promo')}
    >
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold border-l-4 border-red-500 shadow-sm transform rotate-1">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-stone-600 font-bold ml-1 text-sm uppercase tracking-wider">{t('name_label')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl border-2 border-stone-300 focus:border-school-board focus:ring-4 focus:ring-school-board/10 outline-none transition-all bg-white font-sans text-lg"
              placeholder={t('name_placeholder')}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-stone-600 font-bold ml-1 text-sm uppercase tracking-wider">{t('email_label')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-xl border-2 border-stone-300 focus:border-school-board focus:ring-4 focus:ring-school-board/10 outline-none transition-all bg-white font-sans text-lg"
              placeholder={t('email_placeholder')}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-stone-600 font-bold ml-1 text-sm uppercase tracking-wider">{t('password_label')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-xl border-2 border-stone-300 focus:border-school-board focus:ring-4 focus:ring-school-board/10 outline-none transition-all bg-white font-sans text-lg"
              placeholder={t('password_placeholder')}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-school-board text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-school-board/90 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 text-lg border-2 border-transparent hover:border-school-board/50"
          >
            <UserPlus size={20} />
            {t('register_btn')}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-stone-300 flex-1"></div>
            <span className="text-stone-400 text-sm font-bold uppercase">{t('or_divider')}</span>
            <div className="h-px bg-stone-300 flex-1"></div>
        </div>

        <div className="space-y-3">
            <button className="w-full bg-white text-stone-700 font-bold py-3.5 rounded-xl border-2 border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md group transform hover:-translate-y-0.5">
                {/* Real Google SVG Icon */}
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('google_login')}
            </button>
        </div>

        <div className="mt-8 text-center">
            <p className="text-stone-500 font-serif italic">
                {t('has_account')}{' '}
                <Link to="/login" className="text-school-board font-bold not-italic hover:underline decoration-2 underline-offset-2">
                    {t('login_link')}
                </Link>
            </p>
        </div>
    </AuthLayout>
  );
}

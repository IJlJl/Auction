import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isRegisterMode) {
        await register(email, password, nickname);
        alert('Акаунт успішно створено! Тепер виконайте вхід.');
        setIsRegisterMode(false);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Сталася помилка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-3xl bg-[#160B12]/85 border border-rose-500/20 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-6">
          <motion.h2
            key={isRegisterMode ? 'register' : 'login'}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-white tracking-tight"
          >
            {isRegisterMode ? 'Створити акаунт' : 'З поверненням!'}
          </motion.h2>
          <p className="text-xs text-rose-200/60 mt-1">
            {isRegisterMode
              ? 'Зареєструйтесь, щоб робити ставки на аукціоні'
              : 'Увійдіть, щоб брати участь у торгах'}
          </p>
        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium overflow-hidden"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {isRegisterMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
                  Ваш нікнейм
                </label>
                <input
                  type="text"
                  required
                  placeholder="collector_99"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
              Електронна пошта
            </label>
            <input
              type="email"
              required
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Зачекайте...
              </>
            ) : isRegisterMode ? (
              'Зареєструватися'
            ) : (
              'Увійти'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMessage(null);
            }}
            className="text-xs text-rose-200/60 hover:text-rose-300 transition-colors"
          >
            {isRegisterMode
              ? 'Вже маєте акаунт? Увійти'
              : 'Ще немає акаунту? Зареєструватися'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeCount: number;
  currentView: 'home' | 'profile';
  onNavigate: (view: 'home' | 'profile') => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCount,
  currentView,
  onNavigate,
  onOpenCreateModal,
}) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-rose-500/10 bg-[#0D060A]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onNavigate('home')}
          className="text-2xl font-black tracking-tight flex items-center gap-1 group cursor-pointer"
        >
          <span className="bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent tracking-wide font-serif group-hover:from-rose-200 group-hover:to-amber-100 transition-all">
            Auction
          </span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="text-rose-500 text-3xl leading-none inline-block drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
          >
            .
          </motion.span>
        </motion.button>

        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-rose-500/10 rounded-full px-4 py-1.5 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs text-rose-200/70 font-medium tracking-wide">
            {activeCount} {activeCount === 1 ? 'активний лот' : 'активних лотів'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'profile'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.nickname ? user.nickname[0].toUpperCase() : 'U'}
                </span>
                <span className="hidden sm:inline">@{user.nickname}</span>
              </motion.button>

               <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.93 }}
                initial="initial"
                onClick={onOpenCreateModal}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] flex items-center gap-1.5 border border-rose-400/30 cursor-pointer"
              >
                <motion.span
                  variants={{
                    initial: { rotate: 0, scale: 1 },
                    hover: { rotate: 90, scale: 1.25 },
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="text-lg leading-none inline-block font-black"
                >
                  ＋
                </motion.span>
                <span className="hidden sm:inline">Новий лот</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={logout}
                className="bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 py-2 px-3 rounded-xl text-sm font-semibold transition-all"
                title="Вийти з акаунту"
              >
                Вийти
              </motion.button>
            </>
          ) : (
            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Гість
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
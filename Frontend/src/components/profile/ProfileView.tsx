import React from 'react';
import { motion } from 'framer-motion';
import type { Auction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../api/client';

interface ProfileViewProps {
  auctions: Auction[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ auctions }) => {
  const { user } = useAuth();

  if (!user) return null;

  const myAuctions = auctions.filter((a) => a.creatorId === user.id);
  const activeCount = myAuctions.filter((a) => a.status !== 'finished').length;
  const totalBidsCount = myAuctions.reduce(
    (acc, a) => acc + (a.bids?.length || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto py-4 space-y-8"
    >
      <div className="rounded-3xl bg-[#160B12]/80 border border-rose-500/20 p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(244,63,94,0.4)]"
          >
            {user.nickname ? user.nickname[0].toUpperCase() : 'U'}
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-white">@{user.nickname}</h2>
            <p className="text-sm text-rose-200/60">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/10 text-center transition-colors hover:border-rose-500/30"
          >
            <span className="text-2xl font-black font-mono text-white block">
              {myAuctions.length}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-rose-200/60 font-semibold">
              Всього лотів
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/10 text-center transition-colors hover:border-rose-500/30"
          >
            <span className="text-2xl font-black font-mono text-rose-400 block">
              {activeCount}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-rose-200/60 font-semibold">
              Активні торги
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/10 text-center transition-colors hover:border-rose-500/30"
          >
            <span className="text-2xl font-black font-mono text-amber-300 block">
              {totalBidsCount}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-rose-200/60 font-semibold">
              Отримано ставок
            </span>
          </motion.div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300/80">
          Мої виставлені лоти
        </h3>

        {myAuctions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#160B12]/40 border border-rose-500/10">
            <p className="text-rose-200/40 text-sm">
              Ви ще не виставили жодного товару на продаж.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAuctions.map((auction, idx) => {
              const price =
                Number(auction.currentPrice) > 0
                  ? Number(auction.currentPrice)
                  : Number(auction.startPrice);

              return (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-2xl bg-[#160B12]/60 border border-rose-500/15 flex items-center justify-between hover:border-rose-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {auction.imageUrl ? (
                      <img
                        src={`${API_URL}${auction.imageUrl}`}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-950"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                        📦
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {auction.title}
                      </h4>
                      <p className="text-xs text-rose-200/60">
                        {auction.bids?.length || 0} ставок
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-300 block text-base">
                      ${price}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        auction.status === 'finished'
                          ? 'text-slate-500'
                          : 'text-rose-400'
                      }`}
                    >
                      {auction.status === 'finished' ? 'Завершено' : 'Активний'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
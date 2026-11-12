import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Auction } from '../../types';
import { CountdownTimer } from './CountdownTimer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../api/client';

interface AuctionCardProps {
  auction: Auction;
  onPlaceBid: (auctionId: string, amount: number) => Promise<void>;
  onSelect?: () => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onPlaceBid, onSelect }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFinished = auction.status === 'finished';

  const currentPrice =
    Number(auction.currentPrice) > 0
      ? Number(auction.currentPrice)
      : Number(auction.startPrice);

  const topBids = (auction.bids || [])
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const handleBidSubmit = async (amount: number) => {
    if (amount <= currentPrice) {
      toast.error(`Ставка має бути більшою за $${currentPrice}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onPlaceBid(auction.id, amount);
      toast.success(`Ставку $${amount} успішно прийнято! 🎯`);
      setCustomAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Не вдалося зробити ставку');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col rounded-3xl bg-[#160B12]/80 border border-rose-500/20 hover:border-rose-400/50 hover:shadow-[0_0_35px_rgba(244,63,94,0.15)] transition-colors overflow-hidden backdrop-blur-xl"
    >
      <div 
        onClick={onSelect}
        className="relative h-56 bg-[#0a0508] overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {auction.imageUrl ? (
          <>
            <img
              src={`${API_URL}${auction.imageUrl}`}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
            />
            <img
              src={`${API_URL}${auction.imageUrl}`}
              alt={auction.title}
              className="relative z-10 max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-700">
            <span className="text-4xl">📦</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#160B12] via-transparent to-transparent pointer-events-none z-10" />

        <div className="absolute top-3 left-3 z-20">
          {isFinished ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 border border-white/10 text-slate-400">
              Закрито
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-20">
          <CountdownTimer targetDate={auction.endsAt} />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div onClick={onSelect} className="cursor-pointer">
          <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-1 group-hover:text-rose-300 transition-colors">
            {auction.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">
            {auction.description || 'Опис відсутній'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-rose-500/10">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
            Поточна ставка
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-rose-400 font-mono text-xl font-bold">$</span>
            <motion.span
              key={currentPrice}
              initial={{ scale: 1.25, color: '#FDE68A' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-3xl font-black font-mono tracking-tight inline-block"
            >
              {currentPrice.toLocaleString('en-US')}
            </motion.span>
          </div>
        </div>

        {topBids.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              Останні ставки
            </span>
            <div className="space-y-1.5">
              {topBids.map((bid, index) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        index === 0
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-slate-300 font-medium">
                      @{bid.bidder?.nickname || 'Анонім'}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      index === 0 ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    ${bid.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isFinished && isAuthenticated && (
          <div className="mt-auto pt-2 space-y-2.5">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={`> $${currentPrice}`}
                value={customAmount}
                onChange={(e) =>
                  setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting || customAmount === ''}
                onClick={() => handleBidSubmit(Number(customAmount))}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
              >
                Ставка
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              onClick={() => handleBidSubmit(currentPrice + 10)}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              ⚡ Швидка ставка (+ $10)
            </motion.button>
          </div>
        )}

        {isFinished && (
          <div className="mt-auto py-3 text-center rounded-xl bg-white/[0.02] border border-dashed border-rose-500/15">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              🏁 Аукціон закрито
            </span>
            {topBids[0] && (
              <span className="text-xs text-slate-400 mt-1 block">
                Переможець: <b className="text-amber-300">@{topBids[0].bidder?.nickname}</b>
              </span>
            )}
          </div>
        )}

        {!isFinished && !isAuthenticated && (
          <div className="mt-auto py-2.5 text-center text-xs text-slate-500">
            Увійдіть, щоб зробити ставку
          </div>
        )}
      </div>
    </motion.div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Auction } from '../../types';
import { CountdownTimer } from './CountdownTimer';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../api/client';
import { socket } from '../../api/sockets';

interface AuctionDetailViewProps {
  auction: Auction;
  onBack: () => void;
  onPlaceBid: (auctionId: string, amount: number) => Promise<void>;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export const AuctionDetailView: React.FC<AuctionDetailViewProps> = ({
  auction,
  onBack,
  onPlaceBid,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFinished = auction.status === 'finished';

  const currentPrice =
    Number(auction.currentPrice) > 0
      ? Number(auction.currentPrice)
      : Number(auction.startPrice);

  const bids = (auction.bids || [])
    .slice()
    .sort((a, b) => b.amount - a.amount);

  const topBid = bids[0];
  const isWinner =
    isFinished &&
    topBid &&
    (topBid.bidderId === user?.id || topBid.bidder?.nickname === user?.nickname);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Система',
      text: isFinished
        ? 'Торги по цьому лоту завершено. Чат переведено в режим архіву.'
        : `Аукціон відкрито зі стартовою ціною $${auction.startPrice}!`,
      time: '12:00',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chatMessage', handleNewMessage);
    return () => {
      socket.off('chatMessage', handleNewMessage);
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinished || !inputText.trim() || !user) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: user.nickname || 'Анонім',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('chatMessage', newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleBidSubmit = async (amount: number) => {
    if (amount <= currentPrice) {
      alert(`Ставка має бути більшою за $${currentPrice}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onPlaceBid(auction.id, amount);
      setCustomAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <motion.button
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-300 hover:text-white transition-colors cursor-pointer"
      >
        <span>←</span> Назад до всіх лотів
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl bg-[#160B12]/80 border border-rose-500/20 overflow-hidden backdrop-blur-xl">
            <div className="relative h-96 sm:h-[460px] bg-[#0a0508] overflow-hidden flex items-center justify-center">
              {auction.imageUrl ? (
                <>
                  <img
                    src={`${API_URL}${auction.imageUrl}`}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                  />
                  <img
                    src={`${API_URL}${auction.imageUrl}`}
                    alt={auction.title}
                    className="relative z-10 max-h-full max-w-full object-contain p-4 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                  />
                </>
              ) : (
                <div className="text-6xl text-slate-700">📦</div>
              )}

              <div className="absolute top-4 left-4 z-20">
                {isFinished ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 border border-white/10 text-slate-400">
                    Закрито
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-300 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    Live Торги
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 z-20">
                <CountdownTimer targetDate={auction.endsAt} />
              </div>
            </div>

            <div className="p-8 space-y-4">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {auction.title}
              </h1>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-rose-500/10">
                <span className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-2">
                  Детальний опис лоту
                </span>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {auction.description || 'Опис відсутній.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-rose-200/50 pt-2 border-t border-rose-500/10">
                <span>ID лоту: <b className="font-mono text-slate-400">{auction.id.slice(0, 8)}...</b></span>
                <span>Стартова ціна: <b className="text-white font-mono">${auction.startPrice}</b></span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="rounded-3xl bg-[#160B12]/80 border border-rose-500/20 p-6 backdrop-blur-xl space-y-4">
            
            <span className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block">
              Поточна найвища ставка
            </span>

            <div className="flex items-baseline gap-2">
              <span className="text-rose-400 font-mono text-2xl font-bold">$</span>
              <motion.span
                key={currentPrice}
                initial={{ scale: 1.25, color: '#FDE68A' }}
                animate={{ scale: 1, color: '#FFFFFF' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-4xl font-black font-mono tracking-tight"
              >
                {currentPrice.toLocaleString('en-US')}
              </motion.span>
            </div>

            {!isFinished && isAuthenticated && (
              <div className="pt-2 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={`> $${currentPrice}`}
                    value={customAmount}
                    onChange={(e) =>
                      setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full bg-white/5 border border-rose-500/20 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting || customAmount === ''}
                    onClick={() => handleBidSubmit(Number(customAmount))}
                    className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
                  >
                    Ставка
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isSubmitting}
                  onClick={() => handleBidSubmit(currentPrice + 10)}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  ⚡ Швидка ставка (+ $10)
                </motion.button>
              </div>
            )}

            {isFinished && !isWinner && (
              <div className="py-3 text-center rounded-xl bg-white/[0.02] border border-dashed border-rose-500/15">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  🏁 Торги завершено
                </span>
                {topBid && (
                  <span className="text-xs text-rose-200/80 mt-1 block">
                    Переможець: <b className="text-amber-300">@{topBid.bidder?.nickname}</b> за ${topBid.amount}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-[#160B12]/80 border border-rose-500/20 p-6 backdrop-blur-xl flex-1 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/10 mb-3">
              <span className="text-xs uppercase tracking-wider text-rose-200/80 font-bold flex items-center gap-2">
                <span>💬</span> {isFinished ? 'Чат торгів (Архів)' : 'Чат торгів (Live)'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isFinished ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'
                }`}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[220px]">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs p-2.5 rounded-xl border ${
                      msg.sender === 'Система'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        : msg.sender === user?.nickname
                        ? 'bg-white/10 border-white/15 text-white ml-4'
                        : 'bg-white/[0.02] border-white/5 text-slate-300 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1 opacity-70">
                      <span>@{msg.sender}</span>
                      <span className="text-[10px]">{msg.time}</span>
                    </div>
                    <p className="leading-snug">{msg.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatBottomRef} />
            </div>

            {isFinished ? (
              <div className="mt-3 pt-3 border-t border-rose-500/10 text-center py-2 bg-white/[0.02] rounded-xl">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  🔒 Чат закрито після завершення аукціону
                </p>
              </div>
            ) : isAuthenticated ? (
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-2 border-t border-rose-500/10">
                <input
                  type="text"
                  placeholder="Напишіть повідомлення..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-white/5 border border-rose-500/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Надіслати
                </motion.button>
              </form>
            ) : (
              <p className="text-[11px] text-slate-500 text-center mt-3 pt-2 border-t border-rose-500/10">
                Увійдіть, щоб писати в чат
              </p>
            )}
          </div>
        </div>
      </div>

    </motion.div>
  );
};
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Auction, PriceUpdatedPayload, AuctionFinishedPayload } from './types';
import { auctionsApi } from './api/auctions.api';
import { bidsApi } from './api/bids.api';
import { socket } from './api/sockets';
import { useAuth } from './context/AuthContext';

import { Navbar } from './components/ui/Navbar';
import { AuctionCard } from './components/auctions/AuctionCard';
import { AuctionDetailView } from './components/auctions/AuctionDetailView';
import { CreateAuctionModal } from './components/auctions/CreateAuctionModal';
import { AuthForm } from './components/auth/AuthForm';
import { ProfileView } from './components/profile/ProfileView';

type SortOption = 'newest' | 'endingSoon' | 'priceLow' | 'priceHigh' | 'mostBids';

export function App() {
  const { isAuthenticated } = useAuth();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'finished'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentView, setCurrentView] = useState<'home' | 'profile'>('home');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchAuctions = useCallback(async () => {
    try {
      const data = await auctionsApi.getAll();
      setAuctions(data);
    } catch (err: any) {
      console.error('Помилка завантаження лотів:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();

    const handlePriceUpdated = (payload: PriceUpdatedPayload) => {
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === payload.auctionId
            ? { ...auc, currentPrice: payload.newPrice }
            : auc
        )
      );
      fetchAuctions();
    };

    const handleAuctionFinished = (payload: AuctionFinishedPayload) => {
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === payload.auctionId ? { ...auc, status: 'finished' } : auc
        )
      );
    };

    socket.on('priceUpdated', handlePriceUpdated);
    socket.on('auctionFinished', handleAuctionFinished);

    return () => {
      socket.off('priceUpdated', handlePriceUpdated);
      socket.off('auctionFinished', handleAuctionFinished);
    };
  }, [fetchAuctions]);

  const handlePlaceBid = async (auctionId: string, amount: number) => {
    await bidsApi.placeBid({ auctionId, amount });
  };

  const handleCreateAuction = async (formData: FormData) => {
    await auctionsApi.create(formData);
    await fetchAuctions();
  };

  const processedAuctions = useMemo(() => {
    return auctions
      .filter((auc) => {
        if (filter === 'active') return auc.status !== 'finished';
        if (filter === 'finished') return auc.status === 'finished';
        return true;
      })
      .filter((auc) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = auc.title.toLowerCase().includes(q);
        const descMatch = (auc.description || '').toLowerCase().includes(q);
        return titleMatch || descMatch;
      })
      .sort((a, b) => {
        const priceA = Number(a.currentPrice) > 0 ? Number(a.currentPrice) : Number(a.startPrice);
        const priceB = Number(b.currentPrice) > 0 ? Number(b.currentPrice) : Number(b.startPrice);

        switch (sortBy) {
          case 'priceLow':
            return priceA - priceB;
          case 'priceHigh':
            return priceB - priceA;
          case 'endingSoon':
            return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
          case 'mostBids':
            return (b.bids?.length || 0) - (a.bids?.length || 0);
          case 'newest':
          default:
            return 0;
        }
      });
  }, [auctions, filter, searchQuery, sortBy]);

  const activeCount = auctions.filter((a) => a.status !== 'finished').length;
  const selectedAuction = auctions.find((a) => a.id === selectedAuctionId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D060A] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D060A] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      <Navbar
        activeCount={activeCount}
        currentView={currentView}
        onNavigate={(view) => {
          setSelectedAuctionId(null);
          setCurrentView(view);
        }}
        onOpenCreateModal={() => {
          setSelectedAuctionId(null);
          setCurrentView('home');
          setIsCreateModalOpen(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedAuction ? (
            <AuctionDetailView
              key={`detail-${selectedAuction.id}`}
              auction={selectedAuction}
              onBack={() => setSelectedAuctionId(null)}
              onPlaceBid={handlePlaceBid}
            />
          ) : currentView === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ProfileView auctions={auctions} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Аукціонні торги
                  </h1>
                  <p className="text-xs text-rose-200/60 mt-1">
                    Знайдено {processedAuctions.length} з {auctions.length} лотів
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-2xl bg-white/[0.04] border border-rose-500/10">
                  {(['all', 'active', 'finished'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className="relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors capitalize text-slate-400 hover:text-rose-200"
                    >
                      {filter === tab && (
                        <motion.div
                          layoutId="activeFilterTab"
                          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                        />
                      )}
                      <span className={`relative z-10 ${filter === tab ? 'text-white' : ''}`}>
                        {tab === 'all'
                          ? 'Всі'
                          : tab === 'active'
                          ? 'Активні'
                          : 'Завершені'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

             
              <div className="flex flex-col md:flex-row items-center gap-3 mb-8">
               
                <div className="relative flex-1 w-full">
                  
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300/70 pointer-events-none z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Пошук лоту за назвою чи описом..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#160B12]/80 border border-rose-500/20 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 backdrop-blur-md transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center text-xs transition-colors z-10 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Селектор сортування */}
                <div className="relative w-full md:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full md:w-auto bg-[#160B12]/80 border border-rose-500/20 rounded-2xl px-4 py-3 text-sm text-rose-200/90 focus:outline-none focus:border-rose-500/50 backdrop-blur-md cursor-pointer transition-all [color-scheme:dark]"
                  >
                    <option value="newest">🕒 Найновіші</option>
                    <option value="endingSoon">🔥 Закінчуються найшвидше</option>
                    <option value="priceLow">📉 Ціна: від найнижчої</option>
                    <option value="priceHigh">📈 Ціна: від найвищої</option>
                    <option value="mostBids">⚡ Найпопулярніші</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-96 rounded-3xl bg-[#160B12]/50 border border-rose-500/10 animate-pulse"
                    />
                  ))}
                </div>
              ) : processedAuctions.length === 0 ? (
                <div className="text-center py-24 rounded-3xl bg-[#160B12]/40 border border-rose-500/10">
                  <span className="text-4xl block mb-3">🔍</span>
                  <h3 className="text-base font-bold text-white mb-1">
                    Нічого не знайдено
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    За вашим запитом лотів не знайдено. Спробуйте змінити пошук або фільтри.
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/20 transition-all"
                    >
                      Очистити пошук
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {processedAuctions.map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        auction={auction}
                        onPlaceBid={handlePlaceBid}
                        onSelect={() => setSelectedAuctionId(auction.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CreateAuctionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAuction}
      />
    </div>
  );
}

export default App;
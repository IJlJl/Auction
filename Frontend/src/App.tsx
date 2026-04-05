import "./index.css";
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

interface Bid {
  id: string;
  amount: number;
  bidder?: {
    nickname: string;
  };
}

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: string;
  currentPrice: string;
  endsAt: string;
  status?: string; 
  creatorId: string;
  imageUrl?: string;
  bids?: Bid[]; 
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft("ЗАВЕРШЕНО");
        return false;
      }
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const minutes = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
      return true;
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
      timeLeft === "ЗАВЕРШЕНО" ? "bg-red-50 text-red-500 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
    }`}>
      {timeLeft}
    </div>
  );
}

function App() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', startPrice: 0, endsAt: '' });
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [view, setView] = useState<'home' | 'profile'>('home');

  const fetchAuctions = async () => {
    try {
      const response = await fetch('http://localhost:3000/auctions');
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("Error loading auctions:", error);
    }
  };

  useEffect(() => {
    fetchAuctions(); 
    socket.on("priceUpdated", () => fetchAuctions()); 
    socket.on("auctionFinished", (data) => {
      setAuctions(prev => prev.map(auc => auc.id === data.auctionId ? { ...auc, status: 'finished' } : auc));
    });
    return () => { socket.off("priceUpdated"); socket.off("auctionFinished"); };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    });
    if (res.ok) {
      alert('Успіх! Тепер увійдіть.');
      setIsRegisterMode(false);
    } else {
      const err = await res.json();
      alert(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setCurrentUser(data.user);
    } else {
      alert('Помилка входу');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setCurrentUser(null);
    setView('home');
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('startPrice', formData.startPrice.toString());
    data.append('endsAt', formData.endsAt);
    const fileInput = (e.target as any).elements.image;
    if (fileInput.files[0]) data.append('image', fileInput.files[0]);

    const res = await fetch('http://localhost:3000/auctions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: data,
    });
    if (res.ok) {
      setIsFormOpen(false);
      fetchAuctions();
    }
  };

  const handlePlaceBid = async (auctionId: string, customAmount?: number) => {
    if (!token) return alert("Будь ласка, увійдіть!");
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;
    const current = parseFloat(auction.currentPrice) > 0 ? parseFloat(auction.currentPrice) : parseFloat(auction.startPrice);
    const amountToSend = customAmount || (current + 10);

    const res = await fetch('http://localhost:3000/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ auctionId, amount: amountToSend }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message);
    } else {
      setBidAmounts(prev => ({ ...prev, [auctionId]: 0 }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-slate-900 font-sans">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12 bg-white/80 backdrop-blur-md p-4 px-8 rounded-[2rem] shadow-sm border border-white sticky top-4 z-50">
        <h1 onClick={() => setView('home')} className="text-2xl font-black cursor-pointer tracking-tighter uppercase">
          Auction<span className="text-blue-600">.</span>
        </h1>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <button onClick={() => setView('profile')} className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition-all bg-slate-50 p-2 px-4 rounded-xl italic">
                👤 {currentUser?.nickname}
              </button>
              <button onClick={handleLogout} className="text-sm font-bold text-red-400">Вийти</button>
              <button onClick={() => {setView('home'); setIsFormOpen(true)}} className="bg-slate-900 text-white font-bold py-2 px-5 rounded-xl shadow-lg hover:bg-black transition-all">＋ Лот</button>
            </>
          ) : (
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest italic">Live Platform</span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {!token ? (
          <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-50">
            <h2 className="text-3xl font-black mb-2 text-center text-slate-800 italic">{isRegisterMode ? "Створити акаунт" : "З поверненням!"}</h2>
            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
              {isRegisterMode && <input type="text" placeholder="Ваш нікнейм" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNickname(e.target.value)} />}
              <input type="email" placeholder="Email" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Пароль" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all">{isRegisterMode ? "Зареєструватися" : "Увійти"}</button>
            </form>
            <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="w-full mt-6 text-sm text-slate-400">{isRegisterMode ? "Вже є акаунт? Увійти" : "Ще немає акаунту? Створити"}</button>
          </div>
        ) : (
          view === 'profile' ? (
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <h2 className="text-4xl font-black mb-2 text-slate-800 italic">Особистий кабінет</h2>
              <p className="text-blue-600 font-bold text-lg mb-8">@{currentUser?.nickname}</p>
              <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-slate-300">Ваші лоти</h3>
              <div className="space-y-3">
                {auctions.filter(a => a.creatorId === currentUser?.id).map(auction => (
                   <div key={auction.id} className="p-5 border border-slate-100 rounded-2xl bg-white flex justify-between items-center shadow-sm">
                     <p className="font-bold text-slate-800">{auction.title}</p>
                     <b className="text-blue-600 text-xl">${auction.currentPrice || auction.startPrice}</b>
                   </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative">
                    <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-slate-400 text-2xl">×</button>
                    <h2 className="text-2xl font-black mb-6 italic">Новий аукціон</h2>
                    <form onSubmit={handleCreateAuction} className="space-y-4">
                      <input type="text" placeholder="Назва" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, title: e.target.value})}/>
                      <textarea placeholder="Опис" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none h-32" onChange={e => setFormData({...formData, description: e.target.value})}/>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Ціна ($)" required className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, startPrice: Number(e.target.value)})}/>
                        <input type="datetime-local" required className="p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, endsAt: new Date(e.target.value).toISOString()})}/>
                      </div>
                      <input type="file" name="image" accept="image/*" className="w-full p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" />
                      <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700">Опублікувати</button>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {auctions.map((auction) => (
                  <div key={auction.id} className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
                    <div className="h-56 bg-slate-100 relative overflow-hidden">
                      {auction.imageUrl ? (
                        <img src={`http://localhost:3000${auction.imageUrl}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300 italic text-sm font-black uppercase tracking-widest">No Image</div>
                      )}
                      <div className="absolute top-4 left-4"><CountdownTimer targetDate={auction.endsAt} /></div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                      <h2 className="text-2xl font-black mb-2 text-slate-800 italic uppercase">{auction.title}</h2>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">{auction.description}</p>
                      
                      <div className="bg-slate-50 p-6 rounded-[2rem] mb-6">
                        <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Current Bid</span>
                        <p className="text-4xl font-black text-slate-900 mt-1"><span className="text-blue-600 font-medium text-2xl mr-1">$</span>{parseFloat(auction.currentPrice) > 0 ? auction.currentPrice : auction.startPrice}</p>
                      </div>

                      <div className="mb-6 space-y-2 border-t border-slate-50 pt-4">
                        <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-3">Bid History</p>
                        {auction.bids && auction.bids.length > 0 ? auction.bids.slice(0, 3).map(bid => (
                          <div key={bid.id} className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-400 italic">@{bid.bidder?.nickname || 'Anonymous'}</span>
                            <span className="text-blue-500">${bid.amount}</span>
                          </div>
                        )) : <p className="text-[10px] text-slate-300 italic">No bids yet</p>}
                      </div>

                      {auction.status === 'finished' ? (
                        <div className="bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-center border border-dashed border-slate-200 tracking-widest text-xs uppercase italic">Auction Closed 🏁</div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            <input type="number" placeholder="Your price" value={bidAmounts[auction.id] || ''} onChange={(e) => setBidAmounts({...bidAmounts, [auction.id]: Number(e.target.value)})} className="flex-1 bg-transparent p-3 outline-none font-bold text-slate-700" />
                            <button onClick={() => handlePlaceBid(auction.id, bidAmounts[auction.id])} className="bg-white text-blue-600 shadow-sm px-6 rounded-xl font-black hover:bg-blue-600 hover:text-white transition-all">OK</button>
                          </div>
                          <button onClick={() => handlePlaceBid(auction.id)} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 italic">Quick Bid (+$10)</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </main>
    </div>
  )
}

export default App;
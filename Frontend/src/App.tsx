import "./index.css";
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: string;
  currentPrice: string;
  endsAt: string;
  status?: string; 
}

function CountdownTimer({ targetDate, onEnd }: { targetDate: string, onEnd?: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft("ЗАВЕРШЕНО");
        if (onEnd) onEnd();
        return false;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      
      const h = hours.toString().padStart(2, '0');
      const m = minutes.toString().padStart(2, '0');
      const s = seconds.toString().padStart(2, '0');

      setTimeLeft(`${h}:${m}:${s}`);
      return true;
    };

    calculateTime(); 
    const interval = setInterval(() => {
      const isActive = calculateTime();
      if (!isActive) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`font-mono font-bold ${timeLeft === "ЗАВЕРШЕНО" ? "text-red-500" : "text-orange-500"}`}>
      {timeLeft !== "ЗАВЕРШЕНО" && <span className="text-xs mr-1">Кінчається через:</span>}
      {timeLeft}
    </div>
  );
}

function App() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '',
    description: '',
    startPrice: 0, 
    endsAt: '',
  }); 

 
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});

  const fetchAuctions = async () => {
    try {
      const response = await fetch('http://localhost:3000/auctions');
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("Помилка при завантаженні:", error);
    }
  };

  useEffect(() => {
    fetchAuctions(); 

    socket.on("connect", () => {
      console.log("З'єднання з сокетом встановлено! ID:", socket.id);
    });

    socket.on("priceUpdated", (data: { auctionId: string, newPrice: number }) => {
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === data.auctionId ? { ...auc, currentPrice: data.newPrice.toString() } : auc
        )
      );
    });

    socket.on("auctionFinished", (data: { auctionId: string }) => {
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === data.auctionId ? { ...auc, status: 'finished' } : auc
        )
      );
    });

    return () => {
      socket.off("connect");
      socket.off("priceUpdated");
      socket.off("auctionFinished");
    };
  }, []);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ title: '', description: '', startPrice: 0, endsAt: '' });
        setIsFormOpen(false);
        fetchAuctions();
      }
    } catch (error) {
      console.error("Помилка створення:", error);
    }
  };

  const handlePlaceBid = async (auctionId: string, customAmount?: number) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

  
    const current = parseFloat(auction.currentPrice) > 0 ? parseFloat(auction.currentPrice) : parseFloat(auction.startPrice);
    const amountToSend = customAmount && customAmount > 0 ? customAmount : (current + 10);

    try {
      const response = await fetch('http://localhost:3000/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, amount: amountToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Помилка: ${errorData.message}`);
      } else {
        
        setBidAmounts(prev => ({ ...prev, [auctionId]: 0 }));
      }
    } catch (error) {
      console.error("Помилка ставки:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">
              <span className="text-blue-500">Auction</span>
        </h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all"
        >
          {isFormOpen ? 'Скасувати' : '＋ Створити лот'}
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        {isFormOpen && (
          <div className="mb-12 bg-white p-8 rounded-3xl shadow-xl border border-gray-200 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Новий аукціон</h2>
            <form onSubmit={handleCreateAuction} className="space-y-4">
              <input
                type="text" placeholder="Назва лота" required
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <textarea
                placeholder="Опис лота" required
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number" placeholder="Стартова ціна ($)" required
                  className="p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setFormData({...formData, startPrice: Number(e.target.value)})}
                />
                <input
                  type="datetime-local" required
                  className="p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setFormData({...formData, endsAt: new Date(e.target.value).toISOString()})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                Опублікувати лот
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
                     
            <div key={auction.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                     <h2 className="text-2xl font-bold text-gray-800">{auction.title}</h2>
                     <CountdownTimer targetDate={auction.endsAt} />
                    </div>
  
  <p className="text-gray-600 line-clamp-2 mb-4">{auction.description}</p>
                <p className="text-gray-600 line-clamp-2 mb-4">{auction.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Стартова ціна:</span>
                    <span className="font-semibold">${auction.startPrice}</span>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Поточна ставка</p>
                    <p className="text-3xl font-black text-blue-700">
                      ${parseFloat(auction.currentPrice) > 0 ? auction.currentPrice : auction.startPrice}
                    </p>
                  </div>
                </div>

                {auction.status === 'finished' ? (
                  <div className="w-full mt-6 bg-red-100 text-red-600 font-bold py-3 rounded-xl text-center border border-red-200">
                    Аукціон завершено 🏁
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {/* ПОЛЕ ДЛЯ ВЛАСНОЇ СУМИ */}
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Ваша сума"
                        value={bidAmounts[auction.id] || ''}
                        onChange={(e) => setBidAmounts({
                          ...bidAmounts, 
                          [auction.id]: Number(e.target.value)
                        })}
                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <button 
                        onClick={() => handlePlaceBid(auction.id, bidAmounts[auction.id])}
                        className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                      >
                        OK
                      </button>
                    </div>

                    {/* КНОПКА ШВИДКОЇ СТАВКИ */}
                    <button 
                      onClick={() => handlePlaceBid(auction.id)}
                      className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Швидка ставка (+10$)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {auctions.length === 0 && (
        <div className="text-center py-20 text-2xl text-gray-400 italic">
          Наразі немає активних аукціонів...
        </div>
      )}
    </div>
  )
}

export default App;
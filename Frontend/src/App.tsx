import "./index.css";
import { useEffect, useState } from 'react'

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: string;
  currentPrice: string;
  endsAt: string;
}

function App() {
  const [auctions, setAuctions] = useState<Auction[]>([]);

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
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">
          <span className="text-blue-500">Auction</span>
        </h1>
        <button 
          onClick={fetchAuctions}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Оновити дані
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {auctions.map((auction) => (
          <div key={auction.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{auction.title}</h2>
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

              <button className="w-full mt-6 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors">
                Зробити ставку
              </button>
            </div>
          </div>
        ))}
      </main>

      {auctions.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400 italic">Наразі немає активних аукціонів...</p>
        </div>
      )}
    </div>
  )
}

export default App
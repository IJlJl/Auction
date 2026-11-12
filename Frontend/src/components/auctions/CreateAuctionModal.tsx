import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const endsAtValue = formData.get('endsAt') as string;
      if (endsAtValue) {
        formData.set('endsAt', new Date(endsAtValue).toISOString());
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Помилка при створенні лоту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-lg rounded-3xl bg-[#160B12] border border-rose-500/25 p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 Створити новий лот
              </h2>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors"
              >
                ✕
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-2">
                  Зображення товару
                </label>
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileChange(e.dataTransfer.files[0]);
                  }}
                  className={`relative flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                    dragOver
                      ? 'border-rose-500 bg-rose-500/10'
                      : 'border-rose-500/20 bg-white/[0.02] hover:border-rose-500/40 hover:bg-white/[0.04]'
                  }`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Прев'ю"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-3xl block mb-2">📷</span>
                      <p className="text-xs text-rose-200/70">
                        Перетягніть фото сюди або <b className="text-rose-400">натисніть</b>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">PNG, JPG до 5 MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                </label>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
                  Назва лоту
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Введіть назву лоту"
                  className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
                  Опис
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Опишіть стан, комплектацію та деталі товару..."
                  className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
                    Старт ($)
                  </label>
                  <input
                    type="number"
                    name="startPrice"
                    min="1"
                    required
                    placeholder="100"
                    className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-rose-200/60 font-semibold block mb-1.5">
                    Кінець торгів
                  </label>
                  <input
                    type="datetime-local"
                     name="endsAt"
                     required
                     className="w-full bg-white/5 border border-rose-500/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 [color-scheme:dark] accent-rose-500 cursor-pointer"
                    />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Публікуємо лот...
                  </>
                ) : (
                  'Опублікувати на аукціон'
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
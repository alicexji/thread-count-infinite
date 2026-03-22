import React from 'react';
import { Outfit } from '../types';
import { Trash2, Share2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface OutfitsGalleryProps {
  outfits: Outfit[];
  onDelete: (id: string) => void;
}

export default function OutfitsGallery({ outfits, onDelete }: OutfitsGalleryProps) {
  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-32">
        <div className="mb-32 relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/30 rounded-full -z-10 blur-[100px]" 
          />
          <h1 className="text-7xl md:text-9xl font-display text-ink leading-none tracking-tight font-light">
            THE <br />
            <span className="font-serif italic text-ink/80">EDITORIAL</span>
          </h1>
          <p className="handwritten-text text-4xl md:text-6xl text-ink/30 mt-8 -rotate-2">A curated style diary</p>
        </div>

        {outfits.length === 0 ? (
          <div className="py-48 text-center border border-ink/5 bg-white/50 backdrop-blur-sm">
            <p className="text-ink font-serif italic text-4xl">No looks archived yet</p>
            <p className="handwritten-text text-2xl text-ink/30 mt-6">Visit the Atelier to create your first editorial</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            {outfits.map((outfit, idx) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[4/5] bg-white border border-ink/5 overflow-hidden vogue-card shadow-sm">
                  <img 
                    src={outfit.previewImage} 
                    alt={outfit.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6 p-12 backdrop-blur-[2px]">
                    <h3 className="text-white font-serif italic text-4xl text-center leading-tight">
                      {outfit.name}
                    </h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => onDelete(outfit.id)}
                        className="px-8 py-3 bg-white text-ink text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-white transition-all"
                      >
                        DELETE
                      </button>
                      <button className="px-8 py-3 bg-transparent text-white border border-white/30 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all">
                        SHARE
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex justify-between items-start px-2">
                  <div>
                    <h3 className="font-serif italic text-2xl text-ink">{outfit.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/30 mt-2">
                      {outfit.items.length} CURATED PIECES
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-ink/20 font-bold uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(outfit.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

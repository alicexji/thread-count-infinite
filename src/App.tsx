import React, { useState, useEffect } from 'react';
import { ClothingItem, Outfit } from './types';
import Closet from './components/Closet';
import OutfitBuilder from './components/OutfitBuilder';
import OutfitsGallery from './components/OutfitsGallery';
import Upload from './components/Upload';
import { Plus, LayoutGrid, Shirt, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PLACEHOLDER_ITEMS: ClothingItem[] = [
  {
    id: 'p1',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    category: 'tops',
    tags: ['casual', 'white'],
    color: 'white',
    style: 'minimalist',
    createdAt: Date.now() - 10000,
  },
  {
    id: 'p2',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    category: 'tops',
    tags: ['essential', 'black'],
    color: 'black',
    style: 'minimalist',
    createdAt: Date.now() - 20000,
  },
  {
    id: 'p3',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
    category: 'bottoms',
    tags: ['denim', 'blue'],
    color: 'blue',
    style: 'streetwear',
    createdAt: Date.now() - 30000,
  },
  {
    id: 'p4',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    category: 'bottoms',
    tags: ['formal', 'black'],
    color: 'black',
    style: 'formal',
    createdAt: Date.now() - 40000,
  },
  {
    id: 'p5',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    category: 'dresses',
    tags: ['summer', 'yellow'],
    color: 'yellow',
    style: 'bohemian',
    createdAt: Date.now() - 50000,
  },
  {
    id: 'p6',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800',
    category: 'outerwear',
    tags: ['jacket', 'denim'],
    color: 'blue',
    style: 'streetwear',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'p7',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    category: 'shoes',
    tags: ['sneakers', 'red'],
    color: 'red',
    style: 'streetwear',
    createdAt: Date.now() - 70000,
  },
  {
    id: 'p8',
    image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=800',
    category: 'accessories',
    tags: ['sunglasses', 'retro'],
    color: 'black',
    style: 'retro',
    createdAt: Date.now() - 80000,
  }
];

export default function App() {
  const [view, setView] = useState<'closet' | 'builder' | 'outfits'>('closet');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedItemForBuilder, setSelectedItemForBuilder] = useState<ClothingItem | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('vogue_closet_items');
    const savedOutfits = localStorage.getItem('vogue_closet_outfits');
    
    if (savedItems && JSON.parse(savedItems).length > 0) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(PLACEHOLDER_ITEMS);
    }
    
    if (savedOutfits) setOutfits(JSON.parse(savedOutfits));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('vogue_closet_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('vogue_closet_outfits', JSON.stringify(outfits));
  }, [outfits]);

  const handleUploadComplete = (newItem: ClothingItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (updatedItem: ClothingItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleSaveOutfit = (newOutfit: Outfit) => {
    setOutfits(prev => [newOutfit, ...prev]);
    setView('outfits');
  };

  const handleDeleteOutfit = (id: string) => {
    setOutfits(prev => prev.filter(o => o.id !== id));
  };

  const handleStyleItem = (item: ClothingItem) => {
    setSelectedItemForBuilder(item);
    setView('builder');
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-accent selection:text-white noise-overlay">
      {/* Editorial Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 liquid-glass border-b border-ink/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-12">
            <h1 
              className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity leading-none" 
              onClick={() => setView('closet')}
            >
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-ink/50 mb-1">Thread Count</span>
              <span className="font-serif italic text-4xl tracking-tighter text-ink">INFINITE</span>
            </h1>
            
            <div className="hidden md:flex gap-4">
              {[
                { id: 'closet', label: 'Collection', icon: Shirt },
                { id: 'builder', label: 'Atelier', icon: Sparkles },
                { id: 'outfits', label: 'Editorial', icon: LayoutGrid },
              ].map(nav => (
                <button
                  key={nav.id}
                  onClick={() => setView(nav.id as any)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                    view === nav.id ? 'liquid-glass-dark text-white' : 'text-ink/40 hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  {nav.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-ink/20 text-ink text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-ink/5 transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Add Piece</span>
            </button>
            
            <button 
              className="md:hidden p-2 text-ink"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[85px] left-0 right-0 z-40 bg-paper border-b border-ink/5 overflow-hidden"
          >
            <div className="p-8 flex flex-col gap-6">
              {[
                { id: 'closet', label: 'Collection', icon: Shirt },
                { id: 'builder', label: 'Atelier', icon: Sparkles },
                { id: 'outfits', label: 'Editorial', icon: LayoutGrid },
              ].map(nav => (
                <button
                  key={nav.id}
                  onClick={() => { setView(nav.id as any); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-4 text-xs uppercase tracking-[0.2em] font-bold p-4 transition-all ${
                    view === nav.id ? 'text-ink' : 'text-ink/30'
                  }`}
                >
                  <nav.icon size={18} />
                  {nav.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-100px)] pt-[100px]">
        <AnimatePresence mode="wait">
          {view === 'closet' && (
            <motion.div
              key="closet"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative"
            >
              <div className="absolute top-40 left-10 text-[15vw] handwritten-text text-ink/5 pointer-events-none select-none -rotate-12 z-0">
                Archive
              </div>
              <Closet 
                items={items} 
                onDeleteItem={handleDeleteItem} 
                onUpdateItem={handleUpdateItem}
                onStyleItem={handleStyleItem} 
              />
            </motion.div>
          )}
          
          {view === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-[calc(100vh-85px)] relative"
            >
              <div className="absolute bottom-20 left-10 text-[12vw] handwritten-text text-ink/5 pointer-events-none select-none rotate-6 z-0">
                Atelier
              </div>
              <OutfitBuilder 
                items={items} 
                onSave={handleSaveOutfit} 
                initialItem={selectedItemForBuilder} 
                onInitialItemAdded={() => setSelectedItemForBuilder(null)}
              />
            </motion.div>
          )}
          
          {view === 'outfits' && (
            <motion.div
              key="outfits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OutfitsGallery outfits={outfits} onDelete={handleDeleteOutfit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <Upload 
            onUploadComplete={handleUploadComplete} 
            onClose={() => setIsUploadOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-paper border-t border-ink/5 py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-serif italic tracking-tighter text-ink">THREAD COUNT INFINITE</h2>
            <p className="text-ink/30 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">The Archive © 2026</p>
          </div>
          
          <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">
            <a href="#" className="hover:text-ink transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms</a>
            <a href="#" className="hover:text-ink transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

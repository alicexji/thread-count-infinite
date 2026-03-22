import React from 'react';
import { ClothingItem, Category } from '../types';
import { Trash2, Tag, Calendar, Search, Filter, X, Edit2, Info, Save, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClosetProps {
  items: ClothingItem[];
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: ClothingItem) => void;
  onStyleItem: (item: ClothingItem) => void;
}

export default function Closet({ items, onDeleteItem, onUpdateItem, onStyleItem }: ClosetProps) {
  const [filter, setFilter] = React.useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState<string>('all');
  const [selectedStyle, setSelectedStyle] = React.useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  
  const [editingItem, setEditingItem] = React.useState<ClothingItem | null>(null);
  const [viewingItem, setViewingItem] = React.useState<ClothingItem | null>(null);
  
  const categories: (Category | 'all')[] = ['all', 'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];

  const colors = ['all', ...new Set(items.map(i => i.color).filter(Boolean) as string[])];
  const styles = ['all', ...new Set(items.map(i => i.style).filter(Boolean) as string[])];

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesColor = selectedColor === 'all' || item.color === selectedColor;
    const matchesStyle = selectedStyle === 'all' || item.style === selectedStyle;
    const matchesSearch = item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.material?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesColor && matchesStyle && matchesSearch;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem);
      setEditingItem(null);
    }
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero Section */}
      <div className="animate-gradient-shift pt-32 pb-8 px-8 border-b border-ink/5 relative overflow-hidden flex items-center justify-center min-h-[60vh]" style={{ background: 'linear-gradient(-45deg, #e9d5ff, #ffedd5, #dbeafe, #fce7f3)' }}>
        {/* Animated Blurred Organic Shape */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 0.8, 1.2, 1],
            rotate: [0, 15, -15, 10, 0],
            x: [0, 100, -100, 40, 0],
            y: [0, -60, 60, -20, 0],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute w-[1200px] h-[1200px] opacity-60 pointer-events-none"
        >
          {/* Saturated gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/30 via-fuchsia-400/40 to-indigo-400/30 rounded-full blur-[160px]" />
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-yellow-200/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-purple-400/30 rounded-full blur-[140px]" />
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="liquid-glass-pill px-8 py-8 md:px-16 md:py-12 flex flex-col items-center text-center max-w-3xl"
          >
            <h1 className="font-display text-4xl md:text-6xl text-ink font-light tracking-tight mb-3">
              Thread Count Infinite
            </h1>
            <div className="h-px w-24 bg-ink/10 mb-4" />
            <p className="font-serif italic text-xl md:text-2xl text-ink/80 tracking-wide">
              Liquid Glass Archive
            </p>
            <p className="handwritten-text text-3xl md:text-5xl text-ink/40 mt-4 -rotate-2">
              A curated archive of personal style
            </p>
          </motion.div>

          {/* Search and Categories Bar */}
          <div className="mt-32 w-full flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
            <div className="flex flex-wrap justify-center md:justify-start gap-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-all border-b pb-1 ${
                    filter === cat 
                      ? 'border-ink text-ink' 
                      : 'border-transparent text-ink/40 hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full liquid-glass text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${isFilterOpen ? 'bg-ink/10 text-ink border-ink/20' : 'text-ink/40 hover:text-ink border-ink/10'}`}
              >
                <Filter size={14} />
                Filters
              </button>

              <div className="relative flex-1 md:w-72 group liquid-glass rounded-full px-4 border-ink/10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-ink transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="SEARCH ARCHIVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-3 pl-8 text-[10px] uppercase tracking-widest focus:outline-none transition-all placeholder:text-ink/20 text-ink"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 flex flex-wrap gap-12 border-t border-ink/5 mt-8 liquid-glass p-8 rounded-2xl">
                  <div className="space-y-4">
                    <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/30">Color</p>
                    <div className="flex flex-wrap gap-4">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`text-[10px] uppercase tracking-widest transition-colors ${selectedColor === color ? 'text-ink font-bold' : 'text-ink/40 hover:text-ink'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/30">Style</p>
                    <div className="flex flex-wrap gap-4">
                      {styles.map(style => (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(style)}
                          className={`text-[10px] uppercase tracking-widest transition-colors ${selectedStyle === style ? 'text-ink font-bold' : 'text-ink/40 hover:text-ink'}`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-24">
        {filteredItems.length === 0 ? (
          <div className="py-48 text-center border border-ink/5 bg-white/50 backdrop-blur-sm">
            <p className="text-ink font-serif italic text-4xl">No pieces found</p>
            <p className="handwritten-text text-2xl text-ink/40 mt-4">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] bg-white border border-ink/5 overflow-hidden relative vogue-card">
                  <img 
                    src={item.image} 
                    alt="Garment" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button 
                      onClick={() => onStyleItem(item)}
                      className="px-8 py-3 bg-white text-ink text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-white transition-colors w-48"
                    >
                      Style this piece
                    </button>
                    <button 
                      onClick={() => setViewingItem(item)}
                      className="px-8 py-3 bg-white/20 text-white border border-white/30 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/40 transition-all w-48 flex items-center justify-center gap-2"
                    >
                      <Info size={14} />
                      Details
                    </button>
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="px-8 py-3 bg-transparent text-white border border-white/30 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all w-48 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40 mb-1">{item.category}</p>
                    <h3 className="font-serif italic text-xl text-ink">Piece No. {idx + 1}</h3>
                    {item.brand && <p className="text-[10px] text-ink/60 mt-1 uppercase tracking-widest">{item.brand}</p>}
                  </div>
                  <div className="text-[10px] text-ink/20 font-bold">
                    {new Date(item.createdAt).getFullYear()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="liquid-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/20 shadow-2xl rounded-3xl"
            >
              <div className="p-8 flex justify-between items-center border-b border-ink/5 noise-ombre sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-3xl font-serif italic text-ink">Edit Piece</h2>
                  <p className="handwritten-text text-xl text-accent mt-1">Update archive data</p>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-3 hover:bg-white/20 rounded-full transition-colors text-ink/40 hover:text-ink liquid-glass border-white/10">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="aspect-[3/4] bg-white border border-ink/5 overflow-hidden vogue-card rounded-2xl shadow-inner">
                      <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">Category</label>
                      <select 
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value as Category})}
                        className="w-full bg-white/50 border border-ink/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-ink/20 transition-all"
                      >
                        {categories.filter(c => c !== 'all').map(cat => (
                          <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">Brand</label>
                      <input 
                        type="text"
                        value={editingItem.brand || ''}
                        onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})}
                        placeholder="e.g. Prada, Vintage"
                        className="w-full bg-white/50 border border-ink/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-ink/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">Size</label>
                      <input 
                        type="text"
                        value={editingItem.size || ''}
                        onChange={(e) => setEditingItem({...editingItem, size: e.target.value})}
                        placeholder="e.g. M, 38, OS"
                        className="w-full bg-white/50 border border-ink/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-ink/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">Material</label>
                      <input 
                        type="text"
                        value={editingItem.material || ''}
                        onChange={(e) => setEditingItem({...editingItem, material: e.target.value})}
                        placeholder="e.g. Silk, Wool"
                        className="w-full bg-white/50 border border-ink/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-ink/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40">Comments</label>
                  <textarea 
                    value={editingItem.comments || ''}
                    onChange={(e) => setEditingItem({...editingItem, comments: e.target.value})}
                    placeholder="Add your notes about this piece..."
                    rows={4}
                    className="w-full bg-white/50 border border-ink/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-ink/20 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this piece from your archive?')) {
                        onDeleteItem(editingItem.id);
                        setEditingItem(null);
                      }
                    }}
                    className="flex-1 py-4 border border-red-200 text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-red-50 transition-all rounded-xl flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete Piece
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 liquid-glass-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink/80 transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg"
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="liquid-glass w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/20 shadow-2xl rounded-3xl"
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-white border-r border-ink/5 relative overflow-hidden">
                  <img src={viewingItem.image} alt="Garment" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setViewingItem(null)} 
                    className="absolute top-6 left-6 p-3 bg-white/40 backdrop-blur-md text-ink border border-white/20 shadow-sm hover:scale-110 transition-transform rounded-full liquid-glass md:hidden"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="w-full md:w-1/2 p-12 flex flex-col">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink/30 mb-2">Archive Entry</p>
                      <h2 className="text-5xl font-serif italic text-ink leading-tight">Piece No. {items.indexOf(viewingItem) + 1}</h2>
                    </div>
                    <button 
                      onClick={() => setViewingItem(null)} 
                      className="p-3 hover:bg-ink/5 rounded-full transition-colors text-ink/40 hover:text-ink liquid-glass border-ink/5 hidden md:block"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-12 flex-1">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Category</p>
                        <p className="text-xs uppercase tracking-widest font-bold text-ink">{viewingItem.category}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Color</p>
                        <p className="text-xs uppercase tracking-widest font-bold text-ink">{viewingItem.color || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Brand</p>
                        <p className="text-xs uppercase tracking-widest font-bold text-ink">{viewingItem.brand || 'Unbranded'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Size</p>
                        <p className="text-xs uppercase tracking-widest font-bold text-ink">{viewingItem.size || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Material</p>
                        <p className="text-xs uppercase tracking-widest font-bold text-ink">{viewingItem.material || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Style</p>
                        <p className="text-xs uppercase tracking-widest font-bold text-ink">{viewingItem.style || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Curator's Comments</p>
                      <p className="font-serif italic text-lg text-ink/80 leading-relaxed">
                        {viewingItem.comments || "No comments recorded for this piece."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {viewingItem.tags.map(tag => (
                        <span key={tag} className="px-4 py-1.5 bg-ink/5 text-[8px] uppercase tracking-[0.2em] font-bold text-ink/40 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-ink/5 flex justify-between items-center">
                    <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-ink/20">Archived {new Date(viewingItem.createdAt).toLocaleDateString()}</p>
                    <button 
                      onClick={() => {
                        setViewingItem(null);
                        onStyleItem(viewingItem);
                      }}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-ink hover:text-accent transition-colors"
                    >
                      Send to Atelier
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

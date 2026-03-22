import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { ClothingItem, OutfitItem, Outfit } from '../types';
import { Save, Trash2, Layers, Maximize2, RotateCcw, Plus, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GoogleGenAI, Type } from "@google/genai";

interface OutfitBuilderProps {
  items: ClothingItem[];
  onSave: (outfit: Outfit) => void;
  initialItem?: ClothingItem | null;
  onInitialItemAdded?: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const URLImage = ({ item, isSelected, onSelect, onChange }: { 
  item: OutfitItem & { src: string }, 
  isSelected: boolean, 
  onSelect: () => void,
  onChange: (newAttrs: any) => void 
}) => {
  const [img] = useImage(item.src);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        x={item.x}
        y={item.y}
        scaleX={item.scale}
        scaleY={item.scale}
        rotation={item.rotation}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            scale: scaleX,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorSize={6}
          anchorCornerRadius={3}
          borderStroke="#1A1A1A"
          anchorStroke="#1A1A1A"
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function OutfitBuilder({ items, onSave, initialItem, onInitialItemAdded }: OutfitBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<(OutfitItem & { src: string })[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('tops');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const processedInitialItemRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialItem && processedInitialItemRef.current !== initialItem.id) {
      processedInitialItemRef.current = initialItem.id;
      addItemToCanvas(initialItem);
      onInitialItemAdded?.();
    }
  }, [initialItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if we're not typing in an input (though there aren't many here)
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          removeItem();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedItems]);

  const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];

  const addItemToCanvas = (item: ClothingItem, index?: number) => {
    const offset = index !== undefined ? index : selectedItems.length;
    
    // Create a more spread out, mood-board style placement
    // We'll use a larger area and more variety in initial positions
    // Canvas is 360x480
    const positions = [
      { x: 40, y: 40 },   // Top Left
      { x: 200, y: 60 },  // Top Right
      { x: 100, y: 180 }, // Center
      { x: 40, y: 300 },  // Bottom Left
      { x: 200, y: 320 }, // Bottom Right
      { x: 120, y: 40 },  // Top Center
      { x: 40, y: 160 },  // Middle Left
      { x: 220, y: 180 }, // Middle Right
    ];

    const pos = positions[offset % positions.length];
    
    const newItem: OutfitItem & { src: string } = {
      itemId: item.id,
      src: item.image,
      x: pos.x + (Math.random() * 20 - 10),
      y: pos.y + (Math.random() * 20 - 10),
      scale: 0.18,
      rotation: 0,
      zIndex: selectedItems.length,
    };
    setSelectedItems(prev => [...prev, newItem]);
    setSelectedId(selectedItems.length);
  };

  const suggestOutfit = async (specificItemId?: string) => {
    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const itemsDescription = items.map(i => `- ${i.category}: ${i.tags.join(', ')} (ID: ${i.id})`).join('\n');
      
      let prompt = "";
      if (specificItemId) {
        const item = items.find(i => i.id === specificItemId);
        prompt = `You are a fashion stylist for a high-end editorial magazine. 
        I have a collection of clothes:
        ${itemsDescription}

        I want to style a look around this specific piece:
        - ${item?.category}: ${item?.tags.join(', ')}
        
        Suggest 2-3 other items from my collection that would perfectly pair with this and explain the editorial vision.`;
      } else if (selectedItems.length > 0) {
        const currentItems = selectedItems.map(i => {
          const fullItem = items.find(fi => fi.id === i.itemId);
          return `- ${fullItem?.category}: ${fullItem?.tags.join(', ')}`;
        }).join('\n');
        
        prompt = `You are a fashion stylist for a high-end editorial magazine. 
        I have a collection of clothes:
        ${itemsDescription}

        Currently on my styling board I have:
        ${currentItems}
        Suggest 1-2 items from my collection that would perfectly complete this look and explain why.`;
      } else {
        prompt = `You are a fashion stylist for a high-end editorial magazine. 
        I have a collection of clothes:
        ${itemsDescription}

        Suggest a complete, stylish outfit from my collection (3-4 items) and explain the vibe.`;
      }
      
      prompt += `
      Return your response in JSON format:
      {
        "explanation": "A sophisticated editorial explanation of the style",
        "suggestedItemIds": ["id1", "id2"]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              suggestedItemIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["explanation", "suggestedItemIds"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setSuggestion(result.explanation);
      
      // Auto-add suggested items
      const newItemsToAdd = items.filter(i => result.suggestedItemIds.includes(i.id));
      newItemsToAdd.forEach((item, idx) => {
        if (!selectedItems.find(si => si.itemId === item.id)) {
          addItemToCanvas(item, selectedItems.length + idx);
        }
      });

    } catch (error) {
      console.error('AI Suggestion Error:', error);
      setSuggestion("The stylist is currently unavailable. Please try again later.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSave = () => {
    if (selectedItems.length === 0) return;
    
    const uri = stageRef.current.toDataURL();
    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      name: `Editorial No. ${Math.floor(Math.random() * 1000)}`,
      items: selectedItems.map(({ src, ...rest }) => rest),
      previewImage: uri,
      tags: [],
      createdAt: Date.now(),
    };
    
    onSave(newOutfit);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1A1A1A', '#8B4513', '#F5F5F0']
    });
    setSelectedItems([]);
  };

  const removeItem = () => {
    if (selectedId === null) return;
    const newItems = selectedItems.filter((_, i) => i !== selectedId);
    setSelectedItems(newItems);
    setSelectedId(null);
  };

  const bringToFront = () => {
    if (selectedId === null) return;
    const item = selectedItems[selectedId];
    const newItems = selectedItems.filter((_, i) => i !== selectedId);
    setSelectedItems([...newItems, item]);
    setSelectedId(newItems.length);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-paper overflow-hidden">
      {/* Sidebar - Atelier Library */}
      <div className="w-full lg:w-96 bg-white/50 backdrop-blur-xl border-r border-ink/5 flex flex-col h-1/2 lg:h-full">
        <div className="p-8 pt-12 border-b border-ink/5 noise-ombre">
          <div className="flex overflow-x-auto no-scrollbar gap-6 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-b pb-1 whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'border-ink text-ink' 
                    : 'border-transparent text-ink/30 hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-12 no-scrollbar">
          {items.filter(i => i.category === activeCategory).map(item => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addItemToCanvas(item)}
              className="aspect-[3/4] bg-white border border-ink/5 cursor-pointer group relative overflow-hidden vogue-card rounded-lg shadow-sm w-full"
            >
              <div className="w-full h-full flex items-center justify-center p-2">
                <img src={item.image} alt="Clothing" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <Plus className="text-white" size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col h-1/2 lg:h-full bg-paper">
        <div className="absolute top-10 left-10 z-10 flex flex-col gap-6">
          <AnimatePresence>
            {suggestion && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md bg-white/80 backdrop-blur-md p-6 border border-ink/5 shadow-xl"
              >
                <p className="font-serif italic text-lg text-ink leading-relaxed">"{suggestion}"</p>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setSuggestion(null)}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40 hover:text-ink"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-10 right-10 z-10 flex flex-col gap-4">
          {selectedId !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4"
            >
              <button 
                onClick={() => suggestOutfit(selectedItems[selectedId].itemId)}
                className="p-4 bg-white text-ink border border-ink/10 hover:bg-paper transition-all shadow-xl group relative"
                title="Find Pairings"
              >
                <Sparkles size={18} className="group-hover:text-accent transition-colors" />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-ink text-white text-[8px] uppercase tracking-widest px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Find Pairings
                </span>
              </button>
              <button 
                onClick={bringToFront}
                className="p-4 bg-white text-ink border border-ink/10 hover:bg-paper transition-all shadow-xl"
                title="Bring to Front"
              >
                <Layers size={18} />
              </button>
              <button 
                onClick={removeItem}
                className="p-4 bg-white text-accent border border-ink/10 hover:bg-paper transition-all shadow-xl"
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto no-scrollbar">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 pt-24 pb-12">
            <div className="bg-white border border-ink/5 shadow-[0_40px_80px_rgba(0,0,0,0.08)] relative overflow-hidden" style={{ width: '360px', height: '480px' }}>
              <Stage
                width={360}
                height={480}
                ref={stageRef}
                onMouseDown={(e) => {
                  const clickedOnEmpty = e.target === e.target.getStage();
                  if (clickedOnEmpty) {
                    setSelectedId(null);
                  }
                }}
              >
                <Layer>
                  {selectedItems.map((item, i) => (
                    <URLImage
                      key={i}
                      item={item}
                      isSelected={i === selectedId}
                      onSelect={() => setSelectedId(i)}
                      onChange={(newAttrs) => {
                        const items = selectedItems.slice();
                        items[i] = newAttrs;
                        setSelectedItems(items);
                      }}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>

            {/* Action Buttons Stacked on the Right */}
            <div className="flex flex-col gap-4 w-full lg:w-48">
              <button 
                onClick={() => suggestOutfit()}
                disabled={isSuggesting}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 liquid-glass text-ink text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/40 transition-all disabled:opacity-50 rounded-xl shadow-lg"
              >
                {isSuggesting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                AI Stylist
              </button>
              
              <button 
                onClick={handleSave}
                disabled={selectedItems.length === 0}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 liquid-glass-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink/80 transition-all disabled:opacity-20 disabled:cursor-not-allowed rounded-xl shadow-lg"
              >
                <Save size={16} />
                Archive Look
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

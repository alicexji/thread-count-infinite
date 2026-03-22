import React, { useState, useRef, useCallback } from 'react';
import { Upload as UploadIcon, X, Loader2, Check, Sparkles, Wand2, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import { analyzeClothingItem, cleanGarmentImage } from '../services/gemini';
import { removeBackground } from '../services/backgroundRemoval';
import { ClothingItem, Category } from '../types';

interface UploadProps {
  onUploadComplete: (item: ClothingItem) => void;
  onClose: () => void;
}

export default function Upload({ onUploadComplete, onClose }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'crop' | 'processing' | 'done'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setStep('crop');
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return imageSrc;

    // Standardize to 600x800 for consistent UI
    canvas.width = 600;
    canvas.height = 800;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      600,
      800
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const [processingStatus, setProcessingStatus] = useState<string>('Analyzing Piece');

  const processImage = async () => {
    if (!preview || !croppedAreaPixels) return;
    setIsProcessing(true);
    setStep('processing');

    try {
      setProcessingStatus('Cropping...');
      const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
      
      setProcessingStatus('Analyzing Piece...');
      const analysis = await analyzeClothingItem(croppedImage);
      
      setProcessingStatus('Isolating Garment...');
      // Step 1: Use Gemini to remove person/mannequin and place on solid white
      const cleanedImage = await cleanGarmentImage(croppedImage, analysis.category);
      
      setProcessingStatus('Removing Background...');
      // Step 2: Use client-side library to remove the solid background for true transparency
      const processedImage = await removeBackground(cleanedImage);

      const newItem: ClothingItem = {
        id: crypto.randomUUID(),
        image: processedImage,
        category: (analysis.category as Category) || 'tops',
        color: analysis.color,
        style: analysis.style,
        brand: analysis.brand,
        material: analysis.material,
        tags: analysis.tags,
        createdAt: Date.now(),
      };

      onUploadComplete(newItem);
      setStep('done');
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error("Processing failed:", error);
      setIsProcessing(false);
      setStep('upload');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="liquid-glass w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar border border-white/20 shadow-2xl rounded-3xl"
      >
        <div className="p-8 flex justify-between items-center border-b border-ink/5 noise-ombre sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-3xl font-serif italic text-ink">Add to Archive</h2>
            <p className="handwritten-text text-xl text-accent mt-1">Curate your collection</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition-colors text-ink/40 hover:text-ink liquid-glass border-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-ink/10 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-ink/30 hover:bg-white/30 transition-all bg-white/10 group liquid-glass"
                >
                  <div className="bg-white/80 p-6 rounded-full border border-ink/5 shadow-sm group-hover:scale-110 transition-transform mb-6 liquid-glass">
                    <UploadIcon size={32} className="text-ink/40" />
                  </div>
                  <p className="text-ink/60 font-serif italic text-xl">Select a garment</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/20 mt-4">or drag and drop</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </motion.div>
            )}

            {step === 'crop' && preview && (
              <motion.div 
                key="crop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-ink/5">
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={3 / 4}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Zoom</span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-ink"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep('upload')}
                      className="flex-1 py-4 border border-ink/10 rounded-xl text-[10px] uppercase tracking-widest font-bold text-ink/60 hover:bg-ink/5 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={processImage}
                      className="flex-[2] py-4 liquid-glass-dark text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink/80 transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg"
                    >
                      <Scissors size={16} />
                      Crop & Analyze
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 space-y-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-20 h-20 border-2 border-ink/5 border-t-accent rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={24} className="text-accent animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif italic text-ink">{processingStatus}</h3>
                  <p className="handwritten-text text-xl text-accent mt-2">The AI stylist is reviewing...</p>
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div 
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 space-y-6"
              >
                <div className="w-20 h-20 bg-paper text-accent rounded-full border border-ink/5 flex items-center justify-center shadow-sm">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-serif italic text-ink">Archived</h3>
                <p className="handwritten-text text-xl text-accent">Added to your collection</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

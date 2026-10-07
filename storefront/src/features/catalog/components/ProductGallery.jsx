import React, { useState } from 'react';
import { ZoomIn, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProductGallery({ images = [], productName = 'Product', discountPercent = 0, gstRate = 18 }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Fallback image if images array is empty
  const displayImages =
    images.length > 0
      ? images
      : [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        ];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image Container */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
        <img
          src={currentImage}
          alt={`${productName} view ${selectedIndex + 1}`}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <Badge variant="destructive" className="shadow-md">
              {discountPercent}% OFF
            </Badge>
          )}
          <Badge variant="secondary" className="bg-slate-950/80 backdrop-blur-md text-slate-300 border-slate-700">
            GST {gstRate}%
          </Badge>
        </div>

        {/* Zoom In Button */}
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            onClick={() => setIsZoomOpen(true)}
            className="rounded-full bg-slate-950/80 backdrop-blur-md hover:bg-indigo-600 text-white shadow-lg"
            aria-label="Zoom image"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                selectedIndex === idx
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                  : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 p-2 sm:p-4 overflow-hidden">
          <DialogHeader className="p-2">
            <DialogTitle className="text-sm font-semibold text-white">
              {productName} (High Resolution Preview)
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900">
            <img
              src={currentImage}
              alt={productName}
              className="h-full w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

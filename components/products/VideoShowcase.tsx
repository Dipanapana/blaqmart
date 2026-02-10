'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoShowcaseProps {
  videoId: string;
  title?: string;
  posterUrl?: string;
}

export default function VideoShowcase({ videoId, title, posterUrl }: VideoShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
    >
      {title && (
        <h3 className="text-xl font-bold text-white mb-4 text-center">{title}</h3>
      )}

      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title || 'Product video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full group cursor-pointer"
          >
            {/* Poster / Thumbnail */}
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title || 'Video thumbnail'}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={title || 'Video thumbnail'}
                className="w-full h-full object-cover"
              />
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 bg-blue-600/90 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-blue-500/90 transition-colors"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </motion.div>
            </div>

            {/* "Watch Demo" text */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                Watch Product Demo
              </span>
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
}

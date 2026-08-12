import React, { useState, useEffect } from 'react';
import { Advertisement, AdPlacement } from '../types';
import { useApp } from '../context/AppContext';
import { Megaphone, ExternalLink, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const { lang, user } = useApp();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/ads?placement=${placement}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.ads && Array.isArray(data.ads)) {
            setAds(data.ads);
          }
        }
      } catch (err) {
        console.error('Failed to load ads:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAds();
    return () => { isMounted = false; };
  }, [placement]);

  // Track impression for currently visible ad
  useEffect(() => {
    if (ads.length > 0 && ads[currentIndex]) {
      const activeAd = ads[currentIndex];
      if (!dismissedAds.includes(activeAd.id)) {
        fetch(`/api/ads/${activeAd.id}/impression`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || ''
          }
        }).catch(() => {});
      }
    }
  }, [ads, currentIndex, user]);

  // Auto rotation if multiple ads exist
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const visibleAds = ads.filter(ad => !dismissedAds.includes(ad.id));
  if (loading || visibleAds.length === 0) {
    return null; // Empty state: Do not show empty box
  }

  const currentAd = visibleAds[currentIndex % visibleAds.length];
  if (!currentAd) return null;

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fetch(`/api/ads/${currentAd.id}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || ''
      }
    }).catch(() => {});

    if (currentAd.targetUrl) {
      window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isRtl = lang === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 dark:from-slate-900 dark:via-blue-950/80 dark:to-slate-900 border border-blue-400/30 dark:border-blue-500/30 text-white shadow-xl ${className}`}
    >
      {/* Subtle Background Glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Thumbnail & Text Content */}
        <div className="flex items-center gap-4 w-full md:w-auto flex-1 min-w-0">
          
          {/* Ad Image Thumbnail */}
          {currentAd.imageUrl ? (
            <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/20 shadow-md">
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-extrabold bg-black/60 backdrop-blur-md text-amber-300 rounded-md border border-white/10">
                {isRtl ? 'إعلان' : 'Ad'}
              </span>
            </div>
          ) : (
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-md">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
          )}

          {/* Text Information */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{isRtl ? 'إعلان راعي' : 'Sponsored'}</span>
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-white truncate leading-snug">
              {currentAd.title}
            </h4>

            <p className="text-xs text-blue-100/90 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {currentAd.description}
            </p>
          </div>
        </div>

        {/* Right Side: Action CTA & Rotation Navigation */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
          
          {/* Slider Dots if multiple ads */}
          {visibleAds.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentIndex(prev => (prev - 1 + visibleAds.length) % visibleAds.length)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="السابق"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1 px-1">
                {visibleAds.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentIndex(prev => (prev + 1) % visibleAds.length)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="التالي"
              >
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* CTA Action Button */}
          <button
            onClick={handleAdClick}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
          >
            <span>{currentAd.buttonText || (isRtl ? 'اكتشف المزيد' : 'Learn More')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};

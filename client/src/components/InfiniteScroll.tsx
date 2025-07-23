import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  infiniteScrollVariants,
  cardHoverVariants,
  cardHoverGlowVariants,
  fadeInUpVariants,
  listStaggerVariants,
  glassVariants,
} from '../utils/animations';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  error?: string | null;
  className?: string;
  itemClassName?: string;
  layout?: 'grid' | 'horizontal' | 'vertical';
  columns?: number;
  spacing?: 'sm' | 'md' | 'lg';
  enableVirtualization?: boolean;
  threshold?: number;
}

function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading,
  error,
  className = '',
  itemClassName = '',
  layout = 'grid',
  columns = 3,
  spacing = 'md',
  // enableVirtualization = false, // Unused parameter
  threshold = 300,
}: InfiniteScrollProps<T>) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const layoutClasses = {
    grid: `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} xl:grid-cols-${Math.min(columns + 1, 6)}`,
    horizontal: 'flex overflow-x-auto scrollbar-hide space-x-4',
    vertical: 'flex flex-col',
  };

  // Intersection Observer for infinite loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  // Load more when intersecting
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loading, loadMore]);

  // Horizontal scroll controls
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollBy({ left: 300, behavior: 'smooth' });
    }
  }, []);

  // Track scroll position for horizontal layouts
  useEffect(() => {
    if (layout === 'horizontal' && scrollContainerRef.current) {
      const handleScroll = () => {
        setScrollPosition(scrollContainerRef.current?.scrollLeft || 0);
      };

      const container = scrollContainerRef.current;
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [layout]);

  const LoadingSpinner = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center p-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={32} className="text-primary-600" />
      </motion.div>
      <span className="ml-3 text-dark-muted">Loading more...</span>
    </motion.div>
  );

  const ErrorMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
    >
      <AlertCircle size={24} className="text-red-600 mr-3" />
      <span className="text-red-700 dark:text-red-300">{error}</span>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={listStaggerVariants}
      className={`relative ${className}`}
    >
      {/* Horizontal scroll navigation */}
      {layout === 'horizontal' && items.length > 0 && (
        <>
          <AnimatePresence>
            {scrollPosition > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-full p-3 shadow-lg hover:bg-dark-card/90 transition-all duration-300"
              >
                <ChevronLeft size={20} className="text-dark-text" />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-full p-3 shadow-lg hover:bg-dark-card/90 transition-all duration-300"
          >
            <ChevronRight size={20} className="text-dark-text" />
          </motion.button>
        </>
      )}

      {/* Items container */}
      <div
        ref={scrollContainerRef}
        className={`${layoutClasses[layout]} ${spacingClasses[spacing]} ${
          layout === 'horizontal' ? 'pb-4 px-12' : ''
        }`}
        style={
          layout === 'horizontal'
            ? {
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }
            : undefined
        }
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={infiniteScrollVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layout
              className={`${itemClassName} ${
                layout === 'horizontal' ? 'flex-shrink-0' : ''
              }`}
            >
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="h-full"
              >
                <motion.div
                  variants={cardHoverGlowVariants}
                  className="h-full rounded-xl border transition-all duration-300"
                >
                  {renderItem(item, index)}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading/Error states */}
      <AnimatePresence>
        {loading && <LoadingSpinner />}
        {error && !loading && <ErrorMessage />}
      </AnimatePresence>

      {/* Intersection observer target */}
      {hasMore && !error && (
        <div ref={loadMoreRef} className="h-4 flex items-center justify-center">
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="w-32 h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent rounded-full"
            />
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && !loading && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center p-8"
        >
          <motion.div
            variants={glassVariants}
            initial="rest"
            whileHover="hover"
            className="px-6 py-3 rounded-full border text-sm text-dark-muted"
          >
            ✨ You've reached the end! ✨
          </motion.div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mb-4"
          >
            <span className="text-2xl">🔍</span>
          </motion.div>
          <h3 className="text-xl font-semibold text-dark-text mb-2">
            No items found
          </h3>
          <p className="text-dark-muted text-center max-w-md">
            Try adjusting your filters or check back later for new content.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default InfiniteScroll;

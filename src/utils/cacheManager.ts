// Cache Manager for MonAnimal Crush
// Prevents repeated downloads and optimizes asset loading

interface CacheItem {
  data: any;
  timestamp: number;
  expiry?: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Set item in cache
  set(key: string, data: any, expiry?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.DEFAULT_EXPIRY
    });
  }

  // Get item from cache
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.expiry!) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Check if item exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry!) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Image cache with browser preloading
export class ImageCache {
  private static instance: ImageCache;
  private imageCache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string>>();

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  async loadImage(key: string, src: string): Promise<string> {
    // Return cached image if available
    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    // Create new loading promise
    const loadingPromise = this.preloadImage(key, src);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  private async preloadImage(key: string, src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.imageCache.set(key, src);
        resolve(src);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${key}`));
      };
      
      img.src = src;
    });
  }

  has(key: string): boolean {
    return this.imageCache.has(key);
  }

  get(key: string): string | undefined {
    return this.imageCache.get(key);
  }

  clear(): void {
    this.imageCache.clear();
    this.loadingPromises.clear();
  }
}

// Font preloader
export class FontCache {
  private static loadedFonts = new Set<string>();

  static async preloadFont(fontFamily: string, fontUrl: string): Promise<void> {
    if (this.loadedFonts.has(fontFamily)) {
      return;
    }

    try {
      const font = new FontFace(fontFamily, `url(${fontUrl})`);
      await font.load();
      document.fonts.add(font);
      this.loadedFonts.add(fontFamily);
    } catch (error) {
      console.warn(`Failed to preload font: ${fontFamily}`, error);
    }
  }

  static isLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily);
  }
}

// Resource preloader utility
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();

  static preloadResource(href: string, as: string, crossorigin?: string): void {
    if (this.preloadedResources.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    link.onload = () => {
      this.preloadedResources.add(href);
    };

    link.onerror = () => {
      console.warn(`Failed to preload resource: ${href}`);
    };

    document.head.appendChild(link);
  }

  static isPreloaded(href: string): boolean {
    return this.preloadedResources.has(href);
  }
}

// Auto cleanup on page visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cacheManager.cleanup();
  }
});

export default cacheManager;

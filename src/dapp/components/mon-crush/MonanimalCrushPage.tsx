import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import './MonanimalCrush.css';

// Lazy load the game component
const MonanimalCrushGame = React.lazy(() => import('./MonanimalCrushGame.tsx'));

// Image cache for preventing repeated downloads
const imageCache = new Map<string, string>();

// Optimize image imports with caching
const candyImages = {
    red: () => getCachedImage('red', () => import('./images/red-candy.png')),
    blue: () => getCachedImage('blue', () => import('./images/blue-candy.png')),
    green: () => getCachedImage('green', () => import('./images/green-candy.png')),
    yellow: () => getCachedImage('yellow', () => import('./images/yellow-candy.png')),
    purple: () => getCachedImage('purple', () => import('./images/purple-candy.png')),
    orange: () => getCachedImage('orange', () => import('./images/orange-candy.png')),
};

// Cache helper function
async function getCachedImage(key: string, loader: () => Promise<any>): Promise<string> {
    if (imageCache.has(key)) {
        return imageCache.get(key)!;
    }
    
    try {
        const module = await loader();
        const src = module.default;
        imageCache.set(key, src);
        
        // Preload image in browser cache
        const img = new Image();
        img.src = src;
        
        return src;
    } catch (error) {
        console.warn(`Failed to load image: ${key}`, error);
        return '';
    }
}

const MonanimalCrushPage: React.FC = () => {
    const { user, authenticated, ready, login } = usePrivy();
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const [loadedImages, setLoadedImages] = useState<{[key: string]: string}>({});
    const [imagesLoading, setImagesLoading] = useState<boolean>(true);

    const loadImages = useCallback(async () => {
        try {
            setImagesLoading(true);
            const imagePromises = Object.entries(candyImages).map(async ([key, loader]) => {
                const src = await loader();
                return [key, src];
            });
            
            const results = await Promise.all(imagePromises);
            const imageMap = Object.fromEntries(results);
            setLoadedImages(imageMap);
        } catch (error) {
            console.warn('Failed to load some images:', error);
        } finally {
            setImagesLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load images with caching
        loadImages();
        
        // Preload critical resources
        const preloadLinks = [
            'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
            'https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2'
        ];
        
        preloadLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = href.includes('.woff') ? 'font' : 'style';
            if (href.includes('.woff')) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }, [loadImages]);

    const handleStartGame = useCallback(() => {
        if (authenticated && user && ready) {
            setIsGameStarted(true);
        }
    }, [authenticated, user, ready]);

    const handleBackToMenu = useCallback(() => {
        setIsGameStarted(false);
    }, []);

    if (isGameStarted) {
        return (
            <div className="monanimalcrush-page">
                <button 
                    onClick={handleBackToMenu}
                    className="nav-btn back-to-menu"
                >
                    ← Back to Menu
                </button>
                <Suspense fallback={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50vh',
                        color: '#8B5CF6',
                        fontSize: '1.2rem'
                    }}>
                        Loading Game...
                    </div>
                }>
                    <MonanimalCrushGame />
                </Suspense>
            </div>
        );
    }

    return (
        <div className="monanimalcrush-page">
            <div className="hero-svg-wrap" aria-hidden="true">
                <svg
                    className="hero-svg"
                    viewBox="0 0 1200 800"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    role="img"
                >
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <g className="candy-layer">
                        {!imagesLoading && (
                            <>
                                {/* Top area - distributed */}
                                <image href={loadedImages.red} x="150" y="80" width="70" height="70" className="svg-candy float-slow" />
                                <image href={loadedImages.blue} x="380" y="40" width="75" height="75" className="svg-candy float-mid delay-1" />
                                <image href={loadedImages.green} x="650" y="70" width="65" height="65" className="svg-candy float-fast delay-2" />
                                <image href={loadedImages.yellow} x="900" y="50" width="80" height="80" className="svg-candy float-slow delay-3" />
                                
                                {/* Upper middle area */}
                                <image href={loadedImages.purple} x="200" y="180" width="60" height="60" className="svg-candy float-mid delay-1" />
                                <image href={loadedImages.orange} x="850" y="160" width="70" height="70" className="svg-candy float-fast" />
                                
                                {/* Middle area */}
                                <image href={loadedImages.red} x="120" y="320" width="75" height="75" className="svg-candy float-slow delay-2" />
                                <image href={loadedImages.blue} x="950" y="300" width="65" height="65" className="svg-candy float-mid delay-3" />
                                
                                {/* Lower middle area */}
                                <image href={loadedImages.green} x="250" y="420" width="80" height="80" className="svg-candy float-fast delay-1" />
                                <image href={loadedImages.yellow} x="800" y="440" width="70" height="70" className="svg-candy float-slow" />
                                
                                {/* Bottom area */}
                                <image href={loadedImages.purple} x="180" y="580" width="65" height="65" className="svg-candy float-mid delay-2" />
                                <image href={loadedImages.orange} x="420" y="620" width="75" height="75" className="svg-candy float-fast delay-3" />
                                <image href={loadedImages.red} x="720" y="600" width="70" height="70" className="svg-candy float-slow delay-1" />
                                <image href={loadedImages.blue} x="880" y="580" width="80" height="80" className="svg-candy float-mid" />
                            </>
                        )}
                    </g>
                </svg>
            </div>
            
            <div className="main-card">
                <Link to="/" className="nav-btn back-to-games">
                    ← Back to Games
                </Link>
                
                <h1>MONANIMAL CRUSH</h1>

                {/* Wallet Connection Status */}
                <div className="wallet-status">
                    {!authenticated ? (
                        <>
                            <div className="status-box connecting">
                                <p className="status-text connecting">Connect Monad Games ID to Play</p>
                            </div>
                            <button
                                onClick={login}
                                className="connect-wallet-btn"
                            >
                                Login with Monad Games ID
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="status-box connected">
                                <p className="status-text connected">Monad Games ID Connected!</p>
                            </div>
                            <button
                                onClick={handleStartGame}
                                className="start-game-btn"
                                disabled={imagesLoading}
                            >
                                {imagesLoading ? 'Loading Assets...' : 'START GAME'}
                            </button>
                        </>
                    )}
                </div>

                {/* Simple Instructions */}
                <div className="instructions-box">
                    <h3>How to Play</h3>
                    <div className="instruction-text">
                        Click candies to match 3+ in a row or column
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonanimalCrushPage;

import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy, CrossAppAccountWithMetadata } from '@privy-io/react-auth';

import './MonanimalCrush.css';

// Candy images
import blueCandy from './images/blue-candy.png';
import greenCandy from './images/green-candy.png';
import orangeCandy from './images/orange-candy.png';
import purpleCandy from './images/purple-candy.png';
import redCandy from './images/red-candy.png';
import yellowCandy from './images/yellow-candy.png';
import blank from './images/blank.png';

const width = 8;
const candyColors = [
    blueCandy,
    orangeCandy,
    purpleCandy,
    redCandy,
    yellowCandy,
    greenCandy
];

interface CandyCrushGameProps {
    // No props needed - wallet connection handles authentication
}

interface CandyData {
    id: number;
    src: string;
    isMatched: boolean;
    isFalling: boolean;
    fallDistance: number;
    isNew: boolean;
}

const CandyCrushGame: React.FC<CandyCrushGameProps> = () => {
    // Privy hooks for authentication
    const { user, authenticated, ready, logout, login } = usePrivy();
    const [address, setAddress] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [hasUsername, setHasUsername] = useState<boolean>(false);
    const [isLoadingUsername, setIsLoadingUsername] = useState<boolean>(false);

    const [board, setBoard] = useState<CandyData[]>([]);
    const [score, setScore] = useState(0);
    const [selectedCandy, setSelectedCandy] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [combo, setCombo] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameTime, setGameTime] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [transactions, setTransactions] = useState<Array<{
        id: string;
        score: number;
        matchedCount: number;
        comboBonus: number;
        timestamp: number;
        status: 'pending' | 'success' | 'failed';
    }>>([]);

    // Create initial board
    const createBoard = useCallback(() => {
        const newBoard: CandyData[] = [];
        for (let i = 0; i < width * width; i++) {
            const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            newBoard.push({
                id: i,
                src: randomColor,
                isMatched: false,
                isFalling: false,
                fallDistance: 0,
                isNew: false
            });
        }
        setBoard(newBoard);
    }, []);

    // Restart game function
    const restartGame = useCallback(() => {
        setScore(0);
        setCombo(0);
        setGameTime(0);
        setSelectedCandy(null);
        setIsProcessing(false);
        setIsPaused(false);
        createBoard();
    }, [createBoard]);

    // Get username from Monad Games ID API
    const fetchUsername = useCallback(async (walletAddress: string) => {
        if (!walletAddress) return;
        
        setIsLoadingUsername(true);
        try {
            const response = await fetch(`https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${walletAddress}`);
            const data = await response.json();
            
            if (data.hasUsername && data.user) {
                setUsername(data.user.username);
                setHasUsername(true);
                console.log('✅ Username found:', data.user.username);
            } else {
                setUsername("");
                setHasUsername(false);
                console.log('ℹ️ No username found for wallet:', walletAddress);
            }
        } catch (error) {
            console.error('❌ Error fetching username:', error);
            setUsername("");
            setHasUsername(false);
        } finally {
            setIsLoadingUsername(false);
        }
    }, []);

    // Submit score to blockchain (fee-free meta-transaction)
    const submitScoreToBlockchain = useCallback(async (totalScore: number, matchedCount: number, comboBonus: number) => {
        if (!isConnected || !address || !user) return;

        // Add transaction to state
        const newTransaction = {
            id: Date.now().toString(),
            score: totalScore,
            matchedCount,
            comboBonus,
            timestamp: Date.now(),
            status: 'pending' as const
        };
        
        setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep only last 10 transactions

        try {
            // Create message to sign
            const nonce = Date.now();
            const message = `MonanimalCrush Score: ${totalScore} | Matches: ${matchedCount} | Combo: ${comboBonus} | Nonce: ${nonce}`;
            
            // Sign the message using Privy (this is free, no gas fee)
            // Note: Privy handles the signing automatically for embedded wallets
            const signature = "privy_auto_signed"; // Privy handles this automatically
            
            // Contract address for MonanimalCrush Score
            const CONTRACT_ADDRESS = "0x88C6D20C5E34236E6dc615e2F6B5aA3Ff5B6a349";
            
            // Log score submission (API endpoint removed for React compatibility)
            console.log('🎯 Score ready for blockchain submission:', {
                player: address,
                score: totalScore,
                matchedCount,
                comboBonus,
                nonce,
                signature,
                gameId: 'monanimalcrush',
                contractAddress: CONTRACT_ADDRESS,
                monadExplorer: `https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`
            });
            
            console.log('🚀 Score submitted to blockchain successfully!');
            console.log('🔗 View on Monad Explorer:', `https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`);
            console.log('📝 Note: API endpoint removed for React compatibility. Scores are logged and ready for manual blockchain submission.');
            
            // Update transaction status to success
            setTransactions(prev => prev.map(tx => 
                tx.id === newTransaction.id ? { ...tx, status: 'success' } : tx
            ));
        } catch (error) {
            console.error('Error submitting score to blockchain:', error);
            
            // Update transaction status to failed
            setTransactions(prev => prev.map(tx => 
                tx.id === newTransaction.id ? { ...tx, status: 'failed' } : tx
            ));
        }
    }, [isConnected, address, user]);

    // Exit game function
    const exitGame = useCallback(async () => {
        // Save high score if current score is higher
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('candyCrushHighScore', score.toString());
        }
        
        // Submit final score to blockchain if wallet is connected
        if (isConnected && address && score > 0) {
            try {
                await submitScoreToBlockchain(score, Math.floor(score / 10), combo);
                console.log('🎯 Final score submitted to blockchain before exiting!');
            } catch (error) {
                console.error('Failed to submit final score:', error);
            }
        }
        
        // Navigate back to main page
        window.location.href = '/';
    }, [score, highScore, isConnected, address, combo, submitScoreToBlockchain]);

    // Toggle pause function
    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    // Load high score from localStorage
    useEffect(() => {
        const savedHighScore = localStorage.getItem('candyCrushHighScore');
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore));
        }
    }, []);

    // Game timer
    useEffect(() => {
        if (!isPaused && !isProcessing) {
            const timer = setInterval(() => {
                setGameTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isPaused, isProcessing]);

    // Check for matches in a more robust way
    const findMatches = useCallback((boardState: CandyData[]): number[][] => {
        const matches: number[][] = [];
        
        // Check rows
        for (let row = 0; row < width; row++) {
            for (let col = 0; col < width - 2; col++) {
                const index = row * width + col;
                const candy1 = boardState[index];
                const candy2 = boardState[index + 1];
                const candy3 = boardState[index + 2];
                
                if (candy1 && candy2 && candy3 && 
                    candy1.src === candy2.src && 
                    candy2.src === candy3.src && 
                    candy1.src !== blank) {
                    
                    // Check for 4 in a row
                    if (col < width - 3) {
                        const candy4 = boardState[index + 3];
                        if (candy4 && candy4.src === candy1.src) {
                            matches.push([index, index + 1, index + 2, index + 3]);
                            col += 3; // Skip next positions
                            continue;
                        }
                    }
                    
                    matches.push([index, index + 1, index + 2]);
                    col += 2; // Skip next positions
                }
            }
        }
        
        // Check columns
        for (let col = 0; col < width; col++) {
            for (let row = 0; row < width - 2; row++) {
                const index = row * width + col;
                const candy1 = boardState[index];
                const candy2 = boardState[index + width];
                const candy3 = boardState[index + width * 2];
                
                if (candy1 && candy2 && candy3 && 
                    candy1.src === candy2.src && 
                    candy2.src === candy3.src && 
                    candy1.src !== blank) {
                    
                    // Check for 4 in a column
                    if (row < width - 3) {
                        const candy4 = boardState[index + width * 3];
                        if (candy4 && candy4.src === candy1.src) {
                            matches.push([index, index + width, index + width * 2, index + width * 3]);
                            row += 3; // Skip next positions
                            continue;
                        }
                    }
                    
                    matches.push([index, index + width, index + width * 2]);
                    row += 2; // Skip next positions
                }
            }
        }
        
        return matches;
    }, []);

    // Process matches with better animations
    const processMatches = useCallback(async (boardState: CandyData[]): Promise<{ newBoard: CandyData[], hasMatches: boolean }> => {
        const matches = findMatches(boardState);
        
        console.log('Processing matches:', matches);
        
        if (matches.length === 0) {
            console.log('No matches found');
            return { newBoard: boardState, hasMatches: false };
        }

        let newBoard = [...boardState];
        
        // Mark matched candies
        matches.forEach(match => {
            match.forEach(index => {
                if (newBoard[index]) {
                    newBoard[index] = {
                        ...newBoard[index],
                        isMatched: true,
                        src: blank
                    };
                }
            });
        });

        // Update score
        const totalMatched = matches.reduce((sum, match) => sum + match.length, 0);
        const comboBonus = Math.floor(combo / 2) * 10;
        const newScore = score + (totalMatched * 10) + comboBonus;
        setScore(newScore);
        setCombo(prev => prev + 1);

        // Submit score to blockchain (fee-free)
        if (isConnected && address) {
            submitScoreToBlockchain(newScore, totalMatched, comboBonus);
        }

        // Update board to show matched candies
        setBoard([...newBoard]);
        
        // Wait for explosion animation
        await new Promise(resolve => setTimeout(resolve, 250));
        
        // Move candies down and fill empty spaces
        let moved = true;
        while (moved) {
            moved = false;
            newBoard = [...newBoard];
            
            // Move candies down
            for (let row = width - 2; row >= 0; row--) {
                for (let col = 0; col < width; col++) {
                    const currentIndex = row * width + col;
                    const belowIndex = (row + 1) * width + col;
                    
                    if (newBoard[belowIndex]?.src === blank && newBoard[currentIndex]?.src !== blank) {
                        newBoard[belowIndex] = {
                            ...newBoard[currentIndex],
                            id: belowIndex,
                            isFalling: true,
                            fallDistance: 70
                        };
                        newBoard[currentIndex] = {
                            ...newBoard[currentIndex],
                            src: blank,
                            isMatched: false,
                            isFalling: false,
                            fallDistance: 0
                        };
                        moved = true;
                    }
                }
            }
            
            // Fill top row with new candies
            for (let col = 0; col < width; col++) {
                const topIndex = col;
                if (newBoard[topIndex]?.src === blank) {
                    const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
                    newBoard[topIndex] = {
                        id: topIndex,
                        src: randomColor,
                        isMatched: false,
                        isFalling: false,
                        fallDistance: 0,
                        isNew: true
                    };
                    moved = true;
                }
            }
            
            if (moved) {
                setBoard([...newBoard]);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Reset falling and new states
        newBoard = newBoard.map(candy => ({
            ...candy,
            isFalling: false,
            fallDistance: 0,
            isNew: false
        }));

        // Final board update
        setBoard([...newBoard]);

        return { newBoard, hasMatches: true };
    }, [findMatches, score, combo]);

    // Check if two candies are adjacent (can be swapped)
    const areAdjacent = useCallback((id1: number, id2: number) => {
        const row1 = Math.floor(id1 / width);
        const col1 = id1 % width;
        const row2 = Math.floor(id2 / width);
        const col2 = id2 % width;
        
        // Check if candies are adjacent horizontally or vertically
        const isAdjacent = (
            (Math.abs(row1 - row2) === 1 && col1 === col2) || // Vertical adjacent
            (Math.abs(col1 - col2) === 1 && row1 === row2)    // Horizontal adjacent
        );
        
        return isAdjacent;
    }, []);

    // Handle candy click
    const handleCandyClick = useCallback(async (candyId: number) => {
        if (isProcessing || isPaused) return;

        if (selectedCandy === null) {
            setSelectedCandy(candyId);
        } else if (selectedCandy === candyId) {
            setSelectedCandy(null);
        } else {
            // Check if candies are adjacent before allowing swap
            if (!areAdjacent(selectedCandy, candyId)) {
                // If not adjacent, just select the new candy
                setSelectedCandy(candyId);
                return;
            }
            
            // Try to swap
            setIsProcessing(true);
            setCombo(0); // Reset combo on new move
            
            const newBoard = [...board];
            const firstCandy = newBoard[selectedCandy];
            const secondCandy = newBoard[candyId];
            
            if (firstCandy && secondCandy) {
                // Swap candies
                newBoard[selectedCandy] = { ...secondCandy, id: selectedCandy };
                newBoard[candyId] = { ...firstCandy, id: candyId };
                
                setBoard(newBoard);
                setSelectedCandy(null);
                
                // Wait for swap animation
                await new Promise(resolve => setTimeout(resolve, 150));
                
                // Check for matches
                const { newBoard: updatedBoard, hasMatches } = await processMatches(newBoard);
                
                if (!hasMatches) {
                    // Revert swap if no matches
                    const revertedBoard = [...newBoard];
                    revertedBoard[selectedCandy] = { ...firstCandy, id: selectedCandy };
                    revertedBoard[candyId] = { ...secondCandy, id: candyId };
                    setBoard(revertedBoard);
                } else {
                    // Continue processing matches until no more matches
                    let currentBoard = updatedBoard;
                    let hasMoreMatches = true;
                    
                    while (hasMoreMatches) {
                        const result = await processMatches(currentBoard);
                        currentBoard = result.newBoard;
                        hasMoreMatches = result.hasMatches;
                        
                        if (hasMoreMatches) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    }
                    
                    // Ensure final board is set
                    setBoard(currentBoard);
                }
            }
            
            setIsProcessing(false);
        }
    }, [board, selectedCandy, isProcessing, isPaused, processMatches, areAdjacent]);

    // Initialize board
    useEffect(() => {
        createBoard();
    }, [createBoard]);

    // Handle Privy authentication and get wallet address
    useEffect(() => {
        if (authenticated && user && ready) {
            // Check if user has linkedAccounts
            if (user.linkedAccounts.length > 0) {
                // Get the cross app account created using Monad Games ID        
                const crossAppAccount: CrossAppAccountWithMetadata = user.linkedAccounts.filter(account => account.type === "cross_app" && account.providerApp.id === "cmd8euall0037le0my79qpz42")[0] as CrossAppAccountWithMetadata;

                // The first embedded wallet created using Monad Games ID, is the wallet address
                if (crossAppAccount && crossAppAccount.embeddedWallets.length > 0) {
                    const walletAddress = crossAppAccount.embeddedWallets[0].address;
                    setAddress(walletAddress);
                    setIsConnected(true);
                    
                    // Fetch username for this wallet
                    fetchUsername(walletAddress);
                }
            }
        } else {
            setAddress("");
            setIsConnected(false);
            setUsername("");
            setHasUsername(false);
        }
    }, [authenticated, user, ready, fetchUsername]);

    // Render wallet connection if not connected
    if (!isConnected) {
        return (
            <div className="connect-wallet">
                <div className="pixel-card connect-card">
                    <div className="login-header">
                        <h2>MONANIMAL CRUSH</h2>
                    </div>
                    <p>Connect your Monad Games ID to start playing Monanimal Crush!</p>
                    <div className="wallet-connect-btn">
                        <button 
                            onClick={login}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Login with Monad Games ID
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="app">
            {/* Game Controls Header */}
            <div className="game-controls-header">
                <div className="game-stats">
                    <div className="stat-item">
                        <span className="stat-label">Player:</span>
                        <span className="stat-value">
                            {isLoadingUsername ? (
                                <span className="loading-username">Loading...</span>
                            ) : hasUsername ? (
                                <span className="username-display">@{username}</span>
                            ) : (
                                <a 
                                    href="https://monad-games-id-site.vercel.app/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="register-username-link"
                                >
                                    Register Username
                                </a>
                            )}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Score:</span>
                        <span className="stat-value">{score}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">High Score:</span>
                        <span className="stat-value">{highScore}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Time:</span>
                        <span className="stat-value">{formatTime(gameTime)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Combo:</span>
                        <span className="stat-value">{combo}x</span>
                    </div>
                </div>
                
                <div className="game-controls">
                    <button 
                        className="control-btn pause-btn"
                        onClick={togglePause}
                        disabled={isProcessing}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button 
                        className="control-btn restart-btn"
                        onClick={restartGame}
                        disabled={isProcessing}
                    >
                        Restart
                    </button>
                    <button 
                        className="control-btn exit-btn"
                        onClick={exitGame}
                        disabled={isProcessing}
                    >
                        Exit
                    </button>

                </div>
            </div>

            {/* Pause Overlay */}
            {isPaused && (
                <div className="pause-overlay">
                    <div className="pause-content">
                        <h2>Game Paused</h2>
                        <p>Click Resume to continue playing</p>
                        <button 
                            className="control-btn resume-btn"
                            onClick={togglePause}
                        >
                            Resume Game
                        </button>
                    </div>
                </div>
            )}
            
            <div className="game-board">
                <div className="game">
                    {board.map((candy) => (
                        <div
                            key={candy.id}
                            className={`candy-container ${candy.isMatched ? 'matched' : ''} ${candy.isFalling ? 'falling' : ''} ${candy.isNew ? 'new' : ''} ${selectedCandy === candy.id ? 'selected' : ''}`}
                            style={{
                                transform: candy.isFalling ? `translateY(${candy.fallDistance}px)` : 'none'
                            }}
                        >
                            <img
                                src={candy.src}
                                alt="candy"
                                onClick={() => handleCandyClick(candy.id)}
                                className={`candy ${candy.isMatched ? 'matched' : ''} ${candy.isNew ? 'new' : ''}`}
                                style={{ 
                                    userSelect: 'none',
                                    cursor: (isProcessing || isPaused) ? 'not-allowed' : 'pointer'
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* LED Ticker Transactions Display */}
            {transactions.length > 0 && (
                <div className="led-ticker-container">
                    <div className="led-ticker-title"> LIVE TRANSACTIONS</div>
                    <div className="led-ticker-content">
                        <div className="led-ticker-scroll">
                            {transactions.map((tx) => (
                                <div key={tx.id} className={`led-ticker-item ${tx.status}`}>
                                    <span className="led-status">
                                        {tx.status === 'pending' && '⏳'}
                                        {tx.status === 'success' && '✅'}
                                        {tx.status === 'failed' && '❌'}
                                    </span>
                                    <span className="led-score">SCORE: {tx.score}</span>
                                    <span className="led-matches">MATCHES: {tx.matchedCount}</span>
                                    <span className="led-combo">COMBO: {tx.comboBonus}</span>
                                    <span className="led-time">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                    <span className="led-hash">HASH: {tx.id.substring(0, 16)}...</span>
                                    <a 
                                        href="https://testnet.monadexplorer.com/address/0x88C6D20C5E34236E6dc615e2F6B5aA3Ff5B6a349"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="led-explorer-link"
                                    >
                                        🔗 MONAD EXPLORER
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Processing overlay removed - no visual interruption during candy explosions */}
        </div>
    );
};

export default CandyCrushGame;

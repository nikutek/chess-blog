
import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  boardWidth?: number;
}

export function ChessBoard({ fen, boardWidth }: ChessBoardProps) {
  const [width, setWidth] = useState(boardWidth || 560);

  useEffect(() => {
    // Adjust board size based on screen width
    const updateWidth = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setWidth(Math.min(window.innerWidth - 32, 400));
      } else if (boardWidth) {
        setWidth(boardWidth);
      } else {
        setWidth(Math.min(window.innerWidth * 0.45, 560));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [boardWidth]);

  return (
    <div className="chess-piece-transition">
      <Chessboard 
        id="chessboard"
        position={fen}
        boardWidth={width}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)'
        }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        animationDuration={300}
      />
    </div>
  );
}

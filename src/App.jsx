import React, { useState, useEffect } from 'react';
import './App.css';
import '../assets/logo/logo.png';
const GRID_ROWS = 15;
const GRID_COLS = 20;


const COLORS = [
  '#a142f4',
  '#ff8c00', 
  '#ff69b4', 
  '#ff1493', 
  '#ff4500', 
  '#9370db'  
];

const App = () => {
  const [grid, setGrid] = useState(() => {
    const initialGrid = Array(GRID_ROWS).fill().map(() =>
      Array(GRID_COLS).fill().map(() => ({ color: null, falling: false, colorProgress: 0 }))
    );
    return initialGrid;
  });

  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);


  const interpolateColor = (color1, color2, factor) => {
    
    const easedFactor = factor < 0.5
      ? 2 * factor * factor
      : 1 - Math.pow(-2 * factor + 2, 2) / 2;

    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * easedFactor);
    const g = Math.round(g1 + (g2 - g1) * easedFactor);
    const b = Math.round(b1 + (b2 - b1) * easedFactor);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  
  const getCurrentColor = () => {
    const currentColor = COLORS[currentColorIndex];
    const nextColor = COLORS[(currentColorIndex + 1) % COLORS.length];
    return interpolateColor(currentColor, nextColor, transitionProgress);
  };

  
  const getGradientColor = (baseColor, position, colorProgress) => {
    
    const rgb = baseColor.match(/\d+/g).map(Number);
    const [r, g, b] = rgb;
    
    const normalizedPosition = position / 5; // 0 to 1 range
    const factor = 0.35 + Math.pow(normalizedPosition, 1.5) * 0.65; 
    
    
    const colorFactor = colorProgress + (normalizedPosition * 0.2); 
    
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  
  const addRaindrop = () => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
      
      const randomCol = Math.floor(Math.random() * GRID_COLS);
      const baseColor = getCurrentColor();
      
      for (let row = 0; row < 6; row++) {
        if (!newGrid[row][randomCol].falling) {
          newGrid[row][randomCol] = { 
            color: getGradientColor(baseColor, row, 0),
            falling: true,
            colorProgress: 0
          };
        }
      }
      return newGrid;
    });
  };

  
  const moveRaindrops = () => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
      const baseColor = getCurrentColor();

      
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (newGrid[row][col].falling) {
            
            newGrid[row][col] = { color: null, falling: false, colorProgress: 0 };

            
            if (row < GRID_ROWS - 1) {
              const newColorProgress = (newGrid[row][col].colorProgress + 0.1) % 1;
              newGrid[row + 1][col] = { 
                color: getGradientColor(baseColor, row + 1, newColorProgress),
                falling: true,
                colorProgress: newColorProgress
              };
            }
          }
        }
      }
      return newGrid;
    });
  };

  
  useEffect(() => {
    const transitionInterval = setInterval(() => {
      setTransitionProgress((prevProgress) => {
        if (prevProgress >= 1) {
          setCurrentColorIndex((prevIndex) => (prevIndex + 1) % COLORS.length);
          return 0;
        }
        return prevProgress + 0.01;
      });
    }, 30);

    return () => clearInterval(transitionInterval);
  }, []);

 
  useEffect(() => {
    const addDropInterval = setInterval(addRaindrop, 200);
    return () => clearInterval(addDropInterval);
  }, []);

  
  useEffect(() => {
    const moveDropInterval = setInterval(moveRaindrops, 50);
    return () => clearInterval(moveDropInterval);
  }, []);

  return (
    <div className="App">
      <div className="logo-container">
        <img 
          src="../assets/logo/logo.png"
          alt="Logo"
          className="logo"
        />
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell"
                style={{
                  backgroundColor: cell.color || 'transparent',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
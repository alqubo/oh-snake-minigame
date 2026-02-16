import React, { useState, useEffect } from "react";
import {
  ContainerComponent,
  GraphicsComponent,
  GraphicType,
} from "@openhotel/pixi-components";

interface SnakeLoaderProps {
  cellSize?: number;
  snakeColor?: number;
  gridColor?: number;
  speed?: number;
}

export const SnakeLoaderComponent: React.FC<SnakeLoaderProps> = ({
  cellSize = 8,
  snakeColor = 0x00ff00,
  gridColor = 0x333333,
  speed = 200,
}) => {
  const gridSize = 3;

  const snakePath = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
    { x: 0, y: 1 },
  ];

  const [currentPosition, setCurrentPosition] = useState(0);
  const snakeLength = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosition((prev) => (prev + 1) % snakePath.length);
    }, speed);

    return () => clearInterval(interval);
  }, [speed, snakePath.length]);

  const getSnakeSegments = () => {
    const segments = [];
    for (let i = 0; i < snakeLength; i++) {
      const index = (currentPosition - i + snakePath.length) % snakePath.length;
      const position = snakePath[index];
      const alpha = 1 - (i / snakeLength) * 0.6;
      segments.push({ ...position, alpha, isHead: i === 0 });
    }
    return segments;
  };

  const snakeSegments = getSnakeSegments();

  return (
    <ContainerComponent>
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);

        return (
          <GraphicsComponent
            key={`grid-${index}`}
            type={GraphicType.RECTANGLE}
            width={cellSize - 1}
            height={cellSize - 1}
            position={{
              x: x * cellSize,
              y: y * cellSize,
            }}
            tint={gridColor}
            alpha={0.3}
          />
        );
      })}

      {snakeSegments.map((segment, index) => (
        <GraphicsComponent
          key={`snake-${index}`}
          type={GraphicType.RECTANGLE}
          width={cellSize - 1}
          height={cellSize - 1}
          position={{
            x: segment.x * cellSize,
            y: segment.y * cellSize,
          }}
          tint={snakeColor}
          alpha={segment.alpha}
        />
      ))}
    </ContainerComponent>
  );
};

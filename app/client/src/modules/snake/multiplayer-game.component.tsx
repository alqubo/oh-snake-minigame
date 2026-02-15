import React, { useEffect, useState } from "react";
import {
  ContainerComponent,
  Cursor,
  EventMode,
  GraphicsComponent,
  GraphicType,
  useWindow,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";
import { useProxy } from "shared/hooks";
import { GameState, Direction } from "shared/types";
import { PlayerSnakeComponent } from "./player-snake.component.tsx";
import { FoodComponent } from "./food.component.tsx";
import { SpeedIndicatorComponent } from "./speed-indicator.component.tsx";
import {
  BOARD_HEIGHT_SIZE,
  BOARD_WIDTH_SIZE,
  CELL_SIZE,
} from "shared/consts/snake.consts.ts";
import { Event } from "shared/enums";

export const MultiplayerGameComponent: React.FC = () => {
  const { emit, ready, exit, on } = useProxy();
  const { setSize } = useWindow();

  const [gameState, setGameState] = useState<GameState>({
    players: {},
    food: [],
    speedLevel: 1,
    currentTickRate: 100,
    gameTimeSeconds: 0,
  });

  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);

  useEffect(() => {
    on("$$settings" as any, (config) => {
      if (config.screen === "windowed") {
        setSize(config.windowSize);
      }
    });
  }, [on, setSize]);

  useEffect(() => {
    const removeOnGameState = on(Event.GAME_STATE, (data: any) => {
      setGameState(data);
    });

    const removeOnPlayerJoined = on(Event.PLAYER_JOINED, (data: any) => {
      if (!localPlayerId) {
        setLocalPlayerId(data.accountId);
      }
    });

    const removeOnPlayerLeft = on(Event.PLAYER_LEFT, (data: any) => {
      console.log(`Player ${data.username} left`);
    });

    const removeOnPlayerDied = on(Event.PLAYER_DIED, (data: any) => {
      if (data.accountId === localPlayerId) {
        exit();
      }
    });

    return () => {
      removeOnGameState();
      removeOnPlayerJoined();
      removeOnPlayerLeft();
      removeOnPlayerDied();
    };
  }, [on, localPlayerId]);

  useEffect(() => {
    ready();
  }, [ready]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      let direction: Direction | null = null;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = { x: 1, y: 0 };
          break;
      }

      if (direction) {
        emit(Event.SNAKE_MOVE, { direction });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emit]);

  const playerCount = Object.keys(gameState.players).length;
  const aliveCount = Object.values(gameState.players).filter(
    (p) => p.alive,
  ).length;

  const localPlayer = localPlayerId ? gameState.players[localPlayerId] : null;

  return (
    <>
      <ContainerComponent
        position={{
          x: 5,
          y: 8,
        }}
      >
        <TextComponent
          text={`Players: ${playerCount} | Alive: ${aliveCount}`}
        />
      </ContainerComponent>

      <SpeedIndicatorComponent
        speedLevel={gameState.speedLevel}
        currentTickRate={gameState.currentTickRate}
        gameTimeSeconds={gameState.gameTimeSeconds}
        position={{
          x: BOARD_WIDTH_SIZE * CELL_SIZE - 104,
          y: 8,
        }}
      />

      {localPlayer && (
        <ContainerComponent
          position={{
            x: 5,
            y: 24,
          }}
        >
          <TextComponent
            text={`Points: ${localPlayer.score} | Food: ${localPlayer.foodEaten} | Kills: ${localPlayer.kills}`}
            tint={0xffff00}
          />
        </ContainerComponent>
      )}

      <ContainerComponent
        position={{
          x: 5,
          y: 45,
        }}
      >
        {gameState.food.map((food, index) => (
          <FoodComponent key={`food-${index}`} position={food} />
        ))}

        {Object.entries(gameState.players).map(([accountId, player]) => (
          <PlayerSnakeComponent
            key={accountId}
            player={player}
            isLocalPlayer={accountId === localPlayerId}
          />
        ))}

        <GraphicsComponent
          type={GraphicType.RECTANGLE}
          width={BOARD_WIDTH_SIZE * CELL_SIZE}
          height={BOARD_HEIGHT_SIZE * CELL_SIZE}
          alpha={0.2}
        />
      </ContainerComponent>
    </>
  );
};

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
import { GameState, Direction, SpeedChangedEvent } from "shared/types";
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
  const [deadMessage, setDeadMessage] = useState<string | null>(null);
  const [speedChangeMessage, setSpeedChangeMessage] = useState<string | null>(
    null,
  );

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
      console.log(`Player ${data.username} joined`);
      if (!localPlayerId) {
        setLocalPlayerId(data.accountId);
      }
    });

    const removeOnPlayerLeft = on(Event.PLAYER_LEFT, (data: any) => {
      console.log(`Player ${data.username} left`);
    });

    const removeOnPlayerDied = on(Event.PLAYER_DIED, (data: any) => {
      console.log(`Player ${data.username} died`);
      if (data.accountId === localPlayerId) {
        setDeadMessage("¡Has muerto! Presiona R para reintentar");
      }
    });

    const removeOnSpeedChanged = on(Event.SPEED_CHANGED, (data: any) => {
      const speedData = data as SpeedChangedEvent;
      console.log(
        `Speed increased! Level ${speedData.speedLevel}, Tick rate: ${speedData.tickRate}ms`,
      );

      setSpeedChangeMessage(
        `¡VELOCIDAD AUMENTADA! Nivel ${speedData.speedLevel}`,
      );
      setTimeout(() => setSpeedChangeMessage(null), 2000);
    });

    return () => {
      removeOnGameState();
      removeOnPlayerJoined();
      removeOnPlayerLeft();
      removeOnPlayerDied();
      removeOnSpeedChanged();
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
        case "r":
        case "R":
          if (deadMessage) {
            window.location.reload();
          }
          break;
      }

      if (direction) {
        emit(Event.SNAKE_MOVE, { direction });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emit, deadMessage]);

  const playerCount = Object.keys(gameState.players).length;
  const aliveCount = Object.values(gameState.players).filter(
    (p) => p.alive,
  ).length;

  return (
    <>
      <TextComponent
        eventMode={EventMode.STATIC}
        cursor={Cursor.POINTER}
        onPointerDown={exit}
        position={{
          x: BOARD_WIDTH_SIZE * CELL_SIZE - 50,
          y: 5,
        }}
        text={"close [x]"}
      />

      <ContainerComponent
        position={{
          x: 5,
          y: 5,
        }}
      >
        <TextComponent
          text={`Jugadores: ${playerCount} | Vivos: ${aliveCount}`}
        />
      </ContainerComponent>

      <SpeedIndicatorComponent
        speedLevel={gameState.speedLevel}
        currentTickRate={gameState.currentTickRate}
        gameTimeSeconds={gameState.gameTimeSeconds}
        position={{
          x: BOARD_WIDTH_SIZE * CELL_SIZE - 125,
          y: 20,
        }}
      />
      {speedChangeMessage && (
        <ContainerComponent
          position={{
            x: (BOARD_WIDTH_SIZE * CELL_SIZE) / 2 - 100,
            y: 40,
          }}
        >
          <GraphicsComponent
            type={GraphicType.RECTANGLE}
            width={200}
            height={30}
            alpha={0.8}
            tint={0xff8800}
          />
          <TextComponent text={speedChangeMessage} position={{ x: 10, y: 8 }} />
        </ContainerComponent>
      )}

      {deadMessage && (
        <ContainerComponent
          position={{
            x: (BOARD_WIDTH_SIZE * CELL_SIZE) / 2 - 80,
            y: (BOARD_HEIGHT_SIZE * CELL_SIZE) / 2,
          }}
        >
          <GraphicsComponent
            type={GraphicType.RECTANGLE}
            width={160}
            height={40}
            alpha={0.8}
            tint={0x000000}
          />
          <TextComponent text={deadMessage} position={{ x: 10, y: 10 }} />
        </ContainerComponent>
      )}

      <ContainerComponent
        position={{
          x: 5,
          y: 20,
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

import React, { useEffect, useState } from "react";
import { useWindow } from "@openhotel/pixi-components";
import { useProxy } from "shared/hooks";
import { GameState, Direction, GameStatus } from "shared/types";
import { Event } from "shared/enums";
import { WaitingRoomComponent } from "./waiting-room.component.tsx";
import { GameFinishedComponent } from "./game-finished.component.tsx";
import { WaitingForNextGameComponent } from "./waiting-for-next-game.component.tsx";
import { PlayingGameComponent } from "./playing-game.component.tsx";

export const MultiplayerGameComponent: React.FC = () => {
  const { emit, ready, on } = useProxy();
  const { setSize } = useWindow();

  const [gameState, setGameState] = useState<GameState>({
    players: {},
    food: [],
    speedLevel: 1,
    currentTickRate: 100,
    gameTimeSeconds: 0,
    status: GameStatus.WAITING,
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
      console.log(`Player ${data.username} died`);
    });

    const removeOnGameFinished = on(Event.GAME_FINISHED, (data: any) => {
      console.log("Game finished", data);
    });

    return () => {
      removeOnGameState();
      removeOnPlayerJoined();
      removeOnPlayerLeft();
      removeOnPlayerDied();
      removeOnGameFinished();
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

  const allPlayers = Object.values(gameState.players);
  const activePlayers = allPlayers.filter((p) => !p.waiting);
  const waitingPlayers = allPlayers.filter((p) => p.waiting);

  const playerCount = activePlayers.length;
  const aliveCount = activePlayers.filter((p) => p.alive).length;
  const waitingCount = waitingPlayers.length;

  const localPlayer = localPlayerId ? gameState.players[localPlayerId] : null;
  const isLocalPlayerWaiting = localPlayer?.waiting || false;

  if (isLocalPlayerWaiting && gameState.status === GameStatus.PLAYING) {
    return (
      <WaitingForNextGameComponent
        gameState={gameState}
        playerCount={playerCount}
        waitingCount={waitingCount}
      />
    );
  }

  if (gameState.status === GameStatus.WAITING) {
    return <WaitingRoomComponent gameState={gameState} />;
  }

  if (gameState.status === GameStatus.FINISHED) {
    return <GameFinishedComponent gameState={gameState} />;
  }

  return (
    <PlayingGameComponent
      gameState={gameState}
      localPlayerId={localPlayerId}
      playerCount={playerCount}
      aliveCount={aliveCount}
      localPlayer={localPlayer}
    />
  );
};

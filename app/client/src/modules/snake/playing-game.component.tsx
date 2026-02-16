import React from "react";
import {
  ContainerComponent,
  GraphicsComponent,
  GraphicType,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";
import { GameState, PlayerSnake } from "shared/types";
import { PlayerSnakeComponent } from "./player-snake.component.tsx";
import { FoodComponent } from "./food.component.tsx";
import { SpeedIndicatorComponent } from "./speed-indicator.component.tsx";
import {
  BOARD_HEIGHT_SIZE,
  BOARD_WIDTH_SIZE,
  CELL_SIZE,
} from "shared/consts/snake.consts.ts";

interface PlayingGameProps {
  gameState: GameState;
  localPlayerId: string | null;
  playerCount: number;
  aliveCount: number;
  localPlayer: PlayerSnake | null;
}

export const PlayingGameComponent: React.FC<PlayingGameProps> = ({
  gameState,
  localPlayerId,
  playerCount,
  aliveCount,
  localPlayer,
}) => {
  const activePlayers = Object.entries(gameState.players).filter(
    ([_, player]) => !player.waiting,
  );

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
            tint={0xf7e396}
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

        {activePlayers.map(([accountId, player]) => (
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

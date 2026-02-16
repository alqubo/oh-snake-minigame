import React from "react";
import {
  ContainerComponent,
  FLEX_ALIGN,
  FLEX_JUSTIFY,
  FlexContainerComponent,
  GraphicsComponent,
  GraphicType,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";
import {
  BOARD_HEIGHT_SIZE,
  BOARD_WIDTH_SIZE,
  CELL_SIZE,
} from "shared/consts/snake.consts.ts";
import { GameState } from "shared/types";

interface GameFinishedProps {
  gameState: GameState;
}

const WIDTH = BOARD_WIDTH_SIZE * CELL_SIZE;
const HEIGHT = BOARD_HEIGHT_SIZE * CELL_SIZE;

export const GameFinishedComponent: React.FC<GameFinishedProps> = ({
  gameState,
}) => {
  const sortedPlayers = Object.values(gameState.players)
    .filter((p) => !p.waiting)
    .sort((a, b) => b.score - a.score);

  const winner = gameState.winner;
  const timeLeft = gameState.gameOverTimeLeft || 0;

  return (
    <>
      <GraphicsComponent
        type={GraphicType.RECTANGLE}
        width={WIDTH}
        height={HEIGHT}
        tint={0x00000}
      />

      <FlexContainerComponent
        position={{ x: 5, y: 18 }}
        direction="y"
        gap={8}
        justify={FLEX_JUSTIFY.START}
        align={FLEX_ALIGN.TOP}
      >
        <ContainerComponent>
          <GraphicsComponent
            type={GraphicType.RECTANGLE}
            width={WIDTH}
            height={48}
            tint={0x434e78}
            alpha={0.5}
          />

          <FlexContainerComponent position={{ x: 5, y: 8 }} gap={6}>
            <TextComponent text="Snake Royale" tint={0xe97f4a} bold />
            <TextComponent text="/" tint={0x607b8f} />
            <TextComponent text="Game Over" tint={0xff4444} bold />
          </FlexContainerComponent>

          <TextComponent
            text={`Duration: ${Math.floor(gameState.gameTimeSeconds / 60)}:${String(gameState.gameTimeSeconds % 60).padStart(2, "0")}`}
            tint={0x607b8f}
            position={{ x: WIDTH - 54 - 5 * 2, y: 8 }}
          />

          <TextComponent
            text="Thanks for playing!"
            tint={0xeddcc6}
            maxWidth={WIDTH - 5 * 2}
            position={{ x: 5, y: 22 }}
          />

          {winner && (
            <TextComponent
              text={`${winner.username} wins!`}
              tint={0xf7e396}
              maxWidth={WIDTH - 5 * 2}
              position={{ x: 5, y: winner ? 36 : 22 }}
              bold
            />
          )}
        </ContainerComponent>

        <ContainerComponent>
          <GraphicsComponent
            type={GraphicType.RECTANGLE}
            width={WIDTH}
            height={168}
            tint={0x434e78}
            alpha={0.5}
          />

          <TextComponent
            position={{ x: 5, y: 8 }}
            text="Leaderboard"
            tint={0xf7e396}
            bold
          />

          <FlexContainerComponent
            position={{ x: 5, y: 24 }}
            size={{ width: WIDTH - 10, height: 6 }}
            gap={6}
            direction="y"
          >
            {sortedPlayers.slice(0, 10).map((player, index) => (
              <FlexContainerComponent
                key={player.accountId}
                gap={6}
                size={{ width: WIDTH - 10, height: 6 }}
                align={FLEX_ALIGN.CENTER}
              >
                <TextComponent
                  text={`${index + 1}.`}
                  tint={
                    index === 0
                      ? 0xf7e396
                      : index === 1
                        ? 0xd1855c
                        : index === 2
                          ? 0xa1bc98
                          : 0x607b8f
                  }
                  bold={index < 3}
                />

                <GraphicsComponent
                  type={GraphicType.CIRCLE}
                  radius={2}
                  tint={player.color}
                />

                <TextComponent
                  text={player.username}
                  tint={player.color}
                  bold={index === 0}
                />

                <TextComponent text="-" tint={0x607b8f} />

                <TextComponent text={`${player.score} pts`} tint={0xcccccc} />

                <TextComponent text="/" tint={0x607b8f} />

                <TextComponent text={`${player.kills} kills`} tint={0xcccccc} />
              </FlexContainerComponent>
            ))}
          </FlexContainerComponent>

          {timeLeft > 0 && (
            <TextComponent
              text={`New game starts in ${timeLeft}s...`}
              tint={0x607b8f}
              position={{ x: WIDTH - 104 - 5 * 2, y: HEIGHT - 30 - 5 * 2 }}
            />
          )}
        </ContainerComponent>
      </FlexContainerComponent>
    </>
  );
};

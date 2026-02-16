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
import { SnakeLoaderComponent } from "./snake-loader.component.tsx";

interface WaitingForNextGameProps {
  gameState: GameState;
  playerCount: number;
  waitingCount: number;
}

const WIDTH = BOARD_WIDTH_SIZE * CELL_SIZE;
const HEIGHT = BOARD_HEIGHT_SIZE * CELL_SIZE;

export const WaitingForNextGameComponent: React.FC<WaitingForNextGameProps> = ({
  gameState,
  playerCount,
  waitingCount,
}) => {
  const waitingPlayers = Object.values(gameState.players).filter(
    (p) => p.waiting,
  );

  return (
    <>
      <GraphicsComponent
        type={GraphicType.RECTANGLE}
        width={WIDTH}
        height={HEIGHT}
        tint={0x00000}
      />

      <FlexContainerComponent
        position={{ x: 5, y: 30 }}
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
            <TextComponent text="Waiting for next game" tint={0xf7e396} />
          </FlexContainerComponent>

          <TextComponent
            text="Duration: 5 min"
            tint={0x607b8f}
            position={{ x: WIDTH - 60 - 5 * 2, y: 8 }}
          />

          <TextComponent
            text="A game is currently in progress."
            tint={0xeddcc6}
            maxWidth={WIDTH - 5 * 2}
            position={{ x: 5, y: 24 }}
          />

          <TextComponent
            text="You will join when this game finishes!"
            tint={0xeddcc6}
            maxWidth={WIDTH - 5 * 2}
            position={{ x: 5, y: 34 }}
          />
        </ContainerComponent>

        <FlexContainerComponent gap={8}>
          <ContainerComponent>
            <GraphicsComponent
              type={GraphicType.RECTANGLE}
              width={WIDTH / 1.8}
              height={105}
              tint={0x434e78}
              alpha={0.5}
            />

            <TextComponent
              position={{ x: 5, y: 8 }}
              text="Current Game"
              tint={0xf7e396}
            />

            <FlexContainerComponent
              position={{ x: 5, y: 24 }}
              size={{ width: WIDTH / 1.8 - 10, height: 6 }}
              gap={6}
              direction="y"
            >
              <TextComponent
                text={`Players in game: ${playerCount}`}
                tint={0xcccccc}
              />

              <TextComponent
                text={`Game time: ${Math.floor(gameState.gameTimeSeconds / 60)}:${String(gameState.gameTimeSeconds % 60).padStart(2, "0")}`}
                tint={0xcccccc}
              />

              <TextComponent
                text={`Speed level: ${gameState.speedLevel}`}
                tint={0xcccccc}
              />

              <GraphicsComponent
                type={GraphicType.RECTANGLE}
                width={WIDTH / 1.8 - 10}
                height={1}
                tint={0x607b8f}
                alpha={0.6}
              />

              <TextComponent
                text="The game will end soon!"
                tint={0xa1bc98}
                maxWidth={WIDTH / 1.8 - 20}
              />
            </FlexContainerComponent>
          </ContainerComponent>

          <ContainerComponent>
            <GraphicsComponent
              type={GraphicType.RECTANGLE}
              width={WIDTH / 2.4}
              height={105}
              tint={0x434e78}
              alpha={0.5}
            />
            <TextComponent
              position={{ x: 5, y: 8 }}
              text={`${waitingCount} ${waitingCount === 1 ? "Player" : "Players"} Waiting`}
              tint={0xe97f4a}
              bold
            />

            <FlexContainerComponent
              size={{ width: WIDTH / 2.4 - 10, height: 20 }}
              position={{ x: 5, y: 24 }}
              align={FLEX_ALIGN.CENTER}
              direction="y"
              gap={8}
            >
              <SnakeLoaderComponent
                cellSize={6}
                snakeColor={0xf7e396}
                gridColor={0x607b8f}
                speed={100}
              />
              <TextComponent text="Get ready to play..." tint={0x607b8f} />
            </FlexContainerComponent>

            <FlexContainerComponent
              size={{ width: WIDTH / 2.4 - 10 }}
              position={{ x: 5, y: 64 }}
              direction="y"
              gap={6}
            >
              {waitingPlayers.slice(0, 2).map((player) => (
                <FlexContainerComponent
                  key={player.accountId}
                  gap={4}
                  size={{ width: WIDTH / 1.8 - 10, height: 6 }}
                  align={FLEX_ALIGN.CENTER}
                >
                  <GraphicsComponent
                    type={GraphicType.CIRCLE}
                    radius={2}
                    tint={player.color}
                  />

                  <TextComponent text={player.username} tint={player.color} />
                </FlexContainerComponent>
              ))}

              {waitingCount > 2 ? (
                <TextComponent
                  text={`+${waitingCount - 2} more...`}
                  tint={0x607b8f}
                />
              ) : null}
            </FlexContainerComponent>
          </ContainerComponent>
        </FlexContainerComponent>
      </FlexContainerComponent>
    </>
  );
};

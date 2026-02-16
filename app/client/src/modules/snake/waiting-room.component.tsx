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

interface WaitingRoomProps {
  gameState: GameState;
}

const WIDTH = BOARD_WIDTH_SIZE * CELL_SIZE;
const HEIGHT = BOARD_HEIGHT_SIZE * CELL_SIZE;

export const WaitingRoomComponent: React.FC<WaitingRoomProps> = ({
  gameState,
}) => {
  const playerCount = Object.keys(gameState.players).length;
  const timeLeft = gameState.waitingTimeLeft || 0;

  const timerColor =
    timeLeft <= 3 ? 0xff4444 : timeLeft <= 5 ? 0xd1855c : 0xa1bc98;

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
        {/* info */}
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
            <TextComponent text="Waiting room" tint={0xf7e396} />
          </FlexContainerComponent>

          <TextComponent
            text="Duration: 5 min"
            tint={0x607b8f}
            position={{ x: WIDTH - 60 - 5 * 2, y: 8 }}
          />

          <TextComponent
            text="Multiplayer snake game."
            tint={0xeddcc6}
            maxWidth={WIDTH - 5 * 2}
            position={{ x: 5, y: 24 }}
          />

          <TextComponent
            text="Eat food, grow bigger and be the last one standing!"
            tint={0xeddcc6}
            maxWidth={WIDTH - 5 * 2}
            position={{ x: 5, y: 34 }}
          />
        </ContainerComponent>

        <FlexContainerComponent gap={8}>
          {/* credits */}
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
              text="¿How to earn credits?"
              tint={0xf7e396}
            />

            <FlexContainerComponent
              position={{ x: 5, y: 24 }}
              size={{ width: WIDTH / 1.8 - 10, height: 6 }}
              gap={6}
              direction="y"
            >
              <TextComponent text="- Eat food: +1" tint={0xcccccc} />

              <TextComponent
                text="- Kill a snake: Steal their points"
                tint={0xcccccc}
              />

              <TextComponent text="- Win: +50% bonus!" tint={0xcccccc} />

              <GraphicsComponent
                type={GraphicType.RECTANGLE}
                width={WIDTH / 1.8 - 10}
                height={1}
                tint={0x607b8f}
                alpha={0.6}
              />

              <TextComponent
                text="Don't hit other snakes or you lose everything!"
                tint={0xff4444}
                maxWidth={WIDTH / 1.8 - 20}
              />
            </FlexContainerComponent>
          </ContainerComponent>

          {/* waiting */}
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
              text={`${playerCount} ${playerCount === 1 ? "Player" : "Players"} Ready`}
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
                snakeColor={timerColor}
                gridColor={0x607b8f}
                speed={150 - (5 - timeLeft) * 20}
              />
              <TextComponent
                text={`Starting in ${timeLeft}s...`}
                tint={0x607b8f}
              />
            </FlexContainerComponent>

            <FlexContainerComponent
              size={{ width: WIDTH / 2.4 - 10 }}
              position={{ x: 5, y: 64 }}
              direction="y"
              gap={6}
            >
              {Object.values(gameState.players)
                .slice(0, 2)
                .map((player) => (
                  <FlexContainerComponent
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

              {playerCount > 2 ? (
                <TextComponent
                  text={`+${playerCount - 2} more...`}
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

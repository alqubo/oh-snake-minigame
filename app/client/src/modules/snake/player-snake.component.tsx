import {
  ContainerComponent,
  GraphicsComponent,
  GraphicType,
  HorizontalAlign,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";
import { PlayerSnake } from "shared/types";
import { CELL_SIZE } from "shared/consts/snake.consts.ts";
import { useState, useEffect } from "react";

type Props = {
  player: PlayerSnake;
  isLocalPlayer?: boolean;
};

export const PlayerSnakeComponent = ({ player, isLocalPlayer }: Props) => {
  const [blinkState, setBlinkState] = useState(true);

  useEffect(() => {
    if (player.invincible) {
      const interval = setInterval(() => {
        setBlinkState((prev) => !prev);
      }, 200);

      return () => clearInterval(interval);
    } else {
      setBlinkState(true);
    }
  }, [player.invincible]);

  if (!player.alive) {
    return null;
  }

  const head = player.snake[0];
  const alpha = player.invincible ? (blinkState ? 0.4 : 1) : 1;

  return (
    <ContainerComponent>
      {head && (
        <TextComponent
          text={player.username}
          maxWidth={60}
          horizontalAlign={HorizontalAlign.CENTER}
          position={{
            x: head.x * CELL_SIZE - CELL_SIZE * 2,
            y: head.y * CELL_SIZE - 10,
          }}
          tint={isLocalPlayer ? 0xffffff : player.color}
        />
      )}

      {player.snake.map((position, index) => (
        <GraphicsComponent
          type={GraphicType.RECTANGLE}
          key={`snake-${player.accountId}-${index}`}
          width={CELL_SIZE}
          height={CELL_SIZE}
          position={{
            x: position.x * CELL_SIZE,
            y: position.y * CELL_SIZE,
          }}
          tint={index === 0 ? player.color : player.color}
          alpha={index === 0 ? alpha : alpha * 0.8}
        />
      ))}
    </ContainerComponent>
  );
};

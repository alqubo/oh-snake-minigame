import {
  ContainerComponent,
  GraphicsComponent,
  GraphicType,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";
import { PlayerSnake } from "shared/types";
import { CELL_SIZE } from "shared/consts/snake.consts.ts";

type Props = {
  player: PlayerSnake;
  isLocalPlayer?: boolean;
};

export const PlayerSnakeComponent = ({ player, isLocalPlayer }: Props) => {
  if (!player.alive) {
    return null;
  }

  const head = player.snake[0];

  return (
    <ContainerComponent>
      {head && (
        <TextComponent
          text={player.username}
          position={{
            x: head.x * CELL_SIZE,
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
          alpha={index === 0 ? 1 : 0.8}
        />
      ))}
    </ContainerComponent>
  );
};

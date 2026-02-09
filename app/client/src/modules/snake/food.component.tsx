import { GraphicsComponent, GraphicType } from "@openhotel/pixi-components";
import { Position } from "shared/types";
import { CELL_SIZE } from "shared/consts/snake.consts.ts";

type Props = {
  position: Position;
};

export const FoodComponent = ({ position }: Props) => {
  return (
    <GraphicsComponent
      type={GraphicType.RECTANGLE}
      width={CELL_SIZE}
      height={CELL_SIZE}
      position={{
        x: position.x * CELL_SIZE,
        y: position.y * CELL_SIZE,
      }}
      tint={0xffffff}
    />
  );
};

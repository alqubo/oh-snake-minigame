import React from "react";
import {
  ContainerComponent,
  GraphicsComponent,
  GraphicType,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";
import { TICK_RATE, MIN_TICK_RATE } from "shared/consts/snake.consts.ts";

type Props = {
  speedLevel: number;
  currentTickRate: number;
  gameTimeSeconds: number;
  position: { x: number; y: number };
};

export const SpeedIndicatorComponent = ({
  speedLevel,
  currentTickRate,
  gameTimeSeconds,
  position,
}: Props) => {
  const speedPercentage = Math.round(
    ((TICK_RATE - currentTickRate) / (TICK_RATE - MIN_TICK_RATE)) * 100,
  );

  const getSpeedColor = (percentage: number): number => {
    if (percentage < 30) return 0x50c878;
    if (percentage < 50) return 0xc8b450;
    if (percentage < 70) return 0xffce1b;
    if (percentage < 85) return 0xff7518;
    return 0xff2c2c;
  };

  const speedColor = getSpeedColor(speedPercentage);

  return (
    <ContainerComponent position={position}>
      <TextComponent
        text={`Level ${speedLevel}`}
        position={{ x: 5, y: 0 }}
        tint={speedColor}
      />

      <TextComponent
        position={{ x: 66, y: 0 }}
        text={`Time: ${Math.floor(gameTimeSeconds / 60)}:${String(gameTimeSeconds % 60).padStart(2, "0")}`}
        tint={gameTimeSeconds > 240 ? 0xff0000 : 0xffffff}
      />

      <ContainerComponent position={{ x: 5, y: 9 }}>
        <GraphicsComponent
          type={GraphicType.RECTANGLE}
          width={100}
          height={3}
          alpha={0.3}
          tint={0xffffff}
        />

        <GraphicsComponent
          type={GraphicType.RECTANGLE}
          width={speedPercentage}
          height={3}
          tint={speedColor}
        />
      </ContainerComponent>
    </ContainerComponent>
  );
};

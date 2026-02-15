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
    if (percentage < 30) return 0x00ff00;
    if (percentage < 50) return 0x88ff00;
    if (percentage < 70) return 0xffff00;
    if (percentage < 85) return 0xff8800;
    return 0xff0000;
  };

  const speedColor = getSpeedColor(speedPercentage);

  const minutes = Math.floor(gameTimeSeconds / 60);
  const seconds = gameTimeSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <ContainerComponent position={position}>
      <TextComponent
        text={`Level ${speedLevel}`}
        position={{ x: 5, y: 0 }}
        tint={speedColor}
      />

      <TextComponent
        text={`⏱ ${timeString}`}
        position={{ x: 80, y: 0 }}
        fill={0xaaaaaa}
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
          alpha={0.8}
          tint={speedColor}
        />
      </ContainerComponent>
    </ContainerComponent>
  );
};

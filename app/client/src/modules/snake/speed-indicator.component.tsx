import React from "react";
import {
  ContainerComponent,
  GraphicsComponent,
  GraphicType,
} from "@openhotel/pixi-components";
import { TextComponent } from "shared/components";

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
  const maxSpeed = 100; // TODO: add to consts
  const minSpeed = 30; // TODO: add to consts
  const speedPercentage = Math.round(
    ((maxSpeed - currentTickRate) / (maxSpeed - minSpeed)) * 100,
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
      <GraphicsComponent
        type={GraphicType.RECTANGLE}
        width={120}
        height={50}
        alpha={0.7}
        tint={0x000000}
      />

      <TextComponent text="VELOCIDAD" position={{ x: 10, y: 5 }} />
      <TextComponent
        text={`Nivel ${speedLevel}`}
        position={{ x: 10, y: 15 }}
        tint={speedColor}
        bold={true}
      />

      <TextComponent
        text={`${speedPercentage}%`}
        position={{ x: 70, y: 15 }}
        tint={speedColor}
        bold={true}
      />

      <TextComponent
        text={`⏱ ${timeString}`}
        position={{ x: 10, y: 32 }}
        fill={0xaaaaaa}
      />

      <ContainerComponent position={{ x: 10, y: 27 }}>
        <GraphicsComponent
          type={GraphicType.RECTANGLE}
          width={100}
          height={4}
          alpha={0.3}
          tint={0xffffff}
        />

        <GraphicsComponent
          type={GraphicType.RECTANGLE}
          width={speedPercentage}
          height={4}
          alpha={0.8}
          tint={speedColor}
        />
      </ContainerComponent>
    </ContainerComponent>
  );
};

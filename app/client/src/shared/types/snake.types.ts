export type Position = {
  x: number;
  y: number;
};

export type Direction = {
  x: number;
  y: number;
};

export type PlayerSnake = {
  accountId: string;
  username: string;
  snake: Position[];
  color: number;
  alive: boolean;
  score: number;
  foodEaten: number;
  kills: number;
};

export type GameState = {
  players: Record<string, PlayerSnake>;
  food: Position[];
  speedLevel: number;
  currentTickRate: number;
  gameTimeSeconds: number;
};

export type MoveEvent = {
  direction: Direction;
};

export type SpeedChangedEvent = {
  speedLevel: number;
  tickRate: number;
  gameTimeSeconds: number;
};

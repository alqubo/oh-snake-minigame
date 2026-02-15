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
  clientId: string;
  snake: Position[];
  direction: Direction;
  color: number;
  alive: boolean;
  nextDirection?: Direction;
  score: number;
  foodEaten: number;
  kills: number;
  growthPending: number;
};

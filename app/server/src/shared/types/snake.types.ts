export type Position = {
  x: number;
  y: number;
};

export type Direction = {
  x: number;
  y: number;
};

export enum GameState {
  WAITING = "WAITING",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

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
  invincible: boolean;
  invincibilityEndTime?: number;
};

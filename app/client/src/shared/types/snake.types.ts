export type Position = {
  x: number;
  y: number;
};

export type Direction = {
  x: number;
  y: number;
};

export enum GameStatus {
  WAITING = "WAITING",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export type PlayerSnake = {
  accountId: string;
  username: string;
  snake: Position[];
  color: number;
  alive: boolean;
  score: number;
  foodEaten: number;
  kills: number;
  invincible?: boolean;
};

export type GameState = {
  players: Record<string, PlayerSnake>;
  food: Position[];
  speedLevel: number;
  currentTickRate: number;
  gameTimeSeconds: number;
  status: GameStatus;
  waitingTimeLeft?: number;
  gameOverTimeLeft?: number;
  winner?: {
    accountId: string;
    username: string;
    score: number;
    kills: number;
    color: number;
  };
};

export type MoveEvent = {
  direction: Direction;
};

export type SpeedChangedEvent = {
  speedLevel: number;
  tickRate: number;
  gameTimeSeconds: number;
};

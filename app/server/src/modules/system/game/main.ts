import { users } from "./users.ts";
import { snakeGame } from "./snake-game.ts";

export const game = () => {
  const $users = users();
  const $snakeGame = snakeGame();

  return {
    users: $users,
    snakeGame: $snakeGame,
  };
};

import { System } from "modules/system/main.ts";
import { Event, ServerEvent } from "shared/enums/event.enum.ts";
import {
  BOARD_WIDTH_SIZE,
  BOARD_HEIGHT_SIZE,
  FOOD_COUNT,
  INITIAL_SNAKE_LENGTH,
  TICK_RATE,
  SPEED_INCREASE_INTERVAL,
  SPEED_INCREASE_AMOUNT,
  MIN_TICK_RATE,
} from "shared/consts/snake.consts.ts";
import { Position, Direction, PlayerSnake } from "shared/types/main.ts";

// TODO: random color
const PLAYER_COLORS = [
  0x00cc00, // Verde
  0x0000cc, // Azul
  0xcc0000, // Rojo
  0xcccc00, // Amarillo
  0xcc00cc, // Magenta
  0x00cccc, // Cyan
  0xff8800, // Naranja
  0x8800ff, // Púrpura
];

export const snakeGame = () => {
  const players: Record<string, PlayerSnake> = {};
  let food: Position[] = [];
  let gameLoop: number | null = null;
  let speedIncreaseLoop: number | null = null;
  let nextColorIndex = 0;
  let currentTickRate = TICK_RATE;
  let gameStartTime = 0;
  let speedLevel = 1;

  const randomPosition = (): Position => {
    return {
      x: Math.floor(Math.random() * BOARD_WIDTH_SIZE),
      y: Math.floor(Math.random() * BOARD_HEIGHT_SIZE),
    };
  };

  const isPositionOccupied = (pos: Position): boolean => {
    for (const player of Object.values(players)) {
      if (player.snake.some((p) => p.x === pos.x && p.y === pos.y)) {
        return true;
      }
    }

    return food.some((f) => f.x === pos.x && f.y === pos.y);
  };

  const randomFreePosition = (): Position => {
    let attempts = 0;
    while (attempts < 100) {
      const pos = randomPosition();
      if (!isPositionOccupied(pos)) {
        return pos;
      }
      attempts++;
    }
    return randomPosition();
  };

  const generateFood = () => {
    food = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
      food.push(randomFreePosition());
    }
  };

  const spawnPlayer = (
    accountId: string,
    username: string,
    clientId: string,
  ): PlayerSnake => {
    const startPos = randomFreePosition();
    const snake: Position[] = [];

    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      snake.push({
        x: startPos.x - i,
        y: startPos.y,
      });
    }

    const color = PLAYER_COLORS[nextColorIndex % PLAYER_COLORS.length];
    nextColorIndex++;

    return {
      accountId,
      username,
      clientId,
      snake,
      direction: { x: 1, y: 0 },
      color,
      alive: true,
      score: 0,
      foodEaten: 0,
      kills: 0,
      growthPending: 0,
    };
  };

  const addPlayer = (accountId: string, username: string, clientId: string) => {
    if (players[accountId]) {
      return;
    }

    players[accountId] = spawnPlayer(accountId, username, clientId);

    // TODO: add wait room
    if (Object.keys(players).length === 1) {
      generateFood();
      startGameLoop();
    }

    broadcastGameState();

    // TODO: añadir a la cola de espera si ha empezados
    broadcastToAll(Event.PLAYER_JOINED, {
      accountId,
      username,
    });
  };

  const removePlayer = (accountId: string) => {
    const player = players[accountId];
    if (!player) return;

    delete players[accountId];

    if (Object.keys(players).length === 0) {
      stopGameLoop();
      food = [];
    }

    broadcastToAll(Event.PLAYER_LEFT, {
      accountId,
      username: player.username,
    });
  };

  const updateDirection = (accountId: string, newDirection: Direction) => {
    const player = players[accountId];
    if (!player || !player.alive) return;

    const current = player.direction;

    if (
      (current.x === 1 && newDirection.x === -1) ||
      (current.x === -1 && newDirection.x === 1) ||
      (current.y === 1 && newDirection.y === -1) ||
      (current.y === -1 && newDirection.y === 1)
    ) {
      return;
    }

    player.nextDirection = newDirection;
  };

  const moveSnake = (player: PlayerSnake): boolean => {
    if (!player.alive) return false;

    if (player.nextDirection) {
      player.direction = player.nextDirection;
      player.nextDirection = undefined;
    }

    const head = player.snake[0];
    const newHead: Position = {
      x: head.x + player.direction.x,
      y: head.y + player.direction.y,
    };

    // Wraparound
    newHead.x = (newHead.x + BOARD_WIDTH_SIZE) % BOARD_WIDTH_SIZE;
    newHead.y = (newHead.y + BOARD_HEIGHT_SIZE) % BOARD_HEIGHT_SIZE;

    // Check collision with all snakes
    for (const otherPlayer of Object.values(players)) {
      if (
        otherPlayer.snake.some((p) => p.x === newHead.x && p.y === newHead.y)
      ) {
        player.alive = false;

        // Check if player hit another player (not self-collision)
        if (otherPlayer.accountId !== player.accountId && otherPlayer.alive) {
          // Killer takes all the victim's score and grows accordingly
          const stolenScore = player.score;
          const stolenFood = player.foodEaten;

          otherPlayer.kills++;
          otherPlayer.score += stolenScore;
          otherPlayer.foodEaten += stolenFood;

          // Make the killer grow by the amount of food the victim had eaten
          otherPlayer.growthPending += stolenFood;

          console.log(
            `${otherPlayer.username} killed ${player.username} and stole ${stolenScore} points! Will grow ${stolenFood} segments. New total: ${otherPlayer.score}`,
          );
        } else if (otherPlayer.accountId === player.accountId) {
          console.log(
            `${player.username} committed suicide. No points transferred.`,
          );
        }

        broadcastToAll(Event.PLAYER_DIED, {
          accountId: player.accountId,
          username: player.username,
        });

        // If killed by another player, victim loses all points
        if (otherPlayer.accountId !== player.accountId) {
          return;
        }

        console.log(
          `${player.username} died by self-collision. Score: ${player.score}`,
        );

        if (player.score > 0) {
          console.log(
            `[Snake] Sending reward to ${player.username}: ${player.score} credits`,
          );

          System.worker.emit(ServerEvent.USER_REWARD, {
            clientId: player.clientId,
            amount: player.score,
            reason: `Snake game: ${player.score} credits`,
          });
        }

        // TODO: añadir a la cola de espera
        return false;
      }
    }

    player.snake.unshift(newHead);

    const foodIndex = food.findIndex(
      (f) => f.x === newHead.x && f.y === newHead.y,
    );
    if (foodIndex !== -1) {
      player.foodEaten++;
      player.score++;
      player.growthPending++;
      food[foodIndex] = randomFreePosition();
    }

    if (player.growthPending > 0) {
      player.growthPending--;
    } else {
      player.snake.pop();
    }

    return true;
  };

  const gameTick = () => {
    for (const player of Object.values(players)) {
      if (player.alive) {
        moveSnake(player);
      }
    }

    broadcastGameState();
  };

  const startGameLoop = () => {
    if (gameLoop !== null) return;

    currentTickRate = TICK_RATE;
    speedLevel = 1;
    gameStartTime = Date.now();

    gameLoop = setInterval(gameTick, currentTickRate);

    startSpeedIncreaseLoop();

    console.log(`Game loop started with tick rate: ${currentTickRate}ms`);
  };

  const stopGameLoop = () => {
    if (gameLoop !== null) {
      clearInterval(gameLoop);
      gameLoop = null;
      console.log("Game loop stopped");
    }
    stopSpeedIncreaseLoop();
  };

  const startSpeedIncreaseLoop = () => {
    if (speedIncreaseLoop !== null) return;

    speedIncreaseLoop = setInterval(() => {
      increaseSpeed();
    }, SPEED_INCREASE_INTERVAL);

    console.log(
      `Speed increase loop started (every ${SPEED_INCREASE_INTERVAL}ms)`,
    );
  };

  const stopSpeedIncreaseLoop = () => {
    if (speedIncreaseLoop !== null) {
      clearInterval(speedIncreaseLoop);
      speedIncreaseLoop = null;
    }
  };

  const increaseSpeed = () => {
    const newTickRate = currentTickRate - SPEED_INCREASE_AMOUNT;

    if (newTickRate >= MIN_TICK_RATE) {
      currentTickRate = newTickRate;
      speedLevel++;

      if (gameLoop !== null) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameTick, currentTickRate);
      }

      broadcastToAll(Event.SPEED_CHANGED, {
        speedLevel,
        tickRate: currentTickRate,
        gameTimeSeconds: Math.floor((Date.now() - gameStartTime) / 1000),
      });
    } else {
      console.log(`Maximum speed reached! Level ${speedLevel}`);
    }
  };

  const broadcastGameState = () => {
    const gameState = {
      players: Object.fromEntries(
        Object.entries(players).map(([id, player]) => [
          id,
          {
            accountId: player.accountId,
            username: player.username,
            snake: player.snake,
            color: player.color,
            alive: player.alive,
            score: player.score,
            foodEaten: player.foodEaten,
            kills: player.kills,
          },
        ]),
      ),
      food,
      speedLevel,
      currentTickRate,
      gameTimeSeconds:
        gameStartTime > 0 ? Math.floor((Date.now() - gameStartTime) / 1000) : 0,
    };

    broadcastToAll(Event.GAME_STATE, gameState);
  };

  const broadcastToAll = (event: Event, data: unknown) => {
    for (const player of Object.values(players)) {
      System.worker.emit(ServerEvent.USER_DATA, {
        clientId: player.clientId,
        event,
        message: data,
      });
    }
  };

  return {
    addPlayer,
    removePlayer,
    updateDirection,
    broadcastGameState,
  };
};

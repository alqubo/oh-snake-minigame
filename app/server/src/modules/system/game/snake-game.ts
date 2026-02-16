import { System } from "modules/system/main.ts";
import { Event, ServerEvent } from "shared/enums/event.enum.ts";
import {
  BASE_FOOD_COUNT,
  BOARD_HEIGHT_SIZE,
  BOARD_WIDTH_SIZE,
  FOOD_PER_PLAYER,
  GAME_OVER_COOLDOWN,
  GAME_TIME_LIMIT,
  INACTIVITY_TIMEOUT,
  INITIAL_SNAKE_LENGTH,
  MIN_TICK_RATE,
  SPAWN_GRACE_TIME,
  SPEED_INCREASE_AMOUNT,
  SPEED_INCREASE_INTERVAL,
  TICK_RATE,
  WAITING_ROOM_DURATION,
  WINNER_BONUS,
} from "shared/consts/snake.consts.ts";
import {
  Direction,
  GameState,
  PlayerSnake,
  Position,
} from "shared/types/main.ts";
import { TickerQueue } from "@oh/queue";

// TODO: random color
const PLAYER_COLORS = [
  0xff7444, 0xfff8de, 0xb7bdf7, 0x576a8f, 0xddaed3, 0x6f8f72, 0x9e3b3b,
  0x574964, 0xe5ba41, 0xd2dcb6, 0xfd7979, 0x6fa4af, 0x604652, 0xffdab3,
  0x559e83,
];

export const snakeGame = () => {
  const players: Record<string, PlayerSnake> = {};
  const waitingPlayers: Record<string, PlayerSnake> = {};
  let food: Position[] = [];
  let gameLoopTaskId: number | null = null;
  let speedIncreaseTaskId: number | null = null;
  let waitingRoomTaskId: number | null = null;
  let gameOverTaskId: number | null = null;
  let nextColorIndex = 0;
  let currentTickRate = TICK_RATE;
  let gameStartTime = 0;
  let speedLevel = 1;
  let gameState: GameState = GameState.WAITING;
  let waitingRoomStartTime = 0;
  let gameOverCooldown = false;
  let gameWinner: PlayerSnake | null = null;
  let finalGameTimeSeconds = 0;
  let gameOverStartTime = 0;

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

  const getMinDistanceToSnakes = (pos: Position): number => {
    let minDistance = Infinity;

    for (const player of Object.values(players)) {
      for (const segment of player.snake) {
        const distance =
          Math.abs(pos.x - segment.x) + Math.abs(pos.y - segment.y);
        minDistance = Math.min(minDistance, distance);
      }
    }

    return minDistance;
  };

  const isSafeSpawnPosition = (pos: Position, minDistance: number): boolean => {
    if (isPositionOccupied(pos)) {
      return false;
    }

    return getMinDistanceToSnakes(pos) >= minDistance;
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
    const playerCount = Object.keys(players).length;
    const foodCount = BASE_FOOD_COUNT + playerCount * FOOD_PER_PLAYER;

    food = [];
    for (let i = 0; i < foodCount; i++) {
      food.push(randomFreePosition());
    }
  };

  const adjustFoodCount = () => {
    const playerCount = Object.keys(players).length;
    const targetFoodCount = BASE_FOOD_COUNT + playerCount * FOOD_PER_PLAYER;
    const currentFoodCount = food.length;

    if (currentFoodCount < targetFoodCount) {
      const foodToAdd = targetFoodCount - currentFoodCount;
      for (let i = 0; i < foodToAdd; i++) {
        food.push(randomFreePosition());
      }
    } else if (currentFoodCount > targetFoodCount) {
      food = food.slice(0, targetFoodCount);
    }
  };

  const spawnPlayer = (
    accountId: string,
    username: string,
    clientId: string,
  ): PlayerSnake => {
    const MIN_SPAWN_DISTANCE = 3;
    let startPos: Position;
    let attempts = 0;
    const maxAttempts = 200;

    while (attempts < maxAttempts) {
      startPos = randomPosition();

      let canSpawn = true;

      for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        const segmentPos = {
          x: startPos.x - i,
          y: startPos.y,
        };

        if (segmentPos.x < 0 || segmentPos.x >= BOARD_WIDTH_SIZE) {
          canSpawn = false;
          break;
        }

        if (!isSafeSpawnPosition(segmentPos, MIN_SPAWN_DISTANCE)) {
          canSpawn = false;
          break;
        }
      }

      if (canSpawn) {
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      startPos = randomPosition();
      console.log(
        `${username} spawned at random position (no safe position found after ${maxAttempts} attempts)`,
      );
    }

    const snake: Position[] = [];

    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      snake.push({
        x: startPos!.x - i,
        y: startPos!.y,
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
      invincible: true,
      invincibilityEndTime: Date.now() + SPAWN_GRACE_TIME,
      lastActivityTime: Date.now(),
    };
  };

  const addPlayer = (accountId: string, username: string, clientId: string) => {
    if (players[accountId] || waitingPlayers[accountId]) {
      return;
    }

    if (gameState === GameState.FINISHED && gameOverCooldown) {
      waitingPlayers[accountId] = spawnPlayer(accountId, username, clientId);

      broadcastToAll(Event.PLAYER_JOINED, {
        accountId,
        username,
        waiting: true,
      });

      broadcastGameState();
      return;
    }

    if (gameState === GameState.FINISHED) {
      gameState = GameState.WAITING;
      waitingRoomStartTime = Date.now();
      gameOverCooldown = false;
      gameWinner = null;
      finalGameTimeSeconds = 0;
      gameOverStartTime = 0;
      Object.keys(players).forEach((id) => delete players[id]);
      food = [];
      speedLevel = 1;
      currentTickRate = TICK_RATE;
    }

    if (gameState === GameState.PLAYING) {
      waitingPlayers[accountId] = spawnPlayer(accountId, username, clientId);

      broadcastToAll(Event.PLAYER_JOINED, {
        accountId,
        username,
        waiting: true,
      });

      broadcastGameState();
      return;
    }

    // Add player to game (WAITING state)
    players[accountId] = spawnPlayer(accountId, username, clientId);

    if (Object.keys(players).length === 1) {
      waitingRoomStartTime = Date.now();
      startWaitingRoom();
    }

    broadcastToAll(Event.PLAYER_JOINED, {
      accountId,
      username,
      waiting: false,
    });

    broadcastGameState();
  };

  const removePlayer = (accountId: string) => {
    const player = players[accountId];
    const waitingPlayer = waitingPlayers[accountId];

    if (player) {
      delete players[accountId];

      if (
        Object.keys(players).length === 0 &&
        gameState === GameState.WAITING
      ) {
        stopWaitingRoom();
        food = [];
      }

      if (gameState === GameState.PLAYING) {
        adjustFoodCount();
        checkGameEnd();
      }

      broadcastToAll(Event.PLAYER_LEFT, {
        accountId,
        username: player.username,
      });
    } else if (waitingPlayer) {
      delete waitingPlayers[accountId];

      broadcastToAll(Event.PLAYER_LEFT, {
        accountId,
        username: waitingPlayer.username,
      });
    }
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
    player.lastActivityTime = Date.now();
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

    if (!player.invincible) {
      for (const otherPlayer of Object.values(players)) {
        if (
          otherPlayer.snake.some((p) => p.x === newHead.x && p.y === newHead.y)
        ) {
          player.alive = false;

          if (otherPlayer.accountId !== player.accountId && otherPlayer.alive) {
            const stolenScore = player.score;
            const stolenFood = player.foodEaten;

            otherPlayer.kills++;
            otherPlayer.score += stolenScore;
            otherPlayer.foodEaten += stolenFood;

            otherPlayer.growthPending += stolenFood;
          }

          broadcastToAll(Event.PLAYER_DIED, {
            accountId: player.accountId,
            username: player.username,
          });

          return false;
        }
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

  const checkInactivity = () => {
    if (gameState !== GameState.PLAYING) return false;

    const currentTime = Date.now();
    const inactivePlayers: string[] = [];

    for (const [accountId, player] of Object.entries(players)) {
      if (
        player.alive &&
        currentTime - player.lastActivityTime > INACTIVITY_TIMEOUT
      ) {
        inactivePlayers.push(accountId);
      }
    }

    for (const accountId of inactivePlayers) {
      const player = players[accountId];
      if (!player) continue;

      const inactiveSeconds = Math.floor(
        (currentTime - player.lastActivityTime) / 1000,
      );
      console.log(
        `Player ${player.username} kicked for inactivity (${inactiveSeconds}s)`,
      );

      broadcastToAll(Event.PLAYER_LEFT, {
        accountId: player.accountId,
        username: player.username,
      });

      System.worker.emit(ServerEvent.DISCONNECT_USER, {
        clientId: player.clientId,
        reason: "Inactivity timeout",
      });

      removePlayer(accountId);
    }

    return inactivePlayers.length > 0;
  };

  const gameTick = () => {
    const currentTime = Date.now();

    for (const player of Object.values(players)) {
      if (
        player.invincible &&
        player.invincibilityEndTime &&
        currentTime >= player.invincibilityEndTime
      ) {
        player.invincible = false;
        player.invincibilityEndTime = undefined;
      }

      if (player.alive) {
        moveSnake(player);
      }
    }

    checkInactivity();
    checkGameEnd();
    broadcastGameState();
  };

  const startGameLoop = () => {
    if (gameLoopTaskId !== null) return;

    currentTickRate = TICK_RATE;
    speedLevel = 1;
    gameStartTime = Date.now();

    gameLoopTaskId = System.tasks.add({
      type: TickerQueue.REPEAT,
      repeatEvery: currentTickRate,
      repeats: Number.MAX_SAFE_INTEGER,
      onFunc: gameTick,
    });

    startSpeedIncreaseLoop();
  };

  const stopGameLoop = () => {
    if (gameLoopTaskId !== null) {
      System.tasks.remove(gameLoopTaskId);
      gameLoopTaskId = null;
    }
    stopSpeedIncreaseLoop();
  };

  const startSpeedIncreaseLoop = () => {
    if (speedIncreaseTaskId !== null) return;

    speedIncreaseTaskId = System.tasks.add({
      type: TickerQueue.REPEAT,
      repeatEvery: SPEED_INCREASE_INTERVAL,
      repeats: Number.MAX_SAFE_INTEGER,
      onFunc: increaseSpeed,
    });
  };

  const stopSpeedIncreaseLoop = () => {
    if (speedIncreaseTaskId !== null) {
      System.tasks.remove(speedIncreaseTaskId);
      speedIncreaseTaskId = null;
    }
  };

  const startWaitingRoom = () => {
    if (waitingRoomTaskId !== null) return;

    waitingRoomTaskId = System.tasks.add({
      type: TickerQueue.REPEAT,
      repeatEvery: 1000,
      repeats: Number.MAX_SAFE_INTEGER,
      onFunc: updateWaitingRoom,
    });
  };

  const stopWaitingRoom = () => {
    if (waitingRoomTaskId !== null) {
      System.tasks.remove(waitingRoomTaskId);
      waitingRoomTaskId = null;
    }
  };

  const updateWaitingRoom = () => {
    if (gameState !== GameState.WAITING) {
      stopWaitingRoom();
      return;
    }

    const elapsedTime = Date.now() - waitingRoomStartTime;

    if (elapsedTime >= WAITING_ROOM_DURATION) {
      startGame();
    } else {
      broadcastGameState();
    }
  };

  const startGameOverCountdown = () => {
    if (gameOverTaskId !== null) return;

    gameOverTaskId = System.tasks.add({
      type: TickerQueue.REPEAT,
      repeatEvery: 1000,
      repeats: Number.MAX_SAFE_INTEGER,
      onFunc: updateGameOverCountdown,
    });
  };

  const stopGameOverCountdown = () => {
    if (gameOverTaskId !== null) {
      System.tasks.remove(gameOverTaskId);
      gameOverTaskId = null;
    }
  };

  const updateGameOverCountdown = () => {
    if (gameState !== GameState.FINISHED) {
      stopGameOverCountdown();
      return;
    }

    broadcastGameState();
  };

  const startGame = () => {
    gameState = GameState.PLAYING;
    gameStartTime = Date.now();
    gameWinner = null;
    finalGameTimeSeconds = 0;
    gameOverStartTime = 0;
    stopWaitingRoom();

    Object.entries(players).forEach(([accountId, player]) => {
      players[accountId] = spawnPlayer(
        accountId,
        player.username,
        player.clientId,
      );
    });

    generateFood();
    startGameLoop();

    broadcastToAll(Event.GAME_STARTING, {
      message: "Game is starting!",
    });

    broadcastGameState();
  };

  const checkGameEnd = () => {
    if (gameState !== GameState.PLAYING) return;

    const totalPlayers = Object.keys(players).length;
    const alivePlayers = Object.values(players).filter((p) => p.alive);

    if (alivePlayers.length === 0) {
      endGame(null);
      return;
    }

    if (totalPlayers >= 2 && alivePlayers.length === 1) {
      endGame(alivePlayers[0]);
      return;
    }

    const gameTime = Date.now() - gameStartTime;
    if (gameTime >= GAME_TIME_LIMIT) {
      const allPlayers = Object.values(players);
      if (allPlayers.length === 0) {
        endGame(null);
        return;
      }

      const winner = allPlayers.reduce((prev, current) => {
        if (current.score > prev.score) return current;
        if (current.score === prev.score && current.kills > prev.kills)
          return current;
        return prev;
      });
      endGame(winner);
    }
  };

  const endGame = (winner: PlayerSnake | null) => {
    gameState = GameState.FINISHED;
    gameOverCooldown = true;
    gameWinner = winner;
    gameOverStartTime = Date.now();
    finalGameTimeSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    stopGameLoop();
    stopSpeedIncreaseLoop();

    for (const player of Object.values(players)) {
      if (player.score > 0) {
        System.worker.emit(ServerEvent.USER_REWARD, {
          clientId: player.clientId,
          amount: player.score,
          reason: `Snake game: ${player.score} credits`,
        });
      }
    }

    if (winner && winner.score > 0) {
      const bonus = Math.floor(winner.score * WINNER_BONUS);
      System.worker.emit(ServerEvent.USER_REWARD, {
        clientId: winner.clientId,
        amount: bonus,
        reason: `Snake game winner bonus: ${bonus} credits`,
      });
    }

    broadcastToAll(Event.GAME_FINISHED, {
      winner: winner
        ? {
            accountId: winner.accountId,
            username: winner.username,
            score: winner.score,
            kills: winner.kills,
            foodEaten: winner.foodEaten,
          }
        : null,
    });

    Object.entries(waitingPlayers).forEach(([accountId, player]) => {
      players[accountId] = player;
      delete waitingPlayers[accountId];
    });

    startGameOverCountdown();

    setTimeout(() => {
      gameOverCooldown = false;
      stopGameOverCountdown();
      if (Object.keys(players).length > 0) {
        gameState = GameState.WAITING;
        waitingRoomStartTime = Date.now();
        startWaitingRoom();
        broadcastGameState();
      }
    }, GAME_OVER_COOLDOWN);

    broadcastGameState();
  };

  const increaseSpeed = () => {
    const newTickRate = currentTickRate - SPEED_INCREASE_AMOUNT;

    if (newTickRate >= MIN_TICK_RATE) {
      currentTickRate = newTickRate;
      speedLevel++;

      if (gameLoopTaskId !== null) {
        System.tasks.remove(gameLoopTaskId);
        gameLoopTaskId = System.tasks.add({
          type: TickerQueue.REPEAT,
          repeatEvery: currentTickRate,
          repeats: Number.MAX_SAFE_INTEGER,
          onFunc: gameTick,
        });
      }

      broadcastToAll(Event.SPEED_CHANGED, {
        speedLevel,
        tickRate: currentTickRate,
        gameTimeSeconds: Math.floor((Date.now() - gameStartTime) / 1000),
      });
    }
  };

  const broadcastGameState = () => {
    const elapsedTime =
      gameState === GameState.WAITING ? Date.now() - waitingRoomStartTime : 0;
    const waitingTimeLeft =
      gameState === GameState.WAITING
        ? Math.max(0, Math.ceil((WAITING_ROOM_DURATION - elapsedTime) / 1000))
        : undefined;

    const gameOverElapsedTime =
      gameState === GameState.FINISHED ? Date.now() - gameOverStartTime : 0;
    const gameOverTimeLeft =
      gameState === GameState.FINISHED
        ? Math.max(
            0,
            Math.ceil((GAME_OVER_COOLDOWN - gameOverElapsedTime) / 1000),
          )
        : undefined;

    const allPlayers = { ...players, ...waitingPlayers };

    const gameStateData = {
      players: Object.fromEntries(
        Object.entries(allPlayers).map(([id, player]) => [
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
            invincible: player.invincible,
            waiting: !!waitingPlayers[id],
          },
        ]),
      ),
      food,
      speedLevel,
      currentTickRate,
      gameTimeSeconds:
        gameState === GameState.FINISHED
          ? finalGameTimeSeconds
          : gameStartTime > 0 && gameState === GameState.PLAYING
            ? Math.floor((Date.now() - gameStartTime) / 1000)
            : 0,
      status: gameState,
      waitingTimeLeft,
      gameOverTimeLeft,
      winner: gameWinner
        ? {
            accountId: gameWinner.accountId,
            username: gameWinner.username,
            score: gameWinner.score,
            kills: gameWinner.kills,
            color: gameWinner.color,
          }
        : undefined,
    };

    broadcastToAll(Event.GAME_STATE, gameStateData);
  };

  const broadcastToAll = (event: Event, data: unknown) => {
    const allPlayers = { ...players, ...waitingPlayers };
    for (const player of Object.values(allPlayers)) {
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

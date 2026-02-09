export enum Event {
  GAME_OVER = "game_over",
  SNAKE_MOVE = "snake_move",
  GAME_STATE = "game_state",
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  PLAYER_DIED = "player_died",
  SPEED_CHANGED = "speed_changed",

  $$SETTINGS = "$$settings",
}

export enum ServerEvent {
  PING = "PING",
  PONG = "PONG",

  USER_JOIN = "USER_JOIN",
  USER_LEAVE = "USER_LEAVE",
  USER_DATA = "USER_DATA",
  USER_READY = "USER_READY",

  USER_REWARD = "USER_REWARD",

  DISCONNECT_USER = "DISCONNECT_USER",
}

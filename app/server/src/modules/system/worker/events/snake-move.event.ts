import { Event } from "shared/enums/event.enum.ts";
import { EventType } from "shared/types/event.types.ts";

export const snakeMoveEvent: EventType = {
  event: Event.SNAKE_MOVE,
  func: ({ user, data }) => {
    user.handleSnakeMove(data);
  },
};

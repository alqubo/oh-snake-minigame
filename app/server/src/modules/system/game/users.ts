import { User, UserMutable } from "shared/types/user.types.ts";
import { System } from "modules/system/main.ts";
import { Event, ServerEvent } from "shared/enums/event.enum.ts";

export const users = () => {
  let $userMap: Record<string, UserMutable> = {};

  const $getUser = (user: User): UserMutable => {
    const getAccountId = () => user.accountId;
    const getUsername = () => user.username;

    const log = (...data: string[]) => {
      console.log(`${getUsername()} ${data.join(" ")}`);
    };

    const ready = () => {
      log("ready");

      System.game.snakeGame.addPlayer(
        user.accountId,
        user.username,
        user.clientId,
      );
    };

    const emit = (event: Event, message?: unknown) => {
      System.worker.emit(ServerEvent.USER_DATA, {
        clientId: user.clientId,
        event,
        message,
      });
    };

    const close = () => {
      System.worker.emit(ServerEvent.DISCONNECT_USER, {
        clientId: user.clientId,
      });
    };

    const handleSnakeMove = (data: unknown) => {
      if (data && typeof data === "object" && "direction" in data) {
        System.game.snakeGame.updateDirection(
          user.accountId,
          data.direction as { x: number; y: number },
        );
      }
    };

    return {
      getAccountId,
      getUsername,

      log,

      ready,
      emit,
      close,

      handleSnakeMove,
    };
  };

  const add = (user: User) => {
    const $user = $getUser(user);
    $userMap[user.accountId] = $user;
    $user.log("joined");
  };

  const remove = (accountId: string) => {
    const $user = $userMap[accountId];
    if ($user) {
      $user.log("left");

      System.game.snakeGame.removePlayer(accountId);
      delete $userMap[accountId];
    }
  };

  const get = (accountId: string): UserMutable | null => {
    return $userMap[accountId];
  };

  const getList = async () => Object.values($userMap);

  return {
    add,
    remove,

    get,
    getList,
  };
};

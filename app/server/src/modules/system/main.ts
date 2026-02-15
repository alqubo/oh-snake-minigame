import { Envs } from "shared/types/main.ts";
import { getRandomString, DbMutable, getDb } from "@oh/utils";
import { tasks } from "./tasks.ts";
import { updater } from "./updater.ts";
import { game } from "./game/main.ts";
import { worker } from "./worker/main.ts";
import { ulid } from "@std/ulid";
import { parseArgs } from "@std/cli/parse-args";
import { settings } from "modules/system/settings.ts";

export const System = (() => {
  let $envs: Envs;
  let $debug = false;

  let $id = ulid();

  const $token = getRandomString(16);

  const $updater = updater();
  const $tasks = tasks();
  const $worker = worker();
  const $settings = settings();
  const $db: DbMutable = getDb({ pathname: `./database` });

  const $game = game();

  const load = async (envs: Envs) => {
    $envs = envs;
    //
    const { gameId } = parseArgs(Deno.args);
    $id = gameId;

    await $settings.load(envs);
    await $updater.load();
    //

    await $db.load();
    /**
     * /!\ Important to start a loop to prevent the server to exit /!\
     */
    $tasks.load();

    // await $internalProxy.load();

    $worker.load();
  };

  const getEnvs = () => $envs;

  const getToken = () => $token;
  const isTokenValid = (token: string) => $token === token;

  const isDevelopment = () => $envs.version === "development";
  const isDebug = () => $debug;

  const getGameId = () => $id;

  return {
    load,

    getEnvs,

    getToken,
    isTokenValid,

    isDevelopment,
    isDebug,

    getGameId,

    game: $game,
    worker: $worker,
    settings: $settings,
    tasks: $tasks,
  };
})();

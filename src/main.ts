import { ErrorMapper } from "utils/ErrorMapper";
import extendRoom from "./rooms/extend.room";
import extendStructure from "./structures/extend.structure";
import getStatefulRoom from "./rooms/StatefulRoom";

import log from "utils/log";
//@ts-ignore
import watcher from "utils/watcher-client";
//@ts-ignore
import profiler from "./utils/screeps-profiler";
//@ts-ignore
import exportStats from "utils/screeps-grafana";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: boolean;
    watch: any;
    structures: {
      [structureId: string]: StructureMemory;
    };
  }

  // Syntax for adding properties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      player: string;
      log: any;
    }
  }
}

global.player = "leoric-crown";
global.log = log;
// Extend Room prototype
extendRoom();
extendStructure();

const baseLoop = () => {
  global.log(
    `-----------------------start of game tick ${Game.time}-----------------------`
  );

  // Initialize custom structures memory
  Memory.structures = Memory.structures || {} as StructureMemory


  const stateful = getStatefulRoom(Game.rooms["W8N6"]);
  stateful.run();

  // const username = "leoric-crown";
  // const room = getStatefulRoom("W8N6", username);
  // room.run();

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  // Automatically delete memory of missing structures
  for (const id in Memory.structures) {
    if (!(id in Game.structures)) {
      delete Memory.structures[id];
    }
  }

  exportStats();
  watcher();

  global.log(`CPU Used this tick: ${Game.cpu.getUsed()}. Bucket: ${Game.cpu.bucket}`);
  global.log(
    `------------------------end of game tick ${Game.time}------------------------`
  );
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
let _loop;
if (profiler !== undefined) {
  profiler.enable();
  _loop = () => {
    profiler.wrap(ErrorMapper.wrapLoop(baseLoop));
  };
} else {
  _loop = ErrorMapper.wrapLoop(baseLoop);
}

export const loop = _loop;

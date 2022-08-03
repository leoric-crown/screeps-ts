import { ErrorMapper } from "utils/ErrorMapper";
import extendRoom from "./rooms/extend.room";
import extendStructure from "./structures/extend.structure";
import extendCreep from "./creeps/extend.creep";
import getStatefulRoom from "./rooms/StatefulRoom";

import getLog from "utils/log";
//@ts-ignore
import watcher from "utils/watcher-client";
//@ts-ignore
import profiler from "./utils/screeps-profiler";
//@ts-ignore
import exportStats from "utils/screeps-grafana";

declare global {
  interface Memory {
    uuid: number;
    log: boolean;
    watch: any;
    structures: {
      [structureId: string]: StructureMemory;
    };
  }

  namespace NodeJS {
    interface Global {
      player: string;
      log: any;
    }
  }
}

global.player = "leoric-crown";
global.log = getLog();
// Extend Room prototype
extendRoom();
extendStructure();
extendCreep();

const baseLoop = () => {
  global.log(
    `-----------------------start of game tick ${Game.time}-----------------------`
  );

  // Initialize custom structures memory
  Memory.structures = Memory.structures || ({} as StructureMemory);

  const room = getStatefulRoom(Game.rooms["W8N3"]);
  room.run();

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

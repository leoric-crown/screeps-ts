import { CreepRole, CreepType } from "./types/Creeps";
import { ErrorMapper } from "utils/ErrorMapper";
import ExtendedRoom from "./extend/ExtendedRoom";
import spawner from "./spawner";
import creepConfigs from "./creeps/creeps.config";
import CreepManager from "./creeps/CreepManager";
import StructureManager from './structures/StructureManager';
import ExtendedStructure, { StructureMemory } from "extend/ExtendedStructure";
import { CreepTarget } from "extend/ExtendedCreep";

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
    log: any;
    structure: {
      [structureId: string]: StructureMemory
    }
  }

  interface CreepMemory {
    type: CreepType;
    role: CreepRole;
    state?: number;
    target?: Id<_HasId>;
    room?: Id<_HasId>;
    working?: boolean;
  }

  // Syntax for adding properties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(
    `-----------------------start of game tick ${Game.time}-----------------------`
  );

  const room = new ExtendedRoom(Game.rooms["W8N6"]);
  console.log(`room energy available: ${room.energyAvailable}/${room.energyCapacityAvailable}`);
  Memory.log = { ...Memory.log, room };
  Memory.structure = {};

  const creepManager = new CreepManager(room);
  spawner(room, creepConfigs);
  const structureManager = new StructureManager(room);
  // Run all creeps in the room
  creepManager.run();
  // Run all managed structures in the room
  structureManager.run();

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  console.log(
    `------------------------end of game tick ${Game.time}------------------------`
  );
});

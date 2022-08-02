import CreepManager from "../creeps/CreepManager";
import configData, { CreepConfig } from "../creeps/creeps.config";
import StructureManager from "../structures/StructureManager";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

declare global {
  interface StatefulRoom extends Room {
    creepManager: CreepManager;
    structureManager: StructureManager;
    creepConfigs: CreepConfig[];

    // states: RoomState
    rcl: number; // refactor to prototype of Room
    activeSources: Source[];

    // Energy management
    minAvailableEnergy: number;
    supplyQueue: ManagedStructure[];
    buildQueue: ConstructionSite[];
    repairQueue: Structure[];

    // Defense
    underAttack: boolean;
    attackTargets: Creep[];

    // State
    // state: RoomState;

    run: () => void;
  }
}

// class RoomState {
//   creepConfig: CreepConfig[];

//   constructor (room: Room) {
//     room.minAvailableEnergy = 650;
//     this.creepConfig = creepConfigs;
//   }

// }

let _getStatefulRoom = (room: Room) => {
  const extend: any = {};
  extend.creepManager = new CreepManager(room);

  extend.rcl = room.controller?.level || 0;
  extend.activeSources = room.sources.filter(source => source.energy > 0);

  extend.supplyQueue = room.structuresToFill;
  extend.buildQueue = room.buildables;
  const { roads, defenses, others } = room.damagedStructures;
  extend.repairQueue = { ...roads, ...defenses, ...others };

  extend.underAttack = room.creeps.hostile.length > 0;
  extend.attackTargets = room.creeps.hostile;


  const statefulRoom = _.extend(room, extend) as StatefulRoom;
  statefulRoom.structureManager = new StructureManager(statefulRoom);

  let _run = function (this: StatefulRoom) {
    global.log(
      `Room: [room ${this.name}] - numStructuresToFill=${this.structuresToFill.length}, energyInStorage: ${this.energyInStorage}, energyAvailable: ${this.energyAvailable} / ${this.energyCapacityAvailable}, minAvailableEnergy: ${this.memory.minAvailableEnergy}`
    );
    global.log(
      `Room: [room ${this.name}] - numManagedStructures=${this.managedStructures.length}, numExtensions=${this.extensions.length}, numLoadables=${this.loadables.length}, damagedStructures=${this.damagedStructures.total}`
    );
    this.structureManager.run();
    this.creepManager.run();
  };
  _run = _run.bind(statefulRoom);
  if (profiler) {
    _run = profiler.registerFN(_run, "Room.run");
  }
  statefulRoom.run = _run;

  return statefulRoom;
};
if (profiler) _getStatefulRoom = profiler.registerFN(_getStatefulRoom, "getStatefulRoom");

export default _getStatefulRoom;

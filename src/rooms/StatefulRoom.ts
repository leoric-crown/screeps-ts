import CreepManager from "../creeps/CreepManager";
import creepConfigs, { CreepConfig } from "../creeps/creeps.config";
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

    run: () => void;
  }
}

let _getStatefulRoom = (room: Room) => {
  const extend: any = {};
  extend.creepManager = new CreepManager(room);
  extend.structureManager = new StructureManager(room);
  extend.creepConfigs = creepConfigs;

  extend.rcl = room.controller?.level || 0;
  extend.activeSources = room.sources.filter(source => source.energy > 0);

  extend.minAvailableEnergy = 650;
  extend.supplyQueue = room.structuresToFill;
  extend.buildQueue = room.buildables;
  const { roads, defenses, others } = room.damagedStructures;
  extend.repairQueue = { ...roads, ...defenses, ...others };

  extend.underAttack = room.creeps.hostile.length > 0;
  extend.attackTargets = room.creeps.hostile;

  let _run = () => {
    global.log(
      `Room: [room ${room.name}] - numStructuresToFill=${room.structuresToFill.length}, energyInStorage: ${room.energyInStorage}, energyAvailable: ${room.energyAvailable} / ${room.energyCapacityAvailable}`
    );
    global.log(
      `Room: [room ${room.name}] - numManagedStructures=${room.managedStructures.length}, numExtensions=${room.extensions.length}, numLoadables=${room.loadables.length}, damagedStructures=${room.damagedStructures.total}`
    );
    extend.structureManager.run();
    extend.creepManager.run();
  };
  if (profiler) {
    _run = profiler.registerFN(_run, "Room.run");
  }
  extend.run = _run;

  return _.extend(room, extend) as StatefulRoom;
};
if (profiler) _getStatefulRoom = profiler.registerFN(_getStatefulRoom, "getStatefulRoom")

export default _getStatefulRoom;

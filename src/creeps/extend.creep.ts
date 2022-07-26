import { StateCode, CreepType, CreepRole } from "../types/States";
import { getBuilderCreep, getHarvesterCreep, getHaulerCreep, getUpgraderCreep } from ".";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

declare global {
  interface CreepMemory {
    type: CreepType;
    role: CreepRole;
    state?: number;
    target?: Id<_HasId>;
  }

  type CreepState = {
    code: StateCode;
    run: () => void;
    transition: () => void;
  };

  type CreepRoleStates =
    | BuilderRoleStates
    | HarvesterRoleStates
    | HaulerRoleStates
    | UpgraderRoleStates;

  type CreepTarget = Creep | ConstructionSite | Structure;

  interface Creep {
    mine: boolean;

    state?: StateCode;
    type?: CreepType;
    role?: CreepRole;

    states?: CreepRoleStates;

    updateStateCode: (code: StateCode, message?: string) => void;
    getState: () => CreepState;
    harvestProc: () => void;
    upgradeProc: () => void;
    loadProc: (filter?: (structure: Structure) => boolean) => void;
    loadSelfProc: () => void;
    buildProc: () => void;
    haulProc: () => void;
    loadStructureProc: () => void;
  }
}

const creepProcs = {
  harvestProc: function (this: Creep) {
    const targetSource = this.pos.findClosestByPath(
      this.room.sources.filter(source => source.energy > 0)
    );
    if (targetSource && this.harvest(targetSource) === ERR_NOT_IN_RANGE) {
      this.moveTo(targetSource, {
        visualizePathStyle: { stroke: "#ffffff" }
      });
    }
  },
  upgradeProc: function (this: Creep) {
    if (
      this.room.controller &&
      this.upgradeController(this.room.controller) === ERR_NOT_IN_RANGE
    ) {
      this.moveTo(this.room.controller);
    }
  },
  loadProc: function (this: Creep, filter?: (structure: Structure) => boolean) {
    const targets = filter ? this.room.loadables.filter(filter) : this.room.loadables;

    let target: LoadableStructure | undefined = undefined;
    if (this.memory.target) {
      const fetchedObject = Game.getObjectById(
        this.memory.target as Id<LoadableStructure>
      );
      target = (fetchedObject as LoadableStructure) || undefined;
      if (target && target.store.getFreeCapacity() === 0) target = undefined;
    }

    if (target == undefined)
      target = this.pos.findClosestByPath(targets) || this.room.spawns[0];
    const tryLoad = this.transfer(target as LoadableStructure, RESOURCE_ENERGY);
    if (tryLoad === ERR_NOT_IN_RANGE) {
      this.moveTo(target, {
        visualizePathStyle: { stroke: "#ffffff" }
      });
    } else if (tryLoad === ERR_FULL) {
      this.memory.target = undefined;
    }
  },
  loadSelfProc: function (this: Creep) {
    const target =
      this.pos.findClosestByPath(
        [...this.room.spawns, ...this.room.extensions].filter(
          structure => structure.energy > 0
        )
      ) || this.room.spawns[0];
    const tryWithdraw = this.withdraw(target, RESOURCE_ENERGY);
    if (tryWithdraw === ERR_NOT_IN_RANGE) {
      this.moveTo(target);
    }
  },
  buildProc: function (this: Creep) {
    if (this.room.buildables.length > 0) {
      const tryBuild = this.build(this.room.buildables[0]);
      if (tryBuild === ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.buildables[0], {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    }
  },
  haulProc: function (this: Creep) {
    let target: LoadableStructure | undefined = undefined;
    if (this.memory.target) {
      const fetchedObject = Game.getObjectById(
        this.memory.target as Id<LoadableStructure>
      );
      target = (fetchedObject as LoadableStructure) || undefined;
      if (target && target.store.getFreeCapacity() === 0) target = undefined;
    }
    if (target == undefined) {
      const findTarget =
        this.pos.findClosestByPath(this.room.containersAndStorage, {
          filter: structure => structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        }) || undefined;
      if (findTarget) {
        target = findTarget;
        this.memory.target = findTarget.id;
      }
    }

    if (target !== undefined) {
      const tryWithdraw = this.withdraw(
        target as StructureContainer | StructureStorage,
        RESOURCE_ENERGY
      );
      if (tryWithdraw === ERR_NOT_IN_RANGE) {
        this.moveTo(target);
      } else if (tryWithdraw === ERR_NOT_ENOUGH_ENERGY) {
        this.memory.target = undefined;
      }
    }
  },
  loadStructureProc: function (this: Creep) {
    const targets = this.room.managedStructures
      .filter(
        structure =>
          structure.store.getFreeCapacity() !== 0 &&
          structure.structureType !== STRUCTURE_SPAWN
      )
      .sort((a, b) => (a.store.energy < b.store.energy ? -1 : 1))
      .filter((structure, idx, structures) => {
        return structure.store.energy === structures[0].store.energy;
      });

    const target = this.pos.findClosestByPath(targets);
    if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) >= 50) {
      if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
        this.moveTo(target);
    }
  }
};

const stateCodeMap = function (creep: Creep) {
  const map: { [stateCode: number]: CreepState } = {};
  if (creep.states)
    Object.values(creep.states).forEach(state => {
      map[state.code] = state;
    });
  return map;
};

const extendCreep = function () {
  Object.defineProperty(Creep.prototype, "mine", {
    get: function () {
      return this.owner.username === global.player;
    }
  });

  Object.defineProperty(Creep.prototype, "updateStateCode", {
    value: function (code: StateCode, message?: string) {
      this.memory.state = code;
      this.memory.target = undefined;
      if (message) this.say(message);
    },
    enumerable: true,
    writable: true,
    configurable: true
  });

  Object.defineProperty(Creep.prototype, "getState", {
    value: function () {
      let state = {} as CreepState;
      Object(this.memory).hasOwnProperty("state") &&
        (state = stateCodeMap(this)[this.memory.state as number]);
      return state;
    },
    enumerable: true,
    writable: true,
    configurable: true
  });

  Object.defineProperty(Creep.prototype, "state", {
    get: function () {
      return this.memory.state as StateCode;
    },
    set: function (value: StateCode) {
      this.memory.state = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Creep.prototype, "type", {
    get: function () {
      return this.memory.type as CreepType;
    },
    set: function (value: CreepType) {
      this.memory.type = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Creep.prototype, "role", {
    get: function () {
      return this.memory.role as CreepRole;
    },
    set: function (value: CreepRole) {
      this.memory.role = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Creep.prototype, "states", {
    writable: true,
    enumerable: true,
    configurable: true
  });

  for (let [name, proc] of Object.entries(creepProcs)) {
    Object.defineProperty(Creep.prototype, name, {
      get: function () {
        return proc.bind(this);
      },
      enumerable: true,
      configurable: true
    });
  }
};

let _getStatefulCreep = function (creep: Creep) {
  if (!creep.mine) {
    throw new Error("Can't get state (memory) from hostile creep");
  }
  switch (creep.role) {
    case CreepRole.BUILDER:
      return getBuilderCreep(creep);
    case CreepRole.HARVESTER:
      return getHarvesterCreep(creep);
    case CreepRole.HAULER:
      return getHaulerCreep(creep);
    case CreepRole.UPGRADER:
      return getUpgraderCreep(creep);
    default:
      throw new Error(`Creep role: ${creep.role} did not match any StatefulCreep getter`);
  }
};
if (profiler)
  _getStatefulCreep = profiler.registerFN(_getStatefulCreep, "getStatefuleCreep");

export const getStatefulCreep = _getStatefulCreep;

export default extendCreep;

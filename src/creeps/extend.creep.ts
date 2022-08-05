import { StateCode, CreepType, CreepRole, ContainerType } from "../types/States";
import {
  getBuilder,
  getHarvester,
  getSourceHauler,
  getUpgraderCreep,
  getRemoteHarvester,
  getRemoteHauler,
  getSupplier
} from ".";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

declare global {
  interface CreepMemory {
    type: CreepType;
    role: CreepRole;
    config: number;
    state?: number;
    target?: Id<Creep | AnyStoreStructure | Source | StructureController>;
    remoteRoom?: string;
    deposit?: [Id<AnyStoreStructure>];
    home?: string;
    destination?: { x: number; y: number; roomName: string };
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
    | UpgraderRoleStates
    | RemoteHarvesterStates
    | SupplierRoleStates;

  type CreepTarget = Creep | ConstructionSite | Structure;

  interface Creep {
    mine: boolean;

    state?: StateCode;
    type?: CreepType;
    role?: CreepRole;

    destination?: RoomPosition;

    states?: CreepRoleStates;

    updateStateCode: (code: StateCode, message?: string) => void;
    getState: () => { stateName: string | undefined; state: CreepState | undefined };
    moveProc: () => void;
    harvestProc: (source?: Source) => void;
    upgradeProc: () => void;
    loadProc: (filter?: (structure: Structure) => boolean) => void;
    loadSelfProc: (target?: Structure) => void;
    buildProc: () => void;
    haulProc: (sources: Creep[]) => void;
    supplyProc: (creepRole: CreepRole) => void;
    loadStructureProc: () => void;
  }
}

const creepProcs = {
  moveProc: function (this: Creep) {
    const target =
      this.memory.destination ||
      (this.memory.target ? Game.getObjectById(this.memory.target)?.pos : undefined);
    if (target) {
      // const moveTarget = Game.getObjectById(target);
      const { x, y, roomName } = target;
      const tryMoveTo = this.moveTo(new RoomPosition(x, y, roomName), {
        visualizePathStyle: { stroke: "#ffffff" }
      });
    } else throw new Error(`in moveProc: Creep ${this.name} has no target to move to`);
  },
  harvestProc: function (this: Creep, source?: Source) {
    if (this.memory.target) {
      const targetSource =
        source || this.room.sources.find(source => source.id === this.memory.target);
      if (targetSource) {
        const tryHarvest = this.harvest(targetSource);
        if (tryHarvest === ERR_NOT_IN_RANGE) {
          this.moveTo(targetSource, {
            visualizePathStyle: { stroke: "#ffffff" }
          });
        }
      }
    } else throw new Error(`in harvestProc: Creep ${this.name} has no target source`);
  },
  loadProc: function (this: Creep, filter?: (structure: AnyStoreStructure) => boolean) {
    let target = undefined;
    if (this.room.energyAvailable < this.room.minAvailableEnergy) {
      const targetLoadables = filter
        ? this.room.loadables.filter(filter)
        : this.room.loadables;
      target = this.pos.findClosestByPath(targetLoadables) || this.room.spawns[0];
    } else {
      const nonFullDeposits = this.room.containers.filter(x => {
        return (
          x.store.getFreeCapacity() > 0 &&
          x.memory.containerType === ContainerType.DEPOSIT
        );
      });

      if (nonFullDeposits.length > 0) {
        const targetDeposits = filter ? nonFullDeposits.filter(filter) : nonFullDeposits;
        targetDeposits.length > 0 &&
          (target = this.pos.findClosestByPath(targetDeposits));
      }
    }

    if (!target) {
      const targetLoadables = filter
        ? this.room.loadables.filter(filter)
        : this.room.loadables;
      target = this.pos.findClosestByPath(targetLoadables) || this.room.spawns[0];
    }

    if (target) {
      const tryLoad = this.transfer(target as LoadableStructure, RESOURCE_ENERGY);
      if (tryLoad === ERR_NOT_IN_RANGE) {
        this.moveTo(target, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    } else
      throw new Error(
        `In loadProc: Creep ${this.name} found no suitable target for loading`
      );
  },
  // rename this to something more descriptive, this procedure loads energy from creeps into creep store
  haulProc: function (this: Creep, sources: Creep[]) {
    if (this.memory.target) {
      const target = Game.getObjectById(this.memory.target);
      if (target) {
        const rangeToTarget = this.pos.getRangeTo(target);
        if (rangeToTarget > 10) this.moveTo(target);
        else {
          const sorted = sources
            .filter(creep => creep.id !== this.id && creep.store.energy > 0)
            .sort((a, b) => {
              return a.store.energy > b.store.energy ? -1 : 1;
            });
          const transferTarget = sorted[0] || undefined;
          if (transferTarget) {
            if (this.pos.getRangeTo(transferTarget) > 1) {
              this.moveTo(transferTarget);
            } else {
              transferTarget.transfer(this, RESOURCE_ENERGY);
            }
          }
        }
      }
    }
  },
  supplyProc: function (this: Creep, creepRole: CreepRole) {
    if (this.memory.target) {
      const target = Game.getObjectById(this.memory.target);
      if (target) {
        if (this.pos.getRangeTo(target) > 10) this.moveTo(target);
        else {
          const creeps = this.room.creeps.mine
            .filter(
              creep => creep.role === creepRole && creep.pos.getRangeTo(target) <= 5
            )
            .sort((a, b) => {
              return a.store.energy < b.store.energy ? -1 : 1;
            });
          const transferTarget = creeps[0] || undefined;
          if (transferTarget) {
            if (this.pos.getRangeTo(transferTarget) > 1) {
              this.moveTo(transferTarget);
            } else {
              this.transfer(transferTarget, RESOURCE_ENERGY);
            }
          }
        }
      }
    }
  },
  upgradeProc: function (this: Creep) {
    if (this.room.controller) {
      if (this.upgradeController(this.room.controller) === ERR_NOT_IN_RANGE)
        this.moveTo(this.room.controller);
    } else {
      throw new Error(`No controller in room for Upgrader creep ${this.name}`);
    }
  },
  loadSelfProc: function (this: Creep, target?: AnyStoreStructure) {
    if (!target) {
      const targetContainer = this.pos.findClosestByPath(
        this.room.containers.filter(container => container.store.energy > 0)
      );
      targetContainer && (target = targetContainer);

      !target &&
        (target =
          this.pos.findClosestByPath(
            [...this.room.spawns, ...this.room.extensions].filter(
              structure => structure.energy > 0
            )
          ) || this.room.spawns[0]);
    }
    if (target) {
      const tryWithdraw = this.withdraw(target, RESOURCE_ENERGY);
      if (tryWithdraw === ERR_NOT_IN_RANGE) {
        this.moveTo(target);
      }
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

const extendCreep = function () {
  Object.defineProperty(Creep.prototype, "mine", {
    get: function () {
      return this.owner.username === global.player;
    }
  });

  Object.defineProperty(Creep.prototype, "updateStateCode", {
    value: function (code: StateCode, message?: string) {
      this.memory.state = code;
      if (message) this.say(message);
    },
    enumerable: true,
    writable: true,
    configurable: true
  });

  Object.defineProperty(Creep.prototype, "getState", {
    value: function () {
      const stateCode = this.memory.state;
      let stateName: string | undefined = undefined;
      const state = _.find(this.states, (value: CreepState, index: string) => {
        stateName = index;
        return value.code === stateCode;
      });
      if (stateCode !== undefined && state && stateName) {
        return { stateName, state };
      } else {
        return { stateName: undefined, state: undefined };
      }
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

  Object.defineProperty(Creep.prototype, "destination", {
    get: function () {
      if (!this.memory.destination) {
        return undefined;
      } else if (!this._destination) {
        const { x, y, roomName } = this.memory.destination;
        this._destination = new RoomPosition(x, y, roomName);
      }
      return this._destination;
    },
    set: function (value: { x: number; y: number; roomName: string }) {
      this.memory.destination = value;
    }
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
      return getBuilder.bind(creep)();
    case CreepRole.HARVESTER:
      return getHarvester.bind(creep)();
    case CreepRole.HAULER:
      return getSourceHauler.bind(creep)();
    case CreepRole.UPGRADER:
      return getUpgraderCreep.bind(creep)();
    case CreepRole.REMOTE_HARVESTER:
      return getRemoteHarvester.bind(creep)();
    case CreepRole.REMOTE_HAULER:
      return getRemoteHauler.bind(creep)();
    case CreepRole.SUPPLIER:
      return getSupplier.bind(creep)();
    default:
      throw new Error(`Creep role: ${creep.role} did not match any StatefulCreep getter`);
  }
};
if (profiler)
  _getStatefulCreep = profiler.registerFN(_getStatefulCreep, "getStatefulCreep");

export const getStatefulCreep = _getStatefulCreep;

export default extendCreep;

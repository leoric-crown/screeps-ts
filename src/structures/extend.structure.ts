import { StateCode } from "../types/States";
import getStatefulTower, { TowerStates } from "./classes/Tower";
import extendSpawn, { getStatefulSpawn, SpawnerStates } from "./classes/Spawn";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

type StructureStates = BaseStructureStates | SpawnerStates | TowerStates;

declare global {
  interface StructureMemory {
    state?: StateCode;
  }

  interface Structure {
    memory: StructureMemory;
  }

  interface BaseStructureStates {
    init: StructureState;
  }

  type StructureState = {
    code: StateCode;
    run: () => void;
    transition: () => void;
  };

  interface StatefulStructure extends Structure {
    updateStateCode: (code: StateCode, message?: string) => void;
    getState: () => { stateName: string | undefined; state: StructureState | undefined };

    states?: StructureStates;
  }
}

const structureMemoryPropDesc: PropertyDescriptor = {
  get: function (this: Structure) {
    if (_.isUndefined(Memory.structures)) {
      Memory.structures = {} as {
        [structureId: string]: StructureMemory;
      };
    }
    if (!_.isObject(Memory.structures)) {
      return undefined;
    }
    return (Memory.structures[this.id] = Memory.structures[this.id] || {});
  },
  set: function (this: Structure, value: StructureMemory) {
    if (_.isUndefined(Memory.structures)) {
      Memory.structures = {} as {
        [structureId: string]: StructureMemory;
      };
    }
    if (!_.isObject(Memory.structures)) {
      throw new Error("Could not set structure memory:" + this.id);
    }
    Memory.structures[this.id] = value;
  },
  configurable: true
};

const extendStructure = function () {
  Object.defineProperty(Structure.prototype, "memory", structureMemoryPropDesc);

  Object.defineProperty(Structure.prototype, "updateStateCode", {
    value: function (code: StateCode, message?: string) {
      this.memory.state = code;
      if (message)
        global.log(
          `Message from ${this.structureType} structure (id: ${this.id}): ${message}, new state code: ${code}`
        );
    },
    writable: true,
    configurable: true
  });

  Object.defineProperty(Structure.prototype, "getState", {
    value: function () {
      const stateCode = this.memory.state;
      let stateName: string | undefined = undefined;
      const state = _.find(this.states, (value: StructureState, index: string) => {
        stateName = index;
        return value.code === stateCode;
      });
      if (stateCode !== undefined && state && stateName) {
        return { stateName, state };
      } else {
        return { stateName: undefined, state: undefined };
      }
    },
    writable: true,
    configurable: true
  });

  extendSpawn();
};

let _getStatefulStructure = function (structure: Structure, room: StatefulRoom) {
  let statefulStructure;
  switch (structure.structureType) {
    case STRUCTURE_TOWER:
      statefulStructure = getStatefulTower(structure as StructureTower);
      break;
    case STRUCTURE_SPAWN:
      statefulStructure = getStatefulSpawn(structure as StructureSpawn, room);
      break;
    default:
      throw new Error(
        `There was an error getting StatefulStructure for id: ${structure.id}`
      );
  }

  return statefulStructure;
};
if (profiler)
  _getStatefulStructure = profiler.registerFN(
    _getStatefulStructure,
    "getStatefulStructure"
  );

export const getStatefulStructure = _getStatefulStructure;

export default extendStructure;

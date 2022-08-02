import { BaseCreepStates, StateCode } from "../../types/States";

declare global {
  interface HaulerRoleStates extends BaseCreepStates {
    haul: CreepState;
    load: CreepState;
    loadSelf: CreepState;
    loadStructure: CreepState;
    harvest: CreepState;
  }
}

const getHaulerCreep = function (creep: Creep): Creep {
  const states: HaulerRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (creep.room.energyInStorage > 100) {
          creep.updateStateCode(StateCode.HAUL, "haul");
          return;
        }

        if (creep.room.energyAvailable >= creep.room.minAvailableEnergy) {
          creep.updateStateCode(StateCode.LOADSELF, "loadSelf");
          return;
        }

        creep.updateStateCode(StateCode.HARVEST, "harvest");
      }
    },
    haul: {
      code: StateCode.HAUL,
      run: creep.haulProc,
      transition: () => {
        if (
          creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 ||
          creep.room.energyInStorage === 0
        ) {
          if (
            creep.room.energyAvailable > creep.room.minAvailableEnergy &&
            creep.room.structuresToFill?.length > 0
          ) {
            creep.updateStateCode(StateCode.LOAD_STRUCTURE, "loadStruct");
            return;
          }
          creep.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },
    load: {
      code: StateCode.LOAD,
      run: () =>
        creep.loadProc(
          (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
        ),
      transition: () => {
        if (creep.store.energy === 0) {
          if (
            creep.room.containersAndStorage.length > 0 &&
            creep.room.energyInStorage &&
            creep.room.energyAvailable < creep.room.energyCapacityAvailable * 0.8
          ) {
            creep.updateStateCode(StateCode.HAUL, "haul");
            return;
          }

          if (
            creep.room.structuresToFill.length > 0 &&
            creep.room.energyAvailable >= creep.room.minAvailableEnergy
          ) {
            creep.updateStateCode(StateCode.LOADSELF, "loadself");
            return;
          }
          creep.updateStateCode(StateCode.HARVEST, "harvest");
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: creep.loadSelfProc,
      transition: () => {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          creep.updateStateCode(StateCode.LOAD_STRUCTURE, "loadStruct");
        }
      }
    },
    loadStructure: {
      code: StateCode.LOAD_STRUCTURE,
      run: creep.loadStructureProc,
      transition: () => {
        if (creep.store.energy === 0) {
          if (creep.room.containersAndStorage.length > 0 && creep.room.energyInStorage) {
            creep.updateStateCode(StateCode.HAUL, "haul");
            return;
          }

          if (
            creep.room.structuresToFill &&
            creep.room.energyAvailable >= creep.room.minAvailableEnergy
          ) {
            creep.updateStateCode(StateCode.LOADSELF, "loadself");
            return;
          }

          creep.updateStateCode(StateCode.HARVEST, "harvest");
        } else if (creep.room.structuresToFill.length === 0) {
          creep.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },
    harvest: {
      code: StateCode.HARVEST,
      run: creep.harvestProc,
      transition: () => {
        if (
          creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 ||
          (creep.room.energyAvailable < creep.room.energyCapacityAvailable &&
            creep.room.energyInStorage > 0)
        ) {
          if (creep.store.energy !== 0) {
            if (creep.room.structuresToFill.length > 0) {
              creep.updateStateCode(StateCode.LOAD_STRUCTURE, "loadStruct");
            } else {
              creep.updateStateCode(StateCode.LOAD, "load");
            }
          } else {
            creep.updateStateCode(StateCode.HAUL, "haul");
          }
        }
      }
    }
  };
  creep.states = states;
  return creep;
};

export default getHaulerCreep;

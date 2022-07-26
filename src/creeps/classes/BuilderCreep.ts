import { BaseCreepStates, StateCode } from "../../types/States";

declare global {
  interface BuilderRoleStates extends BaseCreepStates {
    build: CreepState;
    haul: CreepState;
    harvest: CreepState;
    load: CreepState;
    loadSelf: CreepState;
    loadStructure: CreepState;
    upgrade: CreepState;
  }
}

const getBuilderCreep = function (creep: Creep): Creep {
  const states: BuilderRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (
          creep.room.buildables.length > 0 &&
          creep.room.energyAvailable > creep.room.minAvailableEnergy
        ) {
          creep.updateStateCode(StateCode.LOADSELF, "loadSelf in");
        } else {
          creep.updateStateCode(StateCode.HARVEST, "harvest in");
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: creep.loadSelfProc,
      transition: () => {
        if (creep.store.getFreeCapacity() === 0) {
          if (creep.room.buildables.length > 0) {
            creep.updateStateCode(StateCode.BUILD, "build ls");
          } else if (creep.room.structuresToFill.length > 0) {
            creep.updateStateCode(StateCode.LOAD_STRUCTURE, "ls loadStruct");
          } else {
            creep.updateStateCode(StateCode.UPGRADE, "upgrade ls");
          }
        }
      }
    },
    loadStructure: {
      code: StateCode.LOAD_STRUCTURE,
      run: creep.loadStructureProc,
      transition: () => {
        if (creep.store.energy === 0) {
          if (
            creep.room.buildables.length > 0 &&
            creep.room.energyAvailable >= creep.room.minAvailableEnergy
          ) {
            creep.updateStateCode(StateCode.LOADSELF, "loadSelf");
            return;
          }
          if (creep.room.containersAndStorage.length > 0 && creep.room.energyInStorage) {
            creep.updateStateCode(StateCode.HAUL, "haul");
            return;
          }

          if (
            creep.room.structuresToFill &&
            creep.room.energyAvailable >= creep.room.minAvailableEnergy
          ) {
            creep.updateStateCode(StateCode.LOADSELF, "lSt loadSelf");
            return;
          }

          creep.updateStateCode(StateCode.HARVEST, "harvest");
        } else if (creep.room.structuresToFill.length === 0) {
          creep.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },
    build: {
      code: StateCode.BUILD,
      run: creep.buildProc,
      transition: () => {
        if (creep.store.energy === 0) {
          if (creep.room.buildables.length === 0) {
            creep.updateStateCode(StateCode.LOAD, "load");
          } else if (creep.room.energyAvailable < creep.room.minAvailableEnergy) {
            if (creep.room.energyInStorage > 0) {
              creep.updateStateCode(StateCode.HAUL, "haul");
            } else {
              creep.updateStateCode(StateCode.HARVEST, "harvest");
            }
          } else {
            creep.updateStateCode(StateCode.LOADSELF, "loadSelf");
          }
        } else if (creep.room.buildables.length === 0) {
          creep.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },
    haul: {
      code: StateCode.HAUL,
      run: creep.haulProc,
      transition: () => {
        // if no free capacity or no energy in storage
        if (creep.store.getFreeCapacity() === 0 || creep.room.energyInStorage === 0) {
          // DETERMINE THIS STATE
          if (creep.room.energyAvailable >= creep.room.minAvailableEnergy)
            creep.updateStateCode(StateCode.BUILD, "build");
          else creep.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },
    harvest: {
      code: StateCode.HARVEST,
      run: creep.harvestProc,
      transition: () => {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity()) {
          if (creep.room.buildables.length > 0) {
            creep.updateStateCode(StateCode.BUILD, "build hv");
          } else if (creep.room.energyAvailable < creep.room.minAvailableEnergy) {
            creep.updateStateCode(StateCode.LOAD, "load hv");
          } else {
            creep.updateStateCode(StateCode.UPGRADE, "upgrade hv");
          }
        }
      }
    },
    upgrade: {
      code: StateCode.UPGRADE,
      run: creep.upgradeProc,
      transition: () => {
        if (!creep.room.controller) {
          creep.updateStateCode(StateCode.INIT, "reset");
        } else if (creep.store.energy === 0) {
          if (creep.room.energyAvailable < creep.room.minAvailableEnergy) {
            creep.updateStateCode(StateCode.HARVEST, "harvest");
          } else {
            creep.updateStateCode(StateCode.LOADSELF, "loadSelf");
          }
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
            creep.room.energyAvailable < creep.room.minAvailableEnergy &&
            creep.room.energyInStorage > 0
          ) {
            creep.updateStateCode(StateCode.HAUL, "haul");
          } else if (creep.room.buildables.length > 0) {
            creep.updateStateCode(StateCode.LOADSELF, "loadSelf ld");
          } else {
            creep.updateStateCode(StateCode.HARVEST, "harvest ld");
          }
        }
      }
    }
  };
  creep.states = states;
  return creep;
};

export default getBuilderCreep;

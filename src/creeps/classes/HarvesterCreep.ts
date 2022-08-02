import { BaseCreepStates, CreepRole, StateCode } from "../../types/States";

declare global {
  export interface HarvesterRoleStates extends BaseCreepStates {
    harvest: CreepState;
    load: CreepState;
    haul: CreepState;
    loadSelf: CreepState;
    upgrade: CreepState;
  }
}

const getHarvesterCreep = function (creep: Creep): Creep {
  const states: HarvesterRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (creep.room.sources[0].energy !== 0) {
          creep.updateStateCode(StateCode.HARVEST, "harvest");
        } else if (creep.room.energyAvailable >= creep.room.minAvailableEnergy) {
          creep.updateStateCode(StateCode.UPGRADE, "upgrade");
        } else {
          creep.updateStateCode(StateCode.HAUL, "haul");
        }
      }
    },
    harvest: {
      code: StateCode.HARVEST,
      run: creep.harvestProc,
      transition: () => {
        if (
          creep.store.energy === creep.store.getCapacity() ||
          creep.room.sources[0].energy === 0
        ) {
          creep.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },

    load: {
      code: StateCode.LOAD,
      run: () => {
        const haulersInRoom = _.find(creep.room.creeps.mine, creep => {
          return creep.memory.role === CreepRole.HAULER;
        });
        if (!haulersInRoom) {
          creep.loadProc((structure: Structure) => {
            switch (structure.structureType) {
              case STRUCTURE_SPAWN:
              case STRUCTURE_EXTENSION:
                return true;
              default:
                return false;
            }
          });
        } else {
          if (creep.room.sources[0].energy === 0) {
            creep.loadProc(
              (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
            );
          } else {
            creep.loadProc();
          }
        }
      },
      transition: () => {
        if (creep.store.energy === 0 || creep.room.loadables[0] === undefined) {
          if (creep.room.sources[0].energy > 0) {
            creep.updateStateCode(StateCode.HARVEST, "harvest");
          } else if (creep.room.energyAvailable >= creep.room.minAvailableEnergy) {
            creep.updateStateCode(StateCode.UPGRADE, "upgrade");
          } else {
            creep.updateStateCode(StateCode.HAUL, "haul");
          }
        }
      }
    },
    haul: {
      code: StateCode.HAUL,
      run: creep.haulProc,
      transition: () => {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          creep.updateStateCode(StateCode.LOAD, "load");
        } else {
          const target = Game.getObjectById(creep.memory.target as Id<LoadableStructure>);
          if (!target) {
            creep.updateStateCode(StateCode.LOAD, "load");
            return;
          }
          if (target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.updateStateCode(StateCode.LOAD, "load");
            return;
          }
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: creep.loadSelfProc,
      transition: () => {
        if (creep.room.sources[0].energy > 0) {
          creep.updateStateCode(StateCode.HARVEST, "harvest");
          return;
        }

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          creep.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    },
    upgrade: {
      code: StateCode.UPGRADE,
      run: creep.upgradeProc,
      transition: () => {
        if (creep.room.sources[0].energy > 0) {
          creep.updateStateCode(StateCode.HARVEST, "harvest");
          return;
        } else if (
          creep.store.energy === 0 &&
          creep.room.energyAvailable > creep.room.minAvailableEnergy
        ) {
          creep.updateStateCode(StateCode.LOADSELF, "loadSelf");
        } else if (creep.room.energyInStorage > 0 && creep.room.loadables.length > 0) {
          creep.updateStateCode(StateCode.HAUL, "haul");
        }
      }
    }
  };
  creep.states = states;
  return creep;
};

export default getHarvesterCreep;

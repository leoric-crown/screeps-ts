import { BaseCreepStates, StateCode } from "../../types/States";

declare global {
  interface UpgraderRoleStates extends BaseCreepStates {
    harvest: CreepState;
    upgrade: CreepState;
    loadSelf: CreepState;
  }
}

const getUpgraderCreep = function (creep: Creep): Creep {
  const states: UpgraderRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: function () {
        if (creep.room.energyAvailable > creep.room.minAvailableEnergy) {
          creep.updateStateCode(StateCode.LOADSELF, "loadself");
        } else {
          creep.updateStateCode(StateCode.HARVEST, "harvest");
        }
      }
    },
    harvest: {
      code: StateCode.HARVEST,
      run: creep.harvestProc,
      transition: function () {
        if (creep.store.getFreeCapacity() === 0) {
          creep.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    },
    upgrade: {
      code: StateCode.UPGRADE,
      run: creep.upgradeProc,
      transition: function () {
        if (creep.store.energy === 0) {
          if (creep.room.energyAvailable > creep.room.minAvailableEnergy) {
            creep.updateStateCode(StateCode.LOADSELF, "loadSelf");
          } else {
            creep.updateStateCode(StateCode.HARVEST, "harvest");
          }
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: creep.loadSelfProc,
      transition: function () {
        if (creep.store.getFreeCapacity() === 0) {
          creep.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    }
  };
  creep.states = states;
  return creep;
};

export default getUpgraderCreep;

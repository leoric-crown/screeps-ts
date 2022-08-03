import { BaseCreepStates, StateCode } from "../../types/States";

declare global {
  interface UpgraderRoleStates extends BaseCreepStates {
    upgrade: CreepState;
    loadSelf: CreepState;
    wait: CreepState;
  }
}

const getUpgraderCreep = function (this: Creep): Creep {
  const states: UpgraderRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (this.room.energyAvailable >= this.room.minAvailableEnergy) {
          this.updateStateCode(StateCode.LOADSELF, "loadself");
        } else {
          this.updateStateCode(StateCode.WAITING, "init wait");
        }
      }
    },
    upgrade: {
      code: StateCode.UPGRADE,
      run: this.upgradeProc,
      transition: () => {
        if (this.store.energy === 0) {
          if (this.room.energyAvailable > this.room.minAvailableEnergy) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
          } else {
            this.updateStateCode(StateCode.WAITING, "upgr wait");
          }
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: this.loadSelfProc,
      transition: () => {
        if (this.store.getFreeCapacity() === 0) {
          this.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    },
    wait: {
      code: StateCode.WAITING,
      run: () => {
        this.say("wait wait");
      },
      transition: () => {
        if (this.room.energyAvailable >= this.room.minAvailableEnergy) {
          this.updateStateCode(StateCode.LOADSELF, "loadself");
        }
      }
    }
  };
  this.states = states;
  return this;
};

export default getUpgraderCreep;

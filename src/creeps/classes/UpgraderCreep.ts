import { BaseCreepStates, CreepRole, StateCode } from "../../types/States";

declare global {
  interface UpgraderRoleStates extends BaseCreepStates {
    upgrade: CreepState;
    loadSelf: CreepState;
    wait: CreepState;
  }
}

const getUpgraderCreep = function (this: Creep): Creep {
  const suppliers = this.room.creeps.mine.filter(creep => {
    return (
      creep.role === CreepRole.SUPPLIER &&
      creep.memory.target === this.room.controller?.id
    );
  });
  const suppliersAvailable = suppliers.length > 0;

  const states: UpgraderRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (
          !suppliersAvailable &&
          this.room.energyAvailable >= this.room.minAvailableEnergy
        ) {
          this.updateStateCode(StateCode.LOADSELF, "loadself");
        } else {
          this.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    },
    upgrade: {
      code: StateCode.UPGRADE,
      run: this.upgradeProc,
      transition: () => {
        if (this.store.energy === 0) {
          if (!suppliersAvailable) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
          } else {
            this.updateStateCode(StateCode.WAITING, "upgr wait");
          }
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: () => {
        this.loadSelfProc();
      },
      transition: () => {
        if (this.store.getFreeCapacity() === 0) {
          this.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    },
    wait: {
      code: StateCode.WAITING,
      run: () => {
        const pos = this.room.controller?.pos;
        pos && this.pos.getRangeTo(pos) > 5 && this.moveTo(pos);
      },
      transition: () => {
        if (
          !suppliersAvailable &&
          this.room.energyAvailable >= this.room.minAvailableEnergy
        ) {
          this.updateStateCode(StateCode.LOADSELF, "loadself");
        } else if (this.store.energy > 0) {
          this.updateStateCode(StateCode.UPGRADE, "upgrade");
        }
      }
    }
  };
  this.states = states;
  return this;
};

export default getUpgraderCreep;

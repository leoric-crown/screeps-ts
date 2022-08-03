import { BaseCreepStates, StateCode } from "../../types/States";

declare global {
  interface BuilderRoleStates extends BaseCreepStates {
    loadSelf: CreepState;
    build: CreepState;
    load: CreepState;
    upgrade: CreepState;
    wait: CreepState;
  }
}

const getBuilderCreep = function (this: Creep): Creep {
  const states: BuilderRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (
          this.room.buildables.length > 0 &&
          this.room.energyAvailable >= this.room.minAvailableEnergy
        ) {
          this.updateStateCode(StateCode.LOADSELF, "loadSelf in");
        } else {
          this.updateStateCode(StateCode.WAITING, "init wait");
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: this.loadSelfProc,
      transition: () => {
        if (this.store.getFreeCapacity() === 0) {
          if (this.room.buildables.length > 0) {
            this.updateStateCode(StateCode.BUILD, "build ls");
          } else {
            this.updateStateCode(StateCode.UPGRADE, "upgrade ls");
          }
        }
      }
    },
    build: {
      code: StateCode.BUILD,
      run: this.buildProc,
      transition: () => {
        if (this.store.energy === 0) {
          if (this.room.buildables.length === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          } else if (this.room.energyAvailable < this.room.minAvailableEnergy) {
            this.updateStateCode(StateCode.WAITING, "bld wait");
          } else {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
          }
        } else if (this.room.buildables.length === 0) {
          this.updateStateCode(StateCode.LOAD, "load");
        }
      }
    },
    load: {
      code: StateCode.LOAD,
      run: () =>
        this.loadProc(
          (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
        ),
      transition: () => {
        if (this.store.energy === 0) {
          if (this.room.buildables.length > 0) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf ld");
          } else {
            this.updateStateCode(StateCode.WAITING, "load wait");
          }
        }
      }
    },
    upgrade: {
      code: StateCode.UPGRADE,
      run: this.upgradeProc,
      transition: () => {
        if (this.store.energy === 0 || this.room.buildables.length > 0) {
          if (this.room.energyAvailable >= this.room.minAvailableEnergy) {
            this.updateStateCode(StateCode.LOADSELF, "upg loadself");
          } else {
            this.updateStateCode(StateCode.WAITING, "upg wait");
          }
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

export default getBuilderCreep;

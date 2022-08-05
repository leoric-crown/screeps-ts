import { BaseCreepStates, CreepRole, StateCode } from "../../types/States";

declare global {
  interface HaulerRoleStates extends BaseCreepStates {
    haul: CreepState;
    load: CreepState;
  }
}

const getSourceHauler = function (this: Creep): Creep {
  const targetSource = this.memory.target
    ? (Game.getObjectById(this.memory.target) as Source)
    : undefined;
  const harvesters = this.room.creeps.mine.filter(
    creep =>
      creep.memory.target === this.memory.target && creep.role === CreepRole.HARVESTER
  );
  const states: HaulerRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        this.updateStateCode(StateCode.HAUL, "haul");
      }
    },
    haul: {
      code: StateCode.HAUL,
      run: () => this.haulProc(harvesters),
      transition: () => {
        if (targetSource) {
          if (harvesters.length === 0 || this.store.getFreeCapacity() === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          }
        } else throw new Error(`Creep ${this.name} in haul state has no targetSource`);
      }
    },
    load: {
      code: StateCode.LOAD,
      run: this.loadProc,
      transition: () => {
        if (this.store.energy === 0) {
          this.updateStateCode(StateCode.HAUL, "haul");
        }
      }
    }
  };
  this.states = states;
  return this;
};

export default getSourceHauler;

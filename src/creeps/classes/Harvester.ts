import { BaseCreepStates, CreepRole, CreepType, StateCode } from "../../types/States";

declare global {
  export interface HarvesterRoleStates extends BaseCreepStates {
    move: CreepState;
    harvest: CreepState;
    wait: CreepState;
    load: CreepState;
  }
}

const getHarvester = function (this: Creep): Creep {
  const targetSource = this.memory.target
    ? (Game.getObjectById(this.memory.target) as Source)
    : undefined;
  const states: HarvesterRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (targetSource) {
          if (this.pos.getRangeTo(targetSource) === 1) {
            this.updateStateCode(StateCode.HARVEST, "harvest");
          } else {
            this.updateStateCode(StateCode.MOVE, "move");
          }
        } else throw new Error(`Harvester ${this.name} has no target source`);
      }
    },
    move: {
      code: StateCode.MOVE,
      run: this.moveProc,
      transition: () => {
        if (targetSource) {
          if (this.pos.getRangeTo(targetSource) === 1)
            this.updateStateCode(StateCode.HARVEST, "harvest");
        } else throw new Error(`Harvester ${this.name} has no target source`);
      }
    },
    harvest: {
      code: StateCode.HARVEST,
      run: this.harvestProc,
      transition: () => {
        if (targetSource) {
          if (this.store.getFreeCapacity() === 0) {
            const sourceHaulers = this.room.creeps.mine.filter(creep => {
              return (
                creep.role === CreepRole.HAULER &&
                creep.memory.target === this.memory.target
              );
            });

            const haulersAvailable = sourceHaulers.length > 0; // store this in CreepManager and add property to creep
            if (!haulersAvailable) {
              this.updateStateCode(StateCode.DEPOSIT, "load");
            } else {
              this.updateStateCode(StateCode.WAITING, "wait full");
            }
          }
        } else throw new Error(`Harvester ${this.name} has no target source`);
      }
    },
    wait: {
      code: StateCode.WAITING,
      run: () => {},
      transition: () => {
        if (this.store.getFreeCapacity() > 0) {
          this.updateStateCode(StateCode.HARVEST, "harvest");
        }
      }
    },
    load: {
      code: StateCode.DEPOSIT,
      run: this.depositProc,
      transition: () => {
        if (targetSource) {
          if (this.store.energy === 0) {
            this.updateStateCode(StateCode.MOVE, "move");
          }
        } else throw new Error(`Harvester ${this.name} has no target source`);
      }
    }
  };
  this.states = states;
  return this;
};

export default getHarvester;

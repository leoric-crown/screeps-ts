import { BaseCreepStates, CreepRole, ContainerType, StateCode } from "../../types/States";

declare global {
  interface SupplierRoleStates extends BaseCreepStates {
    loadSelf: CreepState;
    supply: CreepState;
    wait: CreepState;
  }
}

const getSupplier = function (this: Creep): Creep {
  const states: SupplierRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (
          this.room.energyAvailable >= this.room.minAvailableEnergy ||
          this.room.energyInStorage > 0
        ) {
          this.updateStateCode(StateCode.LOADSELF, "loadSelf");
        } else {
          this.updateStateCode(StateCode.WAITING, "init wait");
        }
      }
    },
    loadSelf: {
      code: StateCode.LOADSELF,
      run: () => {
        const containerTypeFilter = (x: StructureContainer) => {
          return x.memory.containerType === ContainerType.SUPPLY && x.store.energy > 0;
        };
        const containers = this.room.containers.filter(containerTypeFilter);
        let target;
        if (containers.length > 0) target = this.pos.findClosestByPath(containers);
        else {
          const spawnsAndExtensions = [
            ...this.room.spawns,
            ...this.room.extensions
          ].filter(x => x.store.energy > 0);
          target = this.pos.findClosestByPath(spawnsAndExtensions);
        }
        if (target) this.loadSelfProc(target);
        else
          throw new Error(
            `Supplier ${this.name} could not find suitable loadSelf target`
          );
      },
      transition: () => {
        if (this.store.getFreeCapacity() === 0) {
          this.updateStateCode(StateCode.SUPPLY, "supply");
        }
      }
    },
    supply: {
      code: StateCode.SUPPLY,
      run: () => this.supplyProc(CreepRole.UPGRADER),
      transition: () => {
        if (this.store.energy === 0) {
          if (
            this.room.energyAvailable >= this.room.minAvailableEnergy ||
            this.room.energyInStorage > 0
          ) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
          } else {
            this.updateStateCode(StateCode.WAITING, "sply wait");
          }
        }
      }
    },
    wait: {
      code: StateCode.WAITING,
      run: () => {
        this.moveTo(this.room.spawns[0]);
      },
      transition: () => {
        if (
          this.room.energyAvailable >= this.room.minAvailableEnergy ||
          this.room.energyInStorage
        ) {
          this.updateStateCode(StateCode.LOADSELF, "loadself");
        }
      }
    }
  };
  this.states = states;
  return this;
};

export default getSupplier;

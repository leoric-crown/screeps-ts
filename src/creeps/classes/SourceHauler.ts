import {
  BaseCreepStates,
  CreepRole,
  StateCode,
  ContainerType,
  CreepType
} from "../../types/States";

declare global {
  interface HaulerRoleStates extends BaseCreepStates {
    withdraw: CreepState;
    deposit: CreepState;
  }
}

export const isSource = (x: any): x is Source => !!(x as Source);
export const isAnyStoreStructure = (x: any): x is AnyStoreStructure => !!x.store;
export const isCreep = (x: any): x is Creep => !!x.harvest;

const getSourceHauler = function (this: Creep): Creep {
  const sourceTarget = this.memory.target
    ? Game.getObjectById(this.memory.target)
    : undefined;

  const anchorCreeps = (creep: Creep) =>
    creep.memory.target === this.memory.target && creep.role === CreepRole.HARVESTER;

  const states: HaulerRoleStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        this.updateStateCode(StateCode.WITHDRAW, "withdraw");
      }
    },
    withdraw: {
      code: StateCode.WITHDRAW,
      run: () => {
        if (sourceTarget) {
          if (isSource(sourceTarget)) {
            const harvesters = this.room.creeps.mine.filter(anchorCreeps);
            this.withdrawProc(harvesters);
          }
        } else {
          // no target set in memory: general hauler behaviour
          let energyDeposits;
          this.room.energyInStorage > 0 &&
            (energyDeposits = this.room.containers.filter(
              c => c.memory.containerType === ContainerType.DEPOSIT && c.store.energy > 0
            ));
          !energyDeposits &&
            (energyDeposits = this.room.extensions.filter(c => c.store.energy > 0));
          !energyDeposits && (energyDeposits = this.room.spawns);
          if (energyDeposits) {
            this.withdrawProc(energyDeposits);
          } else
            throw new Error(
              `Creep ${this.name} in haul state could not find suitable withdrawal target`
            );
        }
      },
      transition: () => {
        if (sourceTarget) {
          const harvesters = this.room.creeps.mine.filter(anchorCreeps);
          if (harvesters.length === 0 || this.store.getFreeCapacity() === 0) {
            this.updateStateCode(StateCode.DEPOSIT, "deposit");
          }
        } else if (this.store.getFreeCapacity() === 0) {
          this.updateStateCode(StateCode.DEPOSIT, "deposit");
        }
      }
    },
    deposit: {
      code: StateCode.DEPOSIT,
      run: () => {
        if (sourceTarget) {
          if (isSource(sourceTarget)) {
            let targets: AnyStoreStructure[] = [];
            if (
              this.room.creeps.mine.find(
                creep => creep.type === CreepType.HAULER && !creep.memory.target
              )
            ) {
              targets = this.room.containers.filter(
                c =>
                  c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                  (c.memory.containerType === ContainerType.DEPOSIT ||
                    c.memory.containerType === ContainerType.HYBRID)
              );
            }
            targets.length === 0 &&
              (targets = this.room.spawns.filter(
                s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
              ));
            targets.length === 0 &&
              (targets = this.room.extensions.filter(
                e => e.store.getFreeCapacity(RESOURCE_ENERGY) > 0
              ));
            this.depositProc(targets);
          }
        } else {
          // all of this (except ContainerType.SUPPLY) was copy pasted from extend.creep.ts/findDepositTargetStructures, remember to refactor
          let energyStores: AnyStoreStructure[] = [];
          if (this.room.energyAvailable < this.room.minAvailableEnergy) {
            energyStores = this.room.spawns.filter(
              s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            );
            energyStores.length === 0 &&
              (energyStores = this.room.extensions.filter(
                s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
              ));
          } else if (energyStores.length === 0 && this.room.containers.length > 0) {
            energyStores = this.room.containers.filter(
              x =>
                x.store.getFreeCapacity() > 0 &&
                (x.memory.containerType === ContainerType.SUPPLY ||
                  x.memory.containerType === ContainerType.HYBRID)
            );
          } else if (energyStores.length === 0) {
            energyStores = [...this.room.spawns, ...this.room.extensions];
          }

          if (energyStores) {
            this.depositProc(energyStores);
          } else
            throw new Error(
              `Creep ${this.name} in haul state could not find suitable withdrawal target`
            );
        }
      },
      transition: () => {
        if (this.store.energy === 0) {
          this.updateStateCode(StateCode.WITHDRAW, "withdraw");
        }
      }
    }
  };
  this.states = states;
  return this;
};

export default getSourceHauler;

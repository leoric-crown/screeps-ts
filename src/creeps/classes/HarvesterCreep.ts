import { BaseCreepStates, CreepState, StateCode } from "../../types/States";
import { StatefulRoom, LoadableStructure } from "../../rooms/";
import ExtendedCreep, {CreepRole, CreepType} from "../ExtendedCreep";

export interface HarvesterRoleStates extends BaseCreepStates {
  harvest: CreepState;
  upgrade: CreepState;
  loadSelf: CreepState;
  load: CreepState;
  haul: CreepState;
}

class HarvesterCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    super(creep);
    this.type = CreepType.HARVESTER;
    this.role = CreepRole.HARVESTER;
    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: (room: StatefulRoom) => {
          if (room.sources[0].energy !== 0) {
            this.updateStateCode(StateCode.HARVEST, "harvest");
          } else if (room.energyAvailable >= room.minAvailableEnergy) {
            this.updateStateCode(StateCode.UPGRADE, "upgrade");
          } else {
            this.updateStateCode(StateCode.HAUL, "haul");
          }
        }
      },
      harvest: {
        code: StateCode.HARVEST,
        run: this.harvestProc,
        transition: (room: StatefulRoom) => {
          if (
            this.store.energy === this.store.getCapacity() ||
            room.sources[0].energy === 0
          ) {
            this.updateStateCode(StateCode.LOAD, "load");
          }
        }
      },

      load: {
        code: StateCode.LOAD,
        run: (room: StatefulRoom) => {
          const haulersInRoom = _.find(room.creeps, creep => {
            return creep.memory.role === CreepRole.HAULER;
          });
          if (room.energyAvailable < room.minAvailableEnergy && !haulersInRoom) {
            this.loadProc(
              room,
              (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
            );
          } else {
            if (room.sources[0].energy === 0) {
              this.loadProc(
                room,
                (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
              );
            } else {
              this.loadProc(room);
            }
          }
        },
        transition: (room: StatefulRoom) => {
          if (this.store.energy === 0 || room.loadables[0] === undefined) {
            if (room.sources[0].energy > 0) {
              this.updateStateCode(StateCode.HARVEST, "harvest");
            } else if (room.energyAvailable >= room.minAvailableEnergy) {
              this.updateStateCode(StateCode.UPGRADE, "upgrade");
            } else {
              this.updateStateCode(StateCode.HAUL, "haul");
            }
          }
        }
      },
      haul: {
        code: StateCode.HAUL,
        run: this.haulProc,
        transition: (room: StatefulRoom) => {
          if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          } else {
            const target = Game.getObjectById(
              this.memory.target as Id<LoadableStructure>
            );
            if (!target) {
              this.updateStateCode(StateCode.LOAD, "load");
              return;
            }
            if (target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
              this.updateStateCode(StateCode.LOAD, "load");
              return;
            }
          }
        }
      },
      loadSelf: {
        code: StateCode.LOADSELF,
        run: this.loadSelfProc,
        transition: (room: StatefulRoom) => {
          if (room.sources[0].energy > 0) {
            this.updateStateCode(StateCode.HARVEST, "harvest");
            return;
          }

          if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.updateStateCode(StateCode.UPGRADE, "upgrade");
          }
        }
      },
      upgrade: {
        code: StateCode.UPGRADE,
        run: this.upgradeProc,
        transition: (room: StatefulRoom) => {
          if (room.sources[0].energy > 0) {
            this.updateStateCode(StateCode.HARVEST, "harvest");
            return;
          } else if (
            this.store.energy === 0 &&
            room.energyAvailable > room.minAvailableEnergy
          ) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
          } else if (room.energyInStorage > 0 && room.loadables.length > 0) {
            this.updateStateCode(StateCode.HAUL, "haul");
          }
        }
      }
    };
  }
}

export default HarvesterCreep;

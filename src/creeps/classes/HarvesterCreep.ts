import { CreepRole, CreepType } from "../../types/Creeps";
import { BaseCreepStates, CreepState, StateCode } from "../../types/States";
import ExtendedRoom, { LoadableStructure } from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";

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
        transition: (room: ExtendedRoom) => {
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
        transition: (room: ExtendedRoom) => {
          console.log(
            "in harvest transition, room source energy",
            room.sources[0].energy
          );
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
        run: (room: ExtendedRoom) => {
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
        transition: (room: ExtendedRoom) => {
          console.log("in load transition, room source energy", room.sources[0].energy);
          if (this.store.energy === 0 || room.loadables[0] === undefined) {
            if (room.sources[0].energy > 0) {
              console.log("setting to harvest");
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
        transition: (room: ExtendedRoom) => {
          if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          } else {
            const target = Game.getObjectById(
              this.memory.target as Id<LoadableStructure>
            );
            if (!target) {
              this.updateStateCode(StateCode.LOAD, "load");
              return
            }
            if (target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
              this.updateStateCode(StateCode.LOAD, "load");
              return
            }
          }
        }
      },
      loadSelf: {
        code: StateCode.LOADSELF,
        run: this.loadSelfProc,
        transition: (room: ExtendedRoom) => {
          if (room.sources[0].energy > 0) {
            this.updateStateCode(StateCode.HARVEST, "harvest")
            return
          }

          if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.updateStateCode(StateCode.UPGRADE, "upgrade");
          }
        }
      },
      upgrade: {
        code: StateCode.UPGRADE,
        run: this.upgradeProc,
        transition: (room: ExtendedRoom) => {
          if (room.sources[0].energy > 0) {
            this.updateStateCode(StateCode.HARVEST, "harvest");
            return
          }
          else if (this.store.energy === 0) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
          } else if (room.energyInStorage > 0 && room.loadables.length > 0){
            this.updateStateCode(StateCode.HAUL, "haul");
          }
        }
      }
    };
  }
}

export default HarvesterCreep;

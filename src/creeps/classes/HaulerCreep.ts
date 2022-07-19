import { CreepRole, CreepType } from "../../types/Creeps";
import ExtendedRoom, { LoadableStructure } from "../../extend/ExtendedRoom";
import ExtendedCreep, { CreepTarget } from "../../extend/ExtendedCreep";
import { BaseCreepStates, CreepState, StateCode } from "../../types/States";

export interface HaulerRoleStates extends BaseCreepStates {
  haul: CreepState;
  load: CreepState;
  loadSelf: CreepState;
  loadStructure: CreepState;
  harvest: CreepState;
}
class HaulerCreep extends ExtendedCreep {
  target?: Structure;
  constructor(creep: Creep) {
    super(creep);
    this.type = CreepType.HAULER;
    this.role = CreepRole.HAULER;

    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: (room: ExtendedRoom) => {
          if (room.energyInStorage > 100) {
            this.updateStateCode(StateCode.HAUL, "haul");
            return;
          }

          if (room.energyAvailable >= room.minAvailableEnergy) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf");
            return;
          }

          this.updateStateCode(StateCode.HARVEST, "harvest");
        }
      },
      haul: {
        code: StateCode.HAUL,
        run: this.haulProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0 || room.energyInStorage === 0) {
            if (
              room.energyAvailable > room.minAvailableEnergy &&
              room.structuresToFill?.length > 0
            ) {
              this.updateStateCode(StateCode.LOAD_STRUCTURE, "loadStruct");
              return;
            }
            this.updateStateCode(StateCode.LOAD, "load");
          }
          // else {
          //   const target = Game.getObjectById(
          //     this.memory.target as Id<LoadableStructure>
          //   );
          //   if (!target) {
          //     this.updateStateCode(StateCode.LOAD, "load");
          //   } else if (target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          //     this.updateStateCode(StateCode.LOAD, "load");
          //   }
          // }
        }
      },
      load: {
        code: StateCode.LOAD,
        run: (room: ExtendedRoom) =>
          this.loadProc(
            room,
            (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
          ),
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0) {
            if (
              room.containersAndStorage.length > 0 &&
              room.energyInStorage &&
              room.energyAvailable < room.energyCapacityAvailable * 0.8
            ) {
              this.updateStateCode(StateCode.HAUL, "haul");
              return;
            }

            if (
              room.structuresToFill.length > 0 &&
              room.energyAvailable >= room.minAvailableEnergy
            ) {
              this.updateStateCode(StateCode.LOADSELF, "loadself");
              return;
            }
            this.updateStateCode(StateCode.HARVEST, "harvest");
          }
        }
      },
      loadSelf: {
        code: StateCode.LOADSELF,
        run: this.loadSelfProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.updateStateCode(StateCode.LOAD_STRUCTURE, "loadStruct");
          }
        }
      },
      loadStructure: {
        code: StateCode.LOAD_STRUCTURE,
        run: this.loadStructureProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0) {
            if (room.containersAndStorage.length > 0 && room.energyInStorage) {
              this.updateStateCode(StateCode.HAUL, "haul");
              return;
            }

            if (
              room.structuresToFill &&
              room.energyAvailable >= room.minAvailableEnergy
            ) {
              this.updateStateCode(StateCode.LOADSELF, "loadself");
              return;
            }

            this.updateStateCode(StateCode.HARVEST, "harvest");
          } else if (room.structuresToFill.length === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          }
        }
      },
      harvest: {
        code: StateCode.HARVEST,
        run: this.harvestProc,
        transition: (room: ExtendedRoom) => {
          if (
            this.store.getFreeCapacity(RESOURCE_ENERGY) === 0 ||
            room.energyAvailable < room.energyCapacityAvailable * 0.9
          ) {
            if (this.store.energy !== 0) {
              if (room.structuresToFill.length > 0) {
                this.updateStateCode(StateCode.LOAD_STRUCTURE, "loadStruct");
              } else {
                this.updateStateCode(StateCode.LOAD, "load");
              }
            } else {
              this.updateStateCode(StateCode.HAUL, "haul");
            }
          }
        }
      }
    };
  }
}

export default HaulerCreep;

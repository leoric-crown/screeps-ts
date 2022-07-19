import { CreepRole, CreepType } from "../../types/Creeps";
import { BaseCreepStates, CreepState, StateCode } from "../../types/States";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";

export interface BuilderRoleStates extends BaseCreepStates {
  build: CreepState;
  haul: CreepState;
  harvest: CreepState;
  load: CreepState;
  loadSelf: CreepState;
  loadStructure: CreepState;
  upgrade: CreepState;
}

class BuilderCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    super(creep);
    this.type = CreepType.BUILDER;
    this.role = CreepRole.BUILDER;

    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: (room: ExtendedRoom) => {
          if (
            room.buildables.length > 0 &&
            room.energyAvailable >= this.store.getCapacity()
          ) {
            this.updateStateCode(StateCode.LOADSELF, "loadSelf in");
          } else {
            this.updateStateCode(StateCode.HARVEST, "harvest in");
          }
        }
      },
      loadSelf: {
        code: StateCode.LOADSELF,
        run: this.loadSelfProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.getFreeCapacity() === 0) {
            if (room.buildables.length > 0) {
              this.updateStateCode(StateCode.BUILD, "build ls");
            } else if (room.structuresToFill.length > 0) {
              this.updateStateCode(StateCode.LOAD_STRUCTURE, "ls loadStruct");
            } else {
              this.updateStateCode(StateCode.UPGRADE, "upgrade ls");
            }
          }
        }
      },
      loadStructure: {
        code: StateCode.LOAD_STRUCTURE,
        run: this.loadStructureProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0) {
            if (room.buildables.length > 0 && room.energyAvailable >= room.minAvailableEnergy) {
              this.updateStateCode(StateCode.LOADSELF, "loadSelf");
              return;
            }
            if (room.containersAndStorage.length > 0 && room.energyInStorage) {
              this.updateStateCode(StateCode.HAUL, "haul");
              return;
            }

            if (
              room.structuresToFill &&
              room.energyAvailable >= room.minAvailableEnergy
            ) {
              this.updateStateCode(StateCode.LOADSELF, "lSt loadSelf");
              return;
            }

            this.updateStateCode(StateCode.HARVEST, "harvest");
          } else if (room.structuresToFill.length === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          }
        }
      },
      build: {
        code: StateCode.BUILD,
        run: this.buildProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0) {
            if (room.buildables.length === 0) {
              this.updateStateCode(StateCode.LOAD, "load");
            } else if (room.energyAvailable < room.minAvailableEnergy) {
              if (room.energyInStorage > 0) {
                this.updateStateCode(StateCode.HAUL, "haul");
              } else {
                this.updateStateCode(StateCode.HARVEST, "harvest");
              }
            } else {
              this.updateStateCode(StateCode.LOADSELF, "loadSelf");
            }
          } else if (room.buildables.length === 0) {
            this.updateStateCode(StateCode.LOAD, "load");
          }
        }
      },
      haul: {
        code: StateCode.HAUL,
        run: this.haulProc,
        transition: (room: ExtendedRoom) => {
          // if no free capacity or no energy in storage
          if (this.store.getFreeCapacity() === 0 || room.energyInStorage === 0) {
            // DETERMINE THIS STATE
            if (room.energyAvailable >= room.minAvailableEnergy)
              this.updateStateCode(StateCode.BUILD, "build");
            else this.updateStateCode(StateCode.LOAD, "load");
          }
        }
      },
      harvest: {
        code: StateCode.HARVEST,
        run: this.harvestProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.getUsedCapacity(RESOURCE_ENERGY) === this.store.getCapacity()) {
            if (room.buildables.length > 0) {
              this.updateStateCode(StateCode.BUILD, "build hv");
            } else if (room.energyAvailable < room.minAvailableEnergy) {
              this.updateStateCode(StateCode.LOAD, "load hv");
            } else {
              this.updateStateCode(StateCode.UPGRADE, "upgrade hv");
            }
          }
        }
      },
      upgrade: {
        code: StateCode.UPGRADE,
        run: this.upgradeProc,
        transition: (room: ExtendedRoom) => {
          if (!room.controller) {
            this.updateStateCode(StateCode.INIT, "reset");
          } else if (this.store.energy === 0) {
            if (room.energyAvailable < room.minAvailableEnergy) {
              this.updateStateCode(StateCode.HARVEST, "harvest");
            } else {
              this.updateStateCode(StateCode.LOADSELF, "loadSelf");
            }
          }
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
              room.energyAvailable < room.minAvailableEnergy &&
              room.energyInStorage > 0
            ) {
              this.updateStateCode(StateCode.HAUL, "haul");
            } else if (room.buildables.length > 0) {
              this.updateStateCode(StateCode.LOADSELF, "loadSelf ld");
            } else {
              this.updateStateCode(StateCode.HARVEST, "harvest ld");
            }
          }
        }
      }
    };
  }
}

export default BuilderCreep;

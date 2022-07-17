import { CreepRole, CreepType } from "../../types/Creeps";
import { BaseCreepStates, CreepState, StateCode } from "../../types/CreepState";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";

export interface HarvesterRoleStates extends BaseCreepStates {
  harvest: CreepState;
  load: CreepState;
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
        transition: () => this.updateStateCode(StateCode.HARVEST, "harvest")
      },
      harvest: {
        code: StateCode.HARVEST,
        run: this.harvestProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === this.store.getCapacity()) {
            this.updateStateCode(StateCode.LOAD, "load");
          }
        }
      },
      load: {
        code: StateCode.LOAD,
        run: this.loadProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0 || room.loadables[0] === undefined) {
            if (this.store.getFreeCapacity() === 0) {
              this.drop(RESOURCE_ENERGY); // if all energy storage is full, drop on floor and keep gathering
            }
            this.updateStateCode(StateCode.HARVEST, "harvest");
          }
        }
      }
    };
  }
}

export default HarvesterCreep;

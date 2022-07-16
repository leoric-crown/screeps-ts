import { CreepRole, CreepType } from "../../types/Creeps";
import { BaseCreepStates, CreepState, StateCode } from "../../types/CreepState";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";

export interface HarvesterRoleStates extends BaseCreepStates{
  harvest: CreepState;
  load: CreepState;
}

class HarvesterCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    const states: HarvesterRoleStates = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: () => this.memory.state = (this.states as HarvesterRoleStates).harvest.code,
      },
      harvest: {
        code: StateCode.HARVESTING,
        run: (room: ExtendedRoom) => {
          if (this.harvest(room.sources[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(room.sources[0], {
              visualizePathStyle: { stroke: "#ffffff" }
            });
          }
        },
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === this.store.getCapacity()) {
            this.memory.state = (this.states as HarvesterRoleStates).load.code;
            this.say("load");
          }
        }
      },
      load: {
        code: StateCode.LOADING,
        run: (room: ExtendedRoom) => {
          if (this.transfer(room.loadables[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(room.loadables[0], {
              visualizePathStyle: { stroke: "#ffffff" }
            });
          }
        },
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0 || room.loadables[0] === undefined) {
            this.memory.state = (this.states as HarvesterRoleStates).harvest.code;
            if (this.store.getFreeCapacity() === 0) {
              this.drop(RESOURCE_ENERGY); // if all energy storage is full, drop on floor and keep gathering
            }
            this.say("harvest");
          }
        }
      }
    };
    super(creep, CreepType.HARVESTER, CreepRole.HARVESTER, states);
  }
}

export default HarvesterCreep;

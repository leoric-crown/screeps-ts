import { CreepRole } from "../../types/CreepRole";
import { CreepType } from "../../types/CreepType";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";
import { CreepState, StateCode } from "../../types/CreepState";

export interface UpgraderRoleStates {
  harvest: CreepState;
  upgrade: CreepState;
}

class UpgraderCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    const states = {
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
          if (this.store.getFreeCapacity() === 0) {
            this.memory.state = (this.states as UpgraderRoleStates).upgrade.code;
            this.say("upgrade");
          }
        }
      },
      upgrade: {
        code: StateCode.UPGRADING,
        run: (room: ExtendedRoom) => {
          if (
            room.controller &&
            this.upgradeController(room.controller) === ERR_NOT_IN_RANGE
          ) {
            this.moveTo(room.controller);
          }
        },
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0 || room.controller === undefined) {
            this.memory.state = (this.states as UpgraderRoleStates).harvest.code;
            this.say("harvest");
          }
        }
      }
    };
    super(creep, CreepType.UPGRADER, CreepRole.UPGRADER, states);
  }
}

export default UpgraderCreep;

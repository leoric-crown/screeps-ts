import { CreepRole, CreepType } from "../../types/Creeps";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";
import { BaseCreepStates, CreepState, StateCode } from "../../types/States";

// IMPORTANT: Remember to add this interface to CreepRoleStates in index.ts
export interface NewCreepStates extends BaseCreepStates {
  newstate: CreepState;
}
class NewCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    super(creep);
    this.type = CreepType.UPGRADER;
    this.role = CreepRole.UPGRADER;
    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        // Important: Update with correct StateCode
        transition: () => this.updateStateCode(StateCode.UPGRADE, "build")
      },
      newstate: {
        // IMPORTANT: Remember to add codes for new StateCodes to CreepState in /src/types/
        code: StateCode.UPGRADE,
        run: (room: ExtendedRoom) => {},
        transition: (room: ExtendedRoom) => {}
      }
    };
    // IMPORTANT: Remember to add any necessary types and roles to CreepType and CreepRole in /src/types/
    // @ts-ignore
  }
}

// IMPORTANT: Remember to bundle this NewCreep class in index.ts exports
export default NewCreep;

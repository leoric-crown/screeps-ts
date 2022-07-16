import { CreepRole } from "../../types/CreepRole";
import { CreepType } from "../../types/CreepType";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";
import { CreepState, StateCode } from "../../types/CreepState";

// IMPORTANT: Remember to add this interface to CreepRoleStates in /src/types/
export interface NewCreepStates {
  newstate: CreepState;
}
class NewCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    const states: NewCreepStates = {
      newstate: {
        // IMPORTANT: Remember to add codes for new StateCodes to CreepState in /src/types/
        code: StateCode.UPGRADING,
        run: (room: ExtendedRoom) => {},
        transition: (room: ExtendedRoom) => {}
      }
    };
    // IMPORTANT: Remember to add any necessary types and roles to CreepType and CreepRole in /src/types/
    super(creep, CreepType.UPGRADER, CreepRole.UPGRADER, states);
  }
}

// IMPORTANT: Remember to bundle this NewCreep class in index.ts exports
export default NewCreep;

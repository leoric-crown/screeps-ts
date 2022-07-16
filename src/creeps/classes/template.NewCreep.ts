import { CreepRole, CreepType } from "../../types/Creeps";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";
import { BaseCreepStates, CreepState, StateCode } from "../../types/CreepState";

// IMPORTANT: Remember to add this interface to CreepRoleStates in index.ts
export interface NewCreepStates extends BaseCreepStates {
  newstate: CreepState;
}
class NewCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    const states: NewCreepStates = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        //@ts-ignore - removes red squiggly line under .state - get rid of this when implementing
        transition: () => this.memory.state = (this.states as NewCreepStates).newstate.code,
      },
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

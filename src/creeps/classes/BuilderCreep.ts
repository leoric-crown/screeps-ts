import { CreepRole } from "../../types/CreepRole";
import { CreepType } from "../../types/CreepType";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";
import { BaseCreepStates, CreepState, StateCode } from "../../types/CreepState";

// IMPORTANT: Remember to add this interface to CreepRoleStates in /src/types/
export interface BuilderRoleStates extends BaseCreepStates {
  build: CreepState;
}
class BuilderCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    const states: BuilderRoleStates = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: () =>
          (this.memory.state = (this.states as BuilderRoleStates).build.code)
      },
      build: {
        code: StateCode.BUILDING,
        run: (room: ExtendedRoom) => {},
        transition: (room: ExtendedRoom) => {}
      }
    };
    super(creep, CreepType.BUILDER, CreepRole.BUILDER, states);
  }
}

export default BuilderCreep;

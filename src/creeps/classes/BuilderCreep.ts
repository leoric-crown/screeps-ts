import { CreepRole, CreepType } from "../../types/Creeps";
import { BaseCreepStates, CreepState, StateCode } from "../../types/CreepState";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";

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

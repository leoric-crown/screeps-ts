import { CreepRole } from "../types/CreepRole";
import { CreepType } from "../types/CreepType";
import { CreepRoleStates } from "../types/CreepRoleStates";

export class ExtendedCreep extends Creep {
  type: CreepType;
  role: CreepRole;
  states: CreepRoleStates;

  constructor(
    creep: Creep,
    creepType: CreepType,
    creepRole: CreepRole,
    states: CreepRoleStates
  ) {
    super(creep.id);
    this.type = creepType;
    this.role = creepRole;
    this.states = states;
  }
}

export default ExtendedCreep;

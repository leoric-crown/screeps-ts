import HarvesterCreep, { HarvesterRoleStates } from "./HarvesterCreep";
import UpgraderCreep, { UpgraderRoleStates } from "./UpgraderCreep";
import BuilderCreep, { BuilderRoleStates } from "./BuilderCreep";
import HaulerCreep, { HaulerRoleStates } from "./HaulerCreep";
import { CreepRole, CreepType } from "types/Creeps";

export type CreepRoleStates =
  | HarvesterRoleStates
  | UpgraderRoleStates
  | BuilderRoleStates
  | HaulerRoleStates;

export { HarvesterCreep, UpgraderCreep, BuilderCreep, HaulerCreep };

export const getExtendedCreep = (creep: Creep, type: CreepType, role: CreepRole) => {
  switch (role) {
    case CreepRole.HARVESTER:
      return new HarvesterCreep(creep);
    case CreepRole.UPGRADER:
      return new UpgraderCreep(creep);
    case CreepRole.BUILDER:
      return new BuilderCreep(creep);
    case CreepRole.HAULER:
      return new HaulerCreep(creep);
    default:
      throw new Error(
        `There was an error getting ExtendedCreep for: type: ${type}, role: ${role}`
      );
  }
};

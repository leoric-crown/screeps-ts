import ExtendedCreep, { CreepType, CreepRole } from "./ExtendedCreep";
import BuilderCreep, { BuilderRoleStates } from "./classes/BuilderCreep";
import HarvesterCreep, { HarvesterRoleStates } from "./classes/HarvesterCreep";
import HaulerCreep, { HaulerRoleStates } from "./classes/HaulerCreep";
import UpgraderCreep, { UpgraderRoleStates } from "./classes/UpgraderCreep";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

export { ExtendedCreep, CreepType, CreepRole, BuilderCreep, HarvesterCreep, HaulerCreep, UpgraderCreep };
if (profiler) {
  profiler.registerFN(ExtendedCreep.constructor, "ExtendedCreep");
  profiler.registerFN(BuilderCreep.constructor, "BuilderCreep");
  profiler.registerFN(HarvesterCreep.constructor, "HarvesterCreep");
  profiler.registerFN(HaulerCreep.constructor, "HaulerCreep");
  profiler.registerFN(UpgraderCreep.constructor, "UpgraderCreep");
}

export type CreepRoleStates =
  | HarvesterRoleStates
  | UpgraderRoleStates
  | BuilderRoleStates
  | HaulerRoleStates;

let _getExtendedCreep = (creep: Creep, type: CreepType, role: CreepRole) => {
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
if (profiler) {
  _getExtendedCreep = profiler.registerFN(_getExtendedCreep, "getExtendedCreep");
}
export const getExtendedCreep = _getExtendedCreep;

export type CreepBody = WORK | CARRY | MOVE;

export type CreepBodyAbbreviations = {
  [bodyName: string]: string;
};

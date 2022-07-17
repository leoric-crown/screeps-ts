import HarvesterCreep, { HarvesterRoleStates } from "./HarvesterCreep";
import UpgraderCreep, { UpgraderRoleStates } from "./UpgraderCreep";
import BuilderCreep, { BuilderRoleStates } from "./BuilderCreep";

export type CreepRoleStates =
  | HarvesterRoleStates
  | UpgraderRoleStates
  | BuilderRoleStates;

export { HarvesterCreep, UpgraderCreep, BuilderCreep };

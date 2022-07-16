import { HarvesterRoleStates } from "creeps/classes/HarvesterCreep";
import { UpgraderRoleStates } from "creeps/classes/UpgraderCreep";
import { BuilderRoleStates } from "creeps/classes/BuilderCreep";

export type CreepRoleStates =
  | HarvesterRoleStates
  | UpgraderRoleStates
  | BuilderRoleStates;

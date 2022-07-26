import getBuilderCreep from "./classes/BuilderCreep";
import getHarvesterCreep from "./classes/HarvesterCreep";
import getHaulerCreep from "./classes/HaulerCreep";
import getUpgraderCreep from "./classes/UpgraderCreep";

export { getBuilderCreep, getHarvesterCreep, getHaulerCreep, getUpgraderCreep };

export type CreepBody = WORK | CARRY | MOVE;

export type CreepBodyAbbreviations = {
  [bodyName: string]: string;
};

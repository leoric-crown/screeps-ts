import getBuilder from "./classes/Builder";
import getHarvester from "./classes/Harvester";
import getSourceHauler from "./classes/SourceHauler";
import getUpgraderCreep from "./classes/UpgraderCreep";
import getRemoteHarvester from "./classes/RemoteHarvester";
import getRemoteHauler from "./classes/RemoteHauler";
import getSupplier from "./classes/Supplier";

export {
  getBuilder,
  getHarvester,
  getSourceHauler,
  getUpgraderCreep,
  getRemoteHarvester,
  getRemoteHauler,
  getSupplier
};

export type CreepBody = WORK | CARRY | MOVE;

export type CreepBodyAbbreviations = {
  [bodyName: string]: string;
};

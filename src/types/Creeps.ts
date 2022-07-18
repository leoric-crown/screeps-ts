export type CreepBody = WORK | CARRY | MOVE;

export type CreepBodyAbbreviations = {
  [bodyName: string]: string;
};

export enum CreepType {
  HARVESTER = "harvester",
  BUILDER = "builder",
  UPGRADER = "upgrader",
  HAULER = "hauler"
}

export enum CreepRole {
  HARVESTER = "harvester",
  UPGRADER = "upgrader",
  BUILDER = "builder",
  HAULER = "hauler"
}

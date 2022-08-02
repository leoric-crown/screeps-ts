export enum StateCode {
  INIT = -1,
  HARVEST = 0,
  LOAD = 1,
  UPGRADE = 2,
  BUILD = 3,
  LOADSELF = 4,
  ATTACK = 5,
  HAUL = 6,
  LOAD_STRUCTURE = 7,
  REPAIR = 8,
  HEAL = 9,
  IDLE = 10,
  SPAWNING = 11,
  WAITING = 12
}

export const StateNames: {[code: number]: string} = {
  "-1": "INIT",
  0: "HARVEST",
  1: "LOAD",
  2: "UPGRADE",
  3: "BUILD",
  4: "LOADSELF",
  5: "ATTACK",
  6: "HAUL",
  7: "LOAD_STRUCTURE",
  8: "REPAIR",
  9: "HEAL",
  10: "IDLE",
  11: "SPAWNING",
  12: "WAITING",
}

export interface BaseCreepStates {
  init: CreepState;
}

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

export interface BaseRoomState {
  init: RoomState;
}

export type RoomState = {
  code: StateCode;
  run: () => void;
  transition: () => void;
};

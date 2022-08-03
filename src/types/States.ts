export enum StateCode {
  INIT = -1,
  MOVE = 0,
  HARVEST = 1,
  LOAD = 2,
  UPGRADE = 3,
  BUILD = 4,
  LOADSELF = 5,
  ATTACK = 6,
  HAUL = 7,
  LOAD_STRUCTURE = 8,
  REPAIR = 9,
  HEAL = 10,
  IDLE = 11,
  SPAWNING = 12,
  WAITING = 13,
}

const StateDictionary: { [code: string]: string } = {};
for (let name in StateCode) {
  const code = StateCode[name];
  StateDictionary[code] = name;
}
export { StateDictionary };

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

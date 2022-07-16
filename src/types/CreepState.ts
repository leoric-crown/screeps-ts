import ExtendedRoom from "../extend/ExtendedRoom";

export enum StateCode {
  INIT = -1,
  HARVESTING = 0,
  LOADING = 1,
  UPGRADING = 2,
  BUILDING = 3
}

export interface BaseCreepStates {
  init: CreepState;
}

export type CreepState = {
  code: StateCode;
  run: (room: ExtendedRoom) => void;
  transition: (room: ExtendedRoom) => void;
};


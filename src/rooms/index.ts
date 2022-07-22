import ExtendedRoom, { LoadableStructure } from "./ExtendedRoom";
import StatefulRoom, { RoomStateCode } from "./StatefulRoom";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

export { ExtendedRoom, LoadableStructure, StatefulRoom, RoomStateCode };

let _getStatefulRoom = (roomName: string, userName: string) =>
  new StatefulRoom(Game.rooms[roomName], userName);
if (profiler) {
  _getStatefulRoom = profiler.registerFN(_getStatefulRoom, "getStatefulRoom");
}
export const getStatefulRoom = _getStatefulRoom;

let _getExtendedRoom = (roomName: string, userName: string) =>
  new ExtendedRoom(Game.rooms[roomName], userName);
if (profiler) {
  _getExtendedRoom = profiler.registerFN(_getExtendedRoom, "getExtendedRoom");
}
export const getExtendedRoom = _getExtendedRoom;

import { CreepRole, CreepType } from "../types/Creeps";
import { CreepRoleStates } from "creeps/classes";
import ExtendedRoom from "./ExtendedRoom";

export class ExtendedCreep extends Creep {
  private _type?: CreepType | undefined;
  public get type(): CreepType | undefined {
    return this._type;
  }
  public set type(value: CreepType | undefined) {
    this._type = value;
  }
  private _role?: CreepRole | undefined;
  public get role(): CreepRole | undefined {
    return this._role;
  }
  public set role(value: CreepRole | undefined) {
    this._role = value;
  }
  private _states?: CreepRoleStates | undefined;
  public get states(): CreepRoleStates | undefined {
    return this._states;
  }
  public set states(value: CreepRoleStates | undefined) {
    this._states = value;
  }
  harvestProc: (room: ExtendedRoom) => void;
  loadProc: (room: ExtendedRoom) => void;
  loadSelfProc: (room: ExtendedRoom) => void;
  haulDroppedProc: (room: ExtendedRoom) => void;

  constructor(creep: Creep) {
    super(creep.id);
    this.harvestProc = (room: ExtendedRoom) => {
      if (this.harvest(room.sources[0]) === ERR_NOT_IN_RANGE) {
        this.moveTo(room.sources[0], {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    };
    this.loadProc = (room: ExtendedRoom) => {
      if (this.transfer(room.loadables[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        this.moveTo(room.loadables[0], {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    };
    this.loadSelfProc = (room: ExtendedRoom) => {
      const tryWithdraw = this.withdraw(
        room.spawns[0],
        RESOURCE_ENERGY,
        this.store.getFreeCapacity()
      );
      if (tryWithdraw === ERR_NOT_IN_RANGE) {
        this.moveTo(room.spawns[0]);
      }
    };
    this.haulDroppedProc = (room: ExtendedRoom) => {

    }
  }
}

export default ExtendedCreep;

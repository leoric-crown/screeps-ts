import { CreepRole, CreepType } from "../types/Creeps";
import { StateCode } from "types/CreepState";
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

  updateStateCode: (code: StateCode, message?: string) => void;

  harvestProc: (room: ExtendedRoom) => void;
  upgradeProc: (room: ExtendedRoom) => void;
  loadProc: (room: ExtendedRoom) => void;
  loadSelfProc: (room: ExtendedRoom) => void;
  buildProc: (room: ExtendedRoom) => void;
  haulDroppedProc: (room: ExtendedRoom) => void;

  constructor(creep: Creep) {
    super(creep.id);

    this.updateStateCode = (code: StateCode, message?: string) => {
      this.memory.state = code;
      if (message) this.say(message);
    };

    this.harvestProc = (room: ExtendedRoom) => {
      if (this.harvest(room.sources[0]) === ERR_NOT_IN_RANGE) {
        this.moveTo(room.sources[0], {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    };
    this.upgradeProc = (room: ExtendedRoom) => {
      if (
        room.controller &&
        this.upgradeController(room.controller) === ERR_NOT_IN_RANGE
      ) {
        this.moveTo(room.controller);
      }
    };
    this.loadProc = (room: ExtendedRoom) => {
      const target = this.pos.findClosestByPath(room.loadables) || room.spawns[0];
      if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        this.moveTo(target, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    };
    this.loadSelfProc = (room: ExtendedRoom) => {
      const target =
        this.pos.findClosestByPath(
          [...room.spawns, ...room.extensions].filter(structure => structure.energy >= 50)
        ) || room.spawns[0];
      const tryWithdraw = this.withdraw(target, RESOURCE_ENERGY);
      if (tryWithdraw === ERR_NOT_IN_RANGE) {
        this.moveTo(target);
      }
    };
    this.buildProc = (room: ExtendedRoom) => {
      if (room.buildables.length > 0) {
        const tryBuild = this.build(room.buildables[0]);
        if (tryBuild === ERR_NOT_IN_RANGE) {
          this.moveTo(room.buildables[0], {
            visualizePathStyle: { stroke: "#ffffff" }
          });
        }
      }
    };
    this.haulDroppedProc = (room: ExtendedRoom) => {};
  }
}

export default ExtendedCreep;

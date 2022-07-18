import { CreepRole, CreepType } from "../types/Creeps";
import { StateCode } from "types/States";
import { CreepRoleStates } from "creeps/classes";
import ExtendedRoom, { LoadableStructure } from "./ExtendedRoom";

export type CreepTarget = Creep | ConstructionSite | Structure;

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

  target?: CreepTarget;

  updateStateCode: (code: StateCode, message?: string) => void;

  // findTarget: (list: CreepTarget[], filter: any) => CreepTarget

  harvestProc: (room: ExtendedRoom) => void;
  upgradeProc: (room: ExtendedRoom) => void;
  loadProc: (room: ExtendedRoom, filter?: (structure: Structure) => boolean) => void;
  loadSelfProc: (room: ExtendedRoom) => void;
  buildProc: (room: ExtendedRoom) => void;
  haulProc: (room: ExtendedRoom) => void;
  loadStructureProc: (room: ExtendedRoom) => void;

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
    this.loadProc = (room: ExtendedRoom, filter?: (structure: Structure) => boolean) => {
      const targets = filter ? room.loadables.filter(filter) : room.loadables;

      let target: CreepTarget | undefined = undefined;
      if (this.memory.target) {
        const fetchedObject = Game.getObjectById(this.memory.target as Id<CreepTarget>);
        target = (fetchedObject as CreepTarget) || undefined;
      }

      if (target == undefined)
        target = this.pos.findClosestByPath(targets) || room.spawns[0];
      console.log(`target is ${target}, ${this.name}`);
      const tryLoad = this.transfer(target as LoadableStructure, RESOURCE_ENERGY);
      console.log(`tryLoad: ${tryLoad}`);
      if (tryLoad === ERR_NOT_IN_RANGE) {
        this.moveTo(target, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      } else if (tryLoad === ERR_FULL) {
        console.log(`target ${this.memory.target} is full`);
        this.memory.target = undefined;
      }
    };
    this.loadSelfProc = (room: ExtendedRoom) => {
      const findTarget =
        this.pos.findClosestByPath(
          [...room.spawns, ...room.extensions].filter(structure => structure.energy > 0)
        ) || room.spawns[0];
      const tryWithdraw = this.withdraw(findTarget, RESOURCE_ENERGY);
      if (tryWithdraw === ERR_NOT_IN_RANGE) {
        this.moveTo(findTarget);
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
    this.haulProc = (room: ExtendedRoom) => {
      let target: CreepTarget | undefined = undefined;
      if (this.memory.target) {
        const fetchedObject = Game.getObjectById(this.memory.target as Id<CreepTarget>);
        target = (fetchedObject as CreepTarget) || undefined;
      }
      if (target == undefined) {
        const findTarget =
          this.pos.findClosestByPath(room.containersAndStorage, {
            filter: structure =>
              structure.store.getUsedCapacity(RESOURCE_ENERGY) >=
              this.store.getFreeCapacity(RESOURCE_ENERGY)
          }) || undefined;
        if (findTarget) {
          target = findTarget;
          this.memory.target = findTarget.id;
        }
      }

      if (target !== undefined) {
        console.log("there is a target", target);
        const tryWithdraw = this.withdraw(
          target as StructureContainer | StructureStorage,
          RESOURCE_ENERGY
        );
        if (tryWithdraw === ERR_NOT_IN_RANGE) {
          console.log("moving to withdraw");
          this.moveTo(target);
        } else console.log("tryWithdraw ", tryWithdraw);
      } else console.log("there is no target");
    };
    this.loadStructureProc = (room: ExtendedRoom) => {
      const target = room.spawns[0].pos.findClosestByPath(room.managedStructures);
      console.log(`target = ${target}`);
      if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) >= 50) {
        if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
          this.moveTo(target);
      }
    };
  }
}

export default ExtendedCreep;

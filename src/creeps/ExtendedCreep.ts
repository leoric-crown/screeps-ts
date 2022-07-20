import { CreepRole, CreepType } from "../types/Creeps";
import { StateCode } from "types/States";
import { CreepRoleStates } from "creeps/classes";
import { LoadableStructure } from "../rooms/ExtendedRoom";
import { StatefulRoom } from "rooms";

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

  harvestProc: (room: StatefulRoom) => void;
  upgradeProc: (room: StatefulRoom) => void;
  loadProc: (room: StatefulRoom, filter?: (structure: Structure) => boolean) => void;
  loadSelfProc: (room: StatefulRoom) => void;
  buildProc: (room: StatefulRoom) => void;
  haulProc: (room: StatefulRoom) => void;
  loadStructureProc: (room: StatefulRoom) => void;

  constructor(creep: Creep) {
    super(creep.id);

    this.updateStateCode = (code: StateCode, message?: string) => {
      this.memory.state = code;
      this.memory.target = undefined;
      if (message) this.say(message);
    };

    this.harvestProc = (room: StatefulRoom) => {
      const targetSource = this.pos.findClosestByPath(room.activeSources);
      if (targetSource && this.harvest(targetSource) === ERR_NOT_IN_RANGE) {
        this.moveTo(targetSource, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      }
    };
    this.upgradeProc = (room: StatefulRoom) => {
      if (
        room.controller &&
        this.upgradeController(room.controller) === ERR_NOT_IN_RANGE
      ) {
        this.moveTo(room.controller);
      }
    };
    this.loadProc = (room: StatefulRoom, filter?: (structure: Structure) => boolean) => {
      const targets = filter ? room.loadables.filter(filter) : room.loadables;

      let target: LoadableStructure | undefined = undefined;
      if (this.memory.target) {
        const fetchedObject = Game.getObjectById(
          this.memory.target as Id<LoadableStructure>
        );
        target = (fetchedObject as LoadableStructure) || undefined;
        if (target && target.store.getFreeCapacity() === 0) target = undefined;
      }

      if (target == undefined)
        target = this.pos.findClosestByPath(targets) || room.spawns[0];
      const tryLoad = this.transfer(target as LoadableStructure, RESOURCE_ENERGY);
      if (tryLoad === ERR_NOT_IN_RANGE) {
        this.moveTo(target, {
          visualizePathStyle: { stroke: "#ffffff" }
        });
      } else if (tryLoad === ERR_FULL) {
        this.memory.target = undefined;
      }
    };
    this.loadSelfProc = (room: StatefulRoom) => {
      const target =
        this.pos.findClosestByPath(
          [...room.spawns, ...room.extensions].filter(structure => structure.energy > 0)
        ) || room.spawns[0];
      const tryWithdraw = this.withdraw(target, RESOURCE_ENERGY);
      if (tryWithdraw === ERR_NOT_IN_RANGE) {
        this.moveTo(target);
      }
    };
    this.buildProc = (room: StatefulRoom) => {
      if (room.buildables.length > 0) {
        const tryBuild = this.build(room.buildables[0]);
        if (tryBuild === ERR_NOT_IN_RANGE) {
          this.moveTo(room.buildables[0], {
            visualizePathStyle: { stroke: "#ffffff" }
          });
        }
      }
    };
    this.haulProc = (room: StatefulRoom) => {
      let target: LoadableStructure | undefined = undefined;
      if (this.memory.target) {
        const fetchedObject = Game.getObjectById(
          this.memory.target as Id<LoadableStructure>
        );
        target = (fetchedObject as LoadableStructure) || undefined;
        if (target && target.store.getFreeCapacity() === 0) target = undefined;
      }
      if (target == undefined) {
        const findTarget =
          this.pos.findClosestByPath(room.containersAndStorage, {
            filter: structure => structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          }) || undefined;
        if (findTarget) {
          target = findTarget;
          this.memory.target = findTarget.id;
        }
      }

      if (target !== undefined) {
        const tryWithdraw = this.withdraw(
          target as StructureContainer | StructureStorage,
          RESOURCE_ENERGY
        );
        if (tryWithdraw === ERR_NOT_IN_RANGE) {
          this.moveTo(target);
        } else if (tryWithdraw === ERR_NOT_ENOUGH_ENERGY) {
          this.memory.target = undefined;
        }
      }
    };
    this.loadStructureProc = (room: StatefulRoom) => {
      const targets = room.managedStructures
        .filter(
          structure =>
            structure.store.getFreeCapacity() !== 0 &&
            structure.structureType !== STRUCTURE_SPAWN
        )
        .sort((a, b) => (a.store.energy < b.store.energy ? -1 : 1))
        .filter((structure, idx, structures) => {
          return structure.store.energy === structures[0].store.energy;
        });

      const target = this.pos.findClosestByPath(targets);
      if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) >= 50) {
        if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
          this.moveTo(target);
      }
    };
  }
}

export default ExtendedCreep;

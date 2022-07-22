import { RoomState } from "types/States";
import CreepManager from "creeps/CreepManager";
import creepConfigs, { CreepConfig } from "creeps/creeps.config";
import StructureManager, { ManagedStructure } from "../structures/StructureManager";
import ExtendedRoom from "./ExtendedRoom";

export enum RoomStateCode {
  DEFAULT = 0,
  DEFENSE = 1
}

class StatefulRoom extends ExtendedRoom implements Room {
  creepManager: CreepManager;
  structureManager: StructureManager;
  creepConfigs: CreepConfig[];
  // states: RoomState
  rcl: number;
  activeSources: Source[];

  // Energy management
  minAvailableEnergy: number;
  supplyQueue: ManagedStructure[];
  buildQueue: ConstructionSite[];
  repairQueue: Structure[];

  // Defense
  underAttack: boolean;
  attackTargets: Creep[];

  run: () => void;

  constructor(room: Room, username?: string) {
    super(room, username);
    this.creepManager = new CreepManager(this);
    this.structureManager = new StructureManager(this);
    this.creepConfigs = creepConfigs;

    this.rcl = room.controller?.level || 0;
    this.activeSources = this.sources.filter(source => source.energy > 0);

    this.minAvailableEnergy = 650;
    this.supplyQueue = this.structuresToFill;
    this.buildQueue = this.buildables;
    this.repairQueue = this.damagedStructures;

    this.underAttack = this.hostileCreeps.length > 0;
    this.attackTargets = this.hostileCreeps;

    this.run = () => {
      this.structureManager.run();
      this.creepManager.run();
    };
  }
}

export default StatefulRoom;

import CreepManager from "creeps/CreepManager";
import creepConfigs, { CreepConfig } from "creeps/creeps.config";
import Spawner from "structures/classes/Spawner";
import StructureManager from "../structures/StructureManager";
import ExtendedRoom from "./ExtendedRoom";

export enum RoomStateCode {
  DEFAULT = 0
}

class StatefulRoom extends ExtendedRoom {
  rcl: number;

  spawner: Spawner | undefined;
  creepManager: CreepManager;
  structureManager: StructureManager;
  creepConfigs: CreepConfig[];

  //   structuresToFill: ManagedStructure[];
  //   buildQueue: ConstructionSite[];

  run: () => void;
  transition: () => void;

  constructor(room: Room, username?: string) {
    super(room, username);
    this.rcl = room.controller?.level || 0;
    this.spawner = this.spawns.length > 0 ? new Spawner(this.spawns[0], this) : undefined;
    this.creepManager = new CreepManager(this);
    this.structureManager = new StructureManager(this);
    this.creepConfigs = creepConfigs;

    this.run = () => {
      this.structureManager.run();
      this.creepManager.run();
    };

    this.transition = () => {};
  }
}

export default StatefulRoom;

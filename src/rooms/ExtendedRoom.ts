import { RoomStateCode } from ".";
import { ExtendedCreep, getExtendedCreep } from "creeps";
import { ManagedStructure } from "structures/StructureManager";
//@ts-ignore
import profiler from "../utils/screeps-profiler"

export type LoadableStructure =
  | StructureSpawn
  | StructureExtension
  | StructureContainer
  | StructureStorage;

declare global {
  interface RoomMemory {
    state?: RoomStateCode;
  }
}

class ExtendedRoom extends Room {
  // Player
  username: string | undefined;
  // Creeps
  creeps: ExtendedCreep[];
  hostileCreeps: Creep[];
  // Energy
  structuresToFill: ManagedStructure[];
  containersAndStorage: (StructureContainer | StructureStorage)[];
  energyInStorage: number;
  // Structures
  spawns: StructureSpawn[];
  sources: Source[];
  controller: StructureController | undefined;
  buildables: ConstructionSite[];
  loadables: LoadableStructure[];
  extensions: StructureExtension[];
  containers: StructureContainer[];
  managedStructures: ManagedStructure[];
  damagedStructures: Structure[];

  constructor(room: Room, username?: string) {
    super(room.name);
    this.memory.state = 0;
    // Player
    this.username = username;

    // Creeps
    const { creeps, hostileCreeps } = room.find(FIND_CREEPS).reduce(
      (memo, creep) => {
        if (creep.owner.username === this.username) {
          memo.creeps.push(getExtendedCreep(creep, creep.memory.type, creep.memory.role));
        } else {
          memo.hostileCreeps.push(creep);
        }
        return memo;
      },
      { creeps: [] as ExtendedCreep[], hostileCreeps: [] as Creep[] }
    );
    this.creeps = creeps;
    this.hostileCreeps = hostileCreeps;

    // Energy
    this.energyAvailable = room.energyAvailable;
    this.energyCapacityAvailable = room.energyCapacityAvailable;

    // Structures
    const { loadables, extensions, containers, managedStructures, damagedStructures } =
      this.getStructureLists(room);
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.sources = room.find(FIND_SOURCES);
    this.controller = room.controller || undefined;
    this.buildables = room.find(FIND_CONSTRUCTION_SITES);
    this.loadables = loadables;
    this.extensions = extensions;
    this.containers = containers;
    this.managedStructures = managedStructures;
    this.damagedStructures = damagedStructures;

    this.structuresToFill =
      this.managedStructures.filter(structure => {
        return (
          structure.store.getUsedCapacity(RESOURCE_ENERGY) /
            structure.store.getCapacity(RESOURCE_ENERGY) <
          0.3
        );
      }) || [];

    this.containersAndStorage = room.storage
      ? [...this.containers, room.storage]
      : this.containers;

    this.energyInStorage = this.containersAndStorage.reduce((memo, structure) => {
      return memo + structure.store.getUsedCapacity(RESOURCE_ENERGY);
    }, 0);

    console.log(
      `Room: [room ${this.name}] - numStructuresToFill=${this.structuresToFill.length}, energyInStorage: ${this.energyInStorage}, energyAvailable: ${this.energyAvailable} / ${this.energyCapacityAvailable}`
    );
  }

  getStructureLists = (room: Room) => {
    const loadables: LoadableStructure[] = [];
    const extensions: StructureExtension[] = [];
    const managedStructures: ManagedStructure[] = [];
    const damagedStructures: Structure[] = [];
    const containers: StructureContainer[] = [];
    room.find(FIND_STRUCTURES).forEach((structure: AnyStructure) => {
      const structureType = structure.structureType;
      if (isLoadable(structure)) loadables.push(structure as LoadableStructure);
      if (structureType === STRUCTURE_EXTENSION) extensions.push(structure);
      if (isManaged(structure)) managedStructures.push(structure as ManagedStructure);
      if (structure.hits < structure.hitsMax) damagedStructures.push(structure);
      if (structureType === STRUCTURE_CONTAINER) containers.push(structure);
    });
    console.log(
      `Room: [room ${this.name}] - numManagedStructures=${managedStructures.length}, numExtensions=${extensions.length}, numLoadables=${loadables.length}, damagedStructures=${damagedStructures.length}`
    );

    return { loadables, extensions, containers, managedStructures, damagedStructures };
  };
}

const isManaged = (structure: AnyStructure) => {
  switch (structure.structureType) {
    case STRUCTURE_TOWER:
    case STRUCTURE_LINK:
    case STRUCTURE_SPAWN:
      return true;
    default:
      return false;
  }
};

const isLoadable = (structure: AnyStructure) => {
  try {
    structure = structure as LoadableStructure;
    return (
      structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY)
    );
  } catch {
    return false;
  }
};

export default ExtendedRoom;

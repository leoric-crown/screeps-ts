import { getExtendedCreep } from "creeps/classes";
import { ManagedStructure } from "structures/StructureManager";
import { ExtendedCreepList } from "types/CreepsList";

export type LoadableStructure =
  | StructureSpawn
  | StructureTower
  | StructureExtension
  | StructureContainer
  | StructureStorage;

class ExtendedRoom extends Room {
  creeps: ExtendedCreepList;
  spawns: StructureSpawn[];
  sources: Source[];
  buildables: ConstructionSite[];
  loadables: LoadableStructure[];
  extensions: StructureExtension[];
  containers: StructureContainer[];
  managedStructures: ManagedStructure[];
  damagedStructures: Structure[];
  minAvailableEnergy: number;

  structuresToFill: ManagedStructure[];
  containersAndStorage: (StructureContainer | StructureStorage)[];
  energyInStorage: number;

  constructor(room: Room) {
    super(room.name);
    this.creeps = room.find(FIND_MY_CREEPS).reduce((memo, creep) => {
      memo[creep.name] = getExtendedCreep(creep, creep.memory.type, creep.memory.role);
      return memo;
    }, {} as ExtendedCreepList);
    this.energyAvailable = room.energyAvailable;
    this.energyCapacityAvailable = room.energyCapacityAvailable;
    this.minAvailableEnergy = 650;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.sources = room.find(FIND_SOURCES);
    this.controller = room.controller || undefined;
    this.buildables = room.find(FIND_CONSTRUCTION_SITES);
    const { loadables, extensions, containers, managedStructures, damagedStructures } =
      this.getStructureLists(room);
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
    console.log(`Room: ${this.name} numStructuresToFill=${this.structuresToFill.length}`);

    this.containersAndStorage = room.storage
      ? [...this.containers, room.storage]
      : this.containers;

    this.energyInStorage = this.containersAndStorage.reduce((memo, structure) => {
      return memo + structure.store.getUsedCapacity(RESOURCE_ENERGY);
    }, 0);
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
      `Room: ${this.name} numManagedStructures=${managedStructures.length}, numExtensions=${extensions.length}, numLoadables=${loadables.length}, damagedStructures=${damagedStructures.length}`
    );

    return { loadables, extensions, containers, managedStructures, damagedStructures };
  };

}

const isManaged = (structure: AnyStructure) => {
  switch (structure.structureType) {
    case STRUCTURE_TOWER:
    case STRUCTURE_LINK:
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

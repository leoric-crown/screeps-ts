type LoadableStructure =
  | StructureSpawn
  | StructureTower
  | StructureExtension
  | StructureContainer
  | StructureStorage;

class ExtendedRoom extends Room {
  spawns: StructureSpawn[];
  sources: Source[];
  buildables: ConstructionSite[];
  loadables: LoadableStructure[];


  constructor(room: Room) {
    super(room.name);
    this.energyAvailable = room.energyAvailable
    this.energyCapacityAvailable = room.energyCapacityAvailable
    this.spawns = room.find(FIND_MY_SPAWNS)
    this.sources = room.find(FIND_SOURCES);
    this.controller = room.controller || undefined;
    this.buildables = room.find(FIND_CONSTRUCTION_SITES);
    this.loadables = room.find(FIND_STRUCTURES, {
      filter: (structure: AnyStructure) => {
        return isLoadable(structure);
      }
    });
  }
}

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

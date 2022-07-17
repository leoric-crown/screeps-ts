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
  extensions: StructureExtension[];
  minAvailableEnergy: number;


  constructor(room: Room) {
    super(room.name);
    this.energyAvailable = room.energyAvailable
    this.energyCapacityAvailable = room.energyCapacityAvailable
    this.minAvailableEnergy = 450;
    this.spawns = room.find(FIND_MY_SPAWNS)
    this.sources = room.find(FIND_SOURCES);
    this.controller = room.controller || undefined;
    this.buildables = room.find(FIND_CONSTRUCTION_SITES);
    this.loadables = room.find(FIND_STRUCTURES, {
      filter: (structure: AnyStructure) => {
        return isLoadable(structure);
      }
    });
    this.extensions = room.find(FIND_MY_STRUCTURES, {
      filter: (structure: AnyStructure) => {
        if (structure.structureType === 'extension') {
          return structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 50
        } else return false
      }
    })
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

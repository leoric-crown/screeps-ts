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
  towers: StructureTower[];
  minAvailableEnergy: number;

  constructor(room: Room) {
    super(room.name);
    this.energyAvailable = room.energyAvailable;
    this.energyCapacityAvailable = room.energyCapacityAvailable;
    this.minAvailableEnergy = 550;
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.sources = room.find(FIND_SOURCES);
    this.controller = room.controller || undefined;
    this.buildables = room.find(FIND_CONSTRUCTION_SITES);
    const { loadables, extensions, towers } = getStructureLists(room);
    this.loadables = loadables;
    this.extensions = extensions;
    this.towers = towers;
  }
}

const getStructureLists = (room: Room) => {
  const loadables: LoadableStructure[] = [];
  const extensions: StructureExtension[] = [];
  const towers: StructureTower[] = [];
  room.find(FIND_STRUCTURES).forEach((structure: AnyStructure) => {
    const structureType = structure.structureType;
    if (isLoadable(structure)) loadables.push(structure as LoadableStructure);
    if (structureType === STRUCTURE_EXTENSION) extensions.push(structure);
    if (structureType === STRUCTURE_TOWER) towers.push(structure);
  });
  console.log(
    `numtowers=${towers.length}, numextensions=${extensions.length}, numloadables=${loadables.length}`
  );
  return { loadables, extensions, towers };
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

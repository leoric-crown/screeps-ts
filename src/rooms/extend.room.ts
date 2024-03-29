import { ContainerType } from "types/States";

type DamagedStructures = {
  roads: StructureRoad[];
  defenses: (StructureWall | StructureRampart)[];
  others: Structure[];
  total: number;
};

declare global {
  // type LoadableStructure = StructureSpawn | StructureExtension;
  // | StructureContainer
  // | StructureStorage;

  interface RoomMemory {
    minAvailableEnergy: number;
    remoteSources: RemoteSource[];
    containers: { [containerId: string]: ContainerMemory };
  }

  type RemoteSource = {
    remoteRoom: string;
    sourceId: Id<Source>;
    pos: { x: number; y: number };
  };

  interface Room {
    owner: string | undefined;

    creeps: {
      mine: Creep[];
      hostile: Creep[];
    };
    damagedCreeps: {
      mine: Creep[];
      hostile: Creep[];
    };

    remoteCreeps: Creep[];

    remoteSources: RemoteSource[];

    spawns: StructureSpawn[];
    sources: Source[];

    buildables: ConstructionSite[];
    // structures
    // loadables: LoadableStructure[];
    extensions: StructureExtension[];
    containers: StructureContainer[];
    managedStructures: ManagedStructure[];
    damagedStructures: DamagedStructures;

    minAvailableEnergy: number;

    structuresToFill: ManagedStructure[];
    containersAndStorage: (StructureContainer | StructureStorage)[];
    energyInStorage: number;
  }
}

const extendRoom = function () {
  Object.defineProperty(Room.prototype, "minAvailableEnergy", {
    get: function () {
      this._minAvailableEnergy = this.memory.minAvailableEnergy;
      if (!this._minAvailableEnergy) this._minAvailableEnergy = 300;
      return this._minAvailableEnergy;
    },
    set: function (value: number) {
      this.memory.minAvailableEnergy = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "owner", {
    get: function () {
      if (!this._owner) {
        this._owner = this.controller?.owner || undefined;
      }
      return this._owner as string | undefined;
    },
    set: function (value: string | undefined) {
      this._owner = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "creeps", {
    get: function () {
      if (!this._creeps) {
        this._creeps = getCreeps(this.find(FIND_CREEPS));
      }
      return this._creeps as { mine: Creep[]; hostile: Creep[] };
    },
    set: function (value: { mine: Creep[]; hostile: Creep[] }) {
      this._creeps = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "damagedCreeps", {
    get: function () {
      if (!this._damagedCreeps) {
        const damagedFilter = (creep: Creep) => creep.hits < creep.hitsMax;
        this._damagedCreeps = {
          mine: this.creeps.mine.filter(damagedFilter),
          hostile: this.creeps.hostile.filter(damagedFilter)
        };
      }
      return this._damagedCreeps;
    },
    set: function (value: { mine: Creep[]; hostile: Creep[] }) {
      this._damagedCreeps = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "remoteCreeps", {
    get: function () {
      if (!this._remoteCreeps) {
        this._remoteCreeps = Object.values(Game.creeps).filter(
          creep => creep.memory.home === this.name
        );
      }
      return this._remoteCreeps;
    }
  });

  Object.defineProperty(Room.prototype, "remoteSources", {
    get: function () {
      if (!this.memory.remoteSources) {
        this._remoteSources = [];
        this.memory.remoteSources = this._remoteSources;
      } else if (!this._remoteSources) {
        this._remoteSources = this.memory.remoteSources;
      }
      return this._remoteSources;
    },
    set: function (value: RemoteSource[]) {
      this._remoteSources = value;
      this.memory.remoteSources = value;
    }
  });

  Object.defineProperty(Room.prototype, "spawns", {
    get: function () {
      if (!this._spawns) {
        this._spawns = this.find(FIND_MY_SPAWNS);
      }
      return this._spawns as StructureSpawn[];
    },
    set: function (value: StructureSpawn[]) {
      this._spawns = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "sources", {
    get: function () {
      if (!this._sources) {
        this._sources = this.find(FIND_SOURCES);
      }
      return this._sources as Source[];
    },
    set: function (value: Source[]) {
      this._sources = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "buildables", {
    get: function () {
      if (!this._buildables) {
        this._buildables = this.find(FIND_MY_CONSTRUCTION_SITES);
      }
      return this._buildables as ConstructionSite[];
    },
    set: function (value: ConstructionSite[]) {
      this._buildables = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "structures", {
    get: function () {
      if (!this._structures) {
        this._structures = this.find(FIND_STRUCTURES);
      }
      return this._structures as Structure[];
    },
    set: function (value: Structure[]) {
      this._structures = value;
    },
    enumerable: true,
    configurable: true
  });

  // Object.defineProperty(Room.prototype, "loadables", {
  //   get: function () {
  //     if (!this._loadables) {
  //       this._loadables = this._getStructureLists(this.structures).loadables;
  //     }
  //     return this._loadables as LoadableStructure[];
  //   },
  //   set: function (value: LoadableStructure[]) {
  //     this._loadables = value;
  //   },
  //   enumerable: true,
  //   configurable: true
  // });

  Object.defineProperty(Room.prototype, "extensions", {
    get: function () {
      if (!this._extensions) {
        this._extensions = this._getStructureLists(this.structures).extensions;
      }
      return this._extensions as StructureExtension[];
    },
    set: function (value: StructureExtension[]) {
      this._extensions = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "containers", {
    get: function () {
      if (!this._containers) {
        this._containers = this._getStructureLists(this.structures).containers;
      }
      return this._containers as StructureContainer[];
    },
    set: function (value: StructureContainer[]) {
      this._containers = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "managedStructures", {
    get: function () {
      if (!this._managedStructures) {
        this._managedStructures = this._getStructureLists(
          this.structures
        ).managedStructures;
      }
      return this._managedStructures as ManagedStructure[];
    },
    set: function (value) {
      this._managedStructures = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "damagedStructures", {
    get: function (): DamagedStructures {
      if (!this._damagedStructures) {
        this._damagedStructures = this._getStructureLists(
          this.structures
        ).damagedStructures;
      }
      return this._damagedStructures;
    },
    set: function (value) {
      this._damagedStructures = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "structuresToFill", {
    get: function () {
      if (!this._structuresToFill) {
        this._structuresToFill = this.managedStructures.filter(
          (structure: ManagedStructure) => {
            const minStructureCapacity = 0.3; // add this property to Structure
            return (
              structure.store.getUsedCapacity(RESOURCE_ENERGY) /
                structure.store.getCapacity(RESOURCE_ENERGY) <
              minStructureCapacity
            );
          }
        );
      }
      return this._structuresToFill as ManagedStructure[];
    },
    set: function (value: ManagedStructure) {
      this._structuresToFill = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "containersAndStorage", {
    get: function () {
      if (!this._containersAndStorage) {
        this._containersAndStorage = this.storage
          ? [...this.containers, this.storage]
          : this.containers;
      }
      return this._containersAndStorage as (StructureContainer | StructureStorage)[];
    },
    set: function (value: (StructureContainer | StructureStorage)[]) {
      this._containersAndStorage = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "energyInStorage", {
    get: function () {
      if (!this._energyInStorage) {
        this._energyInStorage = this.containersAndStorage.reduce(
          (memo: number, structure: StructureContainer | StructureStorage) => {
            return memo + structure.store.getUsedCapacity(RESOURCE_ENERGY);
          },
          0
        );
      }
      return this._energyInStorage as number;
    },
    set: function (value: number) {
      this._energyInStorage = value;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Room.prototype, "_getStructureLists", {
    value: function (structures: Structure[]) {
      const loadables: Structure[] = [];
      const extensions: Structure[] = [];
      const containers: Structure[] = [];
      const managedStructures: Structure[] = [];
      const damagedStructures: Structure[] = [];

      structures.forEach(structure => {
        const structureType = structure.structureType;
        if (isLoadable(structure as AnyStoreStructure)) loadables.push(structure);
        if (isManaged(structure as AnyStructure)) managedStructures.push(structure);
        if (structureType === STRUCTURE_EXTENSION) extensions.push(structure);
        if (structureType === STRUCTURE_CONTAINER) containers.push(structure);
        if (structure.hits < structure.hitsMax) damagedStructures.push(structure);
      });
      !this._loadables && (this._loadables = loadables);
      !this._extensions && (this._extensions = extensions);
      !this._containers && (this._containers = containers);
      !this._managedStructures && (this._managedStructures = managedStructures);
      !this._damagedStructures &&
        (this._damagedStructures = splitRepairables(damagedStructures));

      return { loadables, extensions, containers, managedStructures, damagedStructures };
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
};

const getCreeps = (creeps: Creep[]) => {
  const mine: Creep[] = [];
  const hostile: Creep[] = [];
  creeps.forEach(creep => {
    creep.mine ? mine.push(creep) : hostile.push(creep);
  });
  return {
    mine: mine,
    hostile: hostile
  };
};

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

const isLoadable = (structure: AnyStoreStructure) => {
  switch (structure.structureType) {
    case STRUCTURE_SPAWN:
    case STRUCTURE_EXTENSION:
      // case STRUCTURE_CONTAINER:
      // case STRUCTURE_STORAGE:
      return (
        structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY)
      );
    default:
      return false;
  }
};

const splitRepairables = (structures: Structure[]): DamagedStructures => {
  const roads: StructureRoad[] = [];
  const defenses: (StructureWall | StructureRampart)[] = [];
  const others: Structure[] = [];
  structures.forEach(structure => {
    const structureType = structure.structureType;
    switch (structureType) {
      case STRUCTURE_ROAD:
        roads.push(structure as StructureRoad);
        break;
      case STRUCTURE_WALL:
      case STRUCTURE_RAMPART:
        defenses.push(structure as StructureWall | StructureRampart);
        break;
      default:
        others.push(structure);
    }
  });
  return { roads, defenses, others, total: structures.length };
};

export default extendRoom;

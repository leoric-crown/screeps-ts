import StatefulRoom from "../rooms/StatefulRoom";
import { StatefulStructureList } from "../types/CreepsList";
import { StateCode, StructureState } from "types/States";
import { StatefulStructure } from "./ExtendedStructure";
import Tower from "./classes/Tower"
import Spawner from "./classes/Spawner"
//@ts-ignore
import profiler from "../utils/screeps-profiler";

let _getStatefulStructure = (
  structure: Structure,
  room: StatefulRoom
): StatefulStructure => {
  switch (structure.structureType) {
    case STRUCTURE_TOWER:
      return new Tower(structure as StructureTower, room);
    case STRUCTURE_SPAWN:
      return new Spawner(structure as StructureSpawn, room);
    default:
      throw new Error(
        `There was an error getting StatefulStructure for: id: ${structure.id}, type: ${structure.structureType}`
      );
  }
};
if (profiler) _getStatefulStructure = profiler.registerFN(_getStatefulStructure, "getStatefulStructure");
export const getStatefulStructure = _getStatefulStructure

export type ManagedStructure = StructureSpawn | StructureTower | StructureLink;

class StructureManager {
  structures: StatefulStructureList;
  room: StatefulRoom;

  run: () => void;
  spawners: StructureSpawn[];
  private runStructures: () => void;

  constructor(room: StatefulRoom) {
    this.room = room;
    const spawners: StructureSpawn[] = [];
    const structureList = {} as StatefulStructureList;
    _.forEach(room.managedStructures, structure => {
      structureList[structure.id] = getStatefulStructure(structure, room);
      structure.structureType === STRUCTURE_SPAWN && spawners.push(structure);
    });
    this.structures = structureList;
    this.spawners = spawners;

    this.run = () => {
      // add logging here

      this.runStructures();
    };

    this.runStructures = () => {
      for (let structure of Object.values(this.structures)) {
        structure = initMemory(structure);
        const structureStates = Object(structure.states);
        for (let state in structureStates) {
          if (structure.memory.state === structureStates[state].code) {
            const stateToRun = structureStates[state] as StructureState;
            stateToRun.run();
            stateToRun.transition();
          }
        }
      }
    };
  }
}

const initMemory = (structure: StatefulStructure) => {
  !Object(structure.memory).hasOwnProperty("state") &&
    (structure.memory.state = structure.states?.init.code as StateCode);

  return structure;
};

export default StructureManager;

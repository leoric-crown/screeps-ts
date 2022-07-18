import ExtendedRoom from "../extend/ExtendedRoom";
import ExtendedStructure from "extend/ExtendedStructure";
import { ExtendedStructureList } from "../types/CreepsList";
import { StateCode, StructureState } from "types/States";
import { getExtendedStructure } from "./classes";

export type ManagedStructure = StructureTower | StructureLink;

class StructureManager {
  structures: ExtendedStructureList;
  room: ExtendedRoom;

  run: () => void;
  private runStructures: () => void;

  constructor(room: ExtendedRoom) {
    this.room = room;
    const structureList = {} as ExtendedStructureList;
    _.forEach(room.managedStructures, structure => {
      structureList[structure.id] = getExtendedStructure(structure, room);
    });
    this.structures = structureList;

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
            (structureStates[state] as StructureState).run(room);
            (structureStates[state] as StructureState).transition(room);
          }
        }
      }
    };
  }
}

const initMemory = (structure: ExtendedStructure) => {
  !Object(structure.memory).hasOwnProperty("state") &&
    (structure.memory.state = structure.states?.init.code as StateCode);

  return structure;
};

export default StructureManager;

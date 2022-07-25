import { StatefulStructureList } from "../types/CreepsList";
import { getStatefulStructure } from "../structures/extend.structure";
//@ts-ignore
import profiler from "../utils/screeps-profiler";

declare global {
  type ManagedStructure = StructureSpawn | StructureTower | StructureLink;
}

class StructureManager {
  structures: StatefulStructureList;
  room: Room;

  run: () => void;
  private runStructures: () => void;

  constructor(room: Room) {
    this.room = room;
    const structureList = {} as StatefulStructureList;
    _.forEach(room.managedStructures, structure => {
      let stateful = getStatefulStructure(structure);
      structureList[structure.id] = stateful;
    });
    this.structures = structureList;

    let _run = () => {
      // add logging here

      this.runStructures();
    };
    if (profiler) _run = profiler.registerFN(_run, "StructureManager.run");
    this.run = _run;

    this.runStructures = () => {
      for (let [id, structure] of Object.entries(this.structures)) {
        structure = initMemory(structure);
        const structureStates = Object(structure.states);
        if (structure.states)
          for (let stateName of Object.keys(structure.states)) {
            const stateToRun = structureStates[stateName] as StructureState;
            if (structure.memory.state === stateToRun.code) {
              stateToRun.run();
              stateToRun.transition();
            }
          }
      }
    };
  }
}

const initMemory = (structure: StatefulStructure) => {
  if (!structure.memory?.state) {
    structure.memory = { state: structure.states?.init.code };
  }

  return structure;
};

export default StructureManager;

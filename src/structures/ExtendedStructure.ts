import { BaseStructureStates, StateCode } from "types/States";
import StatefulRoom from "rooms/StatefulRoom";

export interface StructureMemory {
  state?: StateCode;
  spawningCreep?: {
    type: string;
    role: string;
    cost: number;
  }
}

export interface StatefulStructure extends ExtendedStructure {
  states: BaseStructureStates;
}

const emptyMemory = {} as StructureMemory;

class ExtendedStructure extends Structure {
  room: StatefulRoom;
  updateStateCode: (code: StateCode, message?: string) => void;

  public get memory(): StructureMemory {
    return Memory.structures[this.id];
  }
  public set memory(value: StructureMemory) {
    Memory.structures[this.id] = value;
  }

  constructor(structure: Structure, room: StatefulRoom) {
    super(structure.id);
    this.room = room;
    this.memory = (Memory.structures[this.id] || emptyMemory) as StructureMemory;

    this.updateStateCode = (code: StateCode, message?: string) => {
      this.memory.state = code;
      if (message)
        global.log(
          `Message from ${this.structureType} structure (id: ${this.id}): ${message}`
        );
    };
  }
}

export default ExtendedStructure;

import { StateCode } from "types/States";
import { StructureStates, Tower } from "../structures/classes";
import ExtendedRoom from "./ExtendedRoom";

export interface StructureMemory {
  state?: StateCode;
}

const emptyMemory = {} as StructureMemory;
class ExtendedStructure extends Structure {
  room: ExtendedRoom;

  public get memory(): StructureMemory {
    return Memory.structure[this.id];

  }
  public set memory(value: StructureMemory) {
    Memory.structure[this.id] = value;
  }
  private _states: StructureStates | undefined;
  public get states(): StructureStates | undefined {
    return this._states;
  }
  public set states(value: StructureStates | undefined) {
    this._states = value;
  }

  updateStateCode: (code: StateCode, message?: string) => void;

  constructor(structure: Structure, room: ExtendedRoom) {
    super(structure.id);
    this.room = room
    this.memory = (Memory.structure[structure.id] || emptyMemory) as StructureMemory;

    this.updateStateCode = (code: StateCode, message?: string) => {
      this.memory.state = code;
      if (message) console.log(`Message from ${structure.structureType} structure (id: ${structure.id}): ${message}`)
    };
  }
}

export default ExtendedStructure;

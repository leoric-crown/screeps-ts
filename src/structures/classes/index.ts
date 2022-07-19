import ExtendedRoom from "../../rooms/ExtendedRoom";
import Tower, { TowerStates } from "./Tower";

export type StructureStates = TowerStates;

export { Tower };

export const getExtendedStructure = (structure: Structure, room: ExtendedRoom) => {
    switch (structure.structureType) {
      case STRUCTURE_TOWER:
        return new Tower(structure as StructureTower, room);
      default:
        throw new Error(
          `There was an error getting ExtendedStructure for: id: ${structure.id}, type: ${structure.structureType}`
        );
    }
  };

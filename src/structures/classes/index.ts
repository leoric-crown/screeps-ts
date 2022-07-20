import Tower from "./Tower"
import Spawner from "./Spawner"
import { StatefulRoom } from "rooms";
import { StatefulStructure } from "structures/ExtendedStructure";

export { Tower, Spawner }

export const getStatefulStructure = (
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

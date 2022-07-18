import ExtendedCreep from "../extend/ExtendedCreep";
import ExtendedStructure from "../extend/ExtendedStructure";

export type CreepList = {
  [creepName: string]: Creep;
};

export interface ExtendedCreepList extends CreepList {
  [creepName: string]: ExtendedCreep;
}

export type StructureList = {
  [creepName: string]: Structure;
};

export interface ExtendedStructureList extends StructureList {
  [creepName: string]: ExtendedStructure;
}


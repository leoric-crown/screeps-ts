import ExtendedCreep from "../creeps/ExtendedCreep";

export type CreepList = {
  [creepName: string]: Creep;
};

export interface ExtendedCreepList extends CreepList {
  [creepName: string]: ExtendedCreep;
}

export type StructureList = {
  [creepName: string]: Structure;
};

export interface StatefulStructureList extends StructureList {
  [creepName: string]: StatefulStructure;
}

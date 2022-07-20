import { ManagedStructure } from "structures/StructureManager";
import ExtendedCreep from "../creeps/ExtendedCreep";
import ExtendedStructure, { StatefulStructure } from "../structures/ExtendedStructure";

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

export interface StatefulStructureList extends ExtendedStructureList {
  [creepName: string]: StatefulStructure;
}

export type CreepList = {
  [creepName: string]: Creep;
};

export type StructureList = {
  [creepName: string]: Structure;
};

export interface StatefulStructureList extends StructureList {
  [creepName: string]: StatefulStructure;
}

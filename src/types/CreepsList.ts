import ExtendedCreep from "../extend/ExtendedCreep";

export type CreepsList = {
  [creepName: string]: Creep;
};

export interface ExtendedCreepsList extends CreepsList {
  [creepName: string]: ExtendedCreep;
}

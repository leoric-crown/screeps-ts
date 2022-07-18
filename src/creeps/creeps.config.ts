import { CreepRole, CreepType } from "../types/Creeps";

export type CreepConfig = {
  creepType: CreepType;
  role: CreepRole;
  total: number;
  bodies: (WORK | CARRY | MOVE)[];
};

const creepConfigs: CreepConfig[] = [
  {
    creepType: CreepType.HARVESTER,
    role: CreepRole.HARVESTER,
    total: 2,
    bodies: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    // total: 1
    // bodies: [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE]
    // no one else harvests now, get haulers to pick up minerals off the floor
  },
  {
    creepType: CreepType.BUILDER,
    role: CreepRole.BUILDER,
    total: 1,
    bodies: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
  },
  {
    creepType: CreepType.UPGRADER,
    role: CreepRole.UPGRADER,
    total: 2,
    bodies: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
  },
  {
    creepType: CreepType.HAULER,
    role: CreepRole.HAULER,
    total: 1,
    bodies: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
  }
];

export default creepConfigs;

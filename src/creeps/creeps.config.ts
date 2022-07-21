import { CreepRole, CreepType } from "../types/Creeps";

export type CreepConfig = {
  creepType: CreepType;
  role: CreepRole;
  desired: number;
  bodies: (WORK | CARRY | MOVE)[];
};

const creepConfigs: CreepConfig[] = [
  {
    creepType: CreepType.HARVESTER,
    role: CreepRole.HARVESTER,
    desired: 3,
    bodies: [WORK, WORK, CARRY, MOVE]
  },
  {
    creepType: CreepType.HAULER,
    role: CreepRole.HAULER,
    desired: 2,
    bodies: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
  },
  {
    creepType: CreepType.BUILDER,
    role: CreepRole.BUILDER,
    desired: 1,
    // bodies: [WORK, CARRY, MOVE],
    bodies: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
  },
  {
    creepType: CreepType.UPGRADER,
    role: CreepRole.UPGRADER,
    desired: 1,
    // bodies: [WORK, CARRY, MOVE],
    bodies: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
  }
];

export default creepConfigs;

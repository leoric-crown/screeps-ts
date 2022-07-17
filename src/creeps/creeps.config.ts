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
    total: 4,
    bodies: [WORK, WORK, CARRY, CARRY, MOVE]
  },
  {
    creepType: CreepType.UPGRADER,
    role: CreepRole.UPGRADER,
    total: 2,
    bodies: [WORK, WORK, CARRY, MOVE]
  },
  {
    creepType: CreepType.BUILDER,
    role: CreepRole.BUILDER,
    total: 2,
    bodies: [WORK, WORK, CARRY, CARRY, MOVE]
  }
];

export default creepConfigs;

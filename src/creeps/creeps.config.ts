import { CreepType } from "../types/CreepType";
import { CreepRole } from "../types/CreepRole";

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
    bodies: [WORK, CARRY, MOVE]
  },
  {
    creepType: CreepType.UPGRADER,
    role: CreepRole.UPGRADER,
    total: 4,
    bodies: [WORK, CARRY, MOVE]
  }
];

export default creepConfigs;

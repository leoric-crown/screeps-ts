import makeCreepConfigs, {
  CreepConfig,
  CreepConfigData
} from "../../creeps/creeps.config";
import { RoomState } from "../StatefulRoom";
import { CreepType, CreepRole } from "../../types/States";

const harvConfig = {
  creepType: CreepType.HARVESTER,
  role: CreepRole.HARVESTER,
  body: [WORK, WORK, CARRY, MOVE],
  scaleBody: [CARRY],
  desired: 3
};

const haulersConfig = {
  creepType: CreepType.HAULER,
  role: CreepRole.HAULER,
  desired: 2,
  body: [CARRY, MOVE],
  scaleBody: [CARRY, MOVE]
};

const upgradersConfig = {
  creepType: CreepType.UPGRADER,
  role: CreepRole.UPGRADER,
  desired: 6,
  body: [WORK, CARRY, MOVE, MOVE],
  scaleBody: [WORK, CARRY, MOVE, MOVE]
};

// only add these when reached RCL 2
const buildersConfig = {
  creepType: CreepType.BUILDER,
  role: CreepRole.BUILDER,
  desired: 4,
  body: [WORK, CARRY, MOVE],
  scaleBody: [WORK, CARRY, MOVE]
};

class Rcl1State implements RoomState {
  creepConfigs: CreepConfig[];

  constructor(room: StatefulRoom) {
    let configIndex = 100; // 100 for RCL=1, 200 for RCL=2, etc.
    const spawn = room.spawns[0];
    const sourcesByRangeToSpawn = room.sources.sort((a, b) => {
      return a.pos.getRangeTo(spawn) <= b.pos.getRangeTo(spawn) ? -1 : 1;
    });
    // set desired values dynamically depending on room state (maxAvailableEnergy, storageNearSources, etc...)
    const configData: CreepConfigData[] = [];
    for (const source of sourcesByRangeToSpawn) {
      const sourceHarvesters = { ...harvConfig, id: configIndex, target: source.id };
      configData.push(sourceHarvesters);
      configIndex++;

      const haulers = { ...haulersConfig, id: configIndex, target: source.id };
      configData.push(haulers);
      configIndex++;
    }

    configData.push({ ...upgradersConfig, id: configIndex });
    configIndex++;

    configData.push({ ...buildersConfig, id: configIndex });
    configIndex++;
    // const configData: CreepConfigData[] = [...harvesterConfigs, ...haulerConfigs];

    this.creepConfigs = makeCreepConfigs(configData);
  }
}

export default Rcl1State;

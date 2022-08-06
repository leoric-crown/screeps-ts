import makeCreepConfigs, {
  CreepConfig,
  CreepConfigData
} from "../../creeps/creeps.config";
import { RoomState } from "../StatefulRoom";
import { CreepType, CreepRole } from "../../types/States";

const harvestersConfig = {
  creepType: CreepType.HARVESTER,
  role: CreepRole.HARVESTER,
  body: [WORK, WORK, CARRY, MOVE],
  scaleBody: [CARRY],
  scaleLimit: 2,
  desired: 3
};

const sourceHaulersConfig = {
  creepType: CreepType.HAULER,
  role: CreepRole.HAULER,
  desired: 1,
  body: [CARRY, MOVE],
  scaleBody: [CARRY, MOVE]
};

const upgradersConfig = {
  name: "upgr",
  creepType: CreepType.UPGRADER,
  role: CreepRole.UPGRADER,
  desired: 6,
  body: [WORK, CARRY, MOVE],
  scaleBody: [WORK, CARRY, MOVE]
};

const upgradeSuppliersConfig = {
  name: "supp",
  creepType: CreepType.SUPPLIER,
  role: CreepRole.SUPPLIER,
  desired: 0,
  body: [CARRY, CARRY, MOVE, MOVE],
  scaleBody: [CARRY, MOVE]
};

// only add these when reached RCL 2
const buildersConfig = {
  name: "build",
  creepType: CreepType.BUILDER,
  role: CreepRole.BUILDER,
  desired: 2,
  body: [WORK, CARRY, MOVE],
  scaleBody: [WORK, CARRY, MOVE],
  scaleLimit: 3
};

const remoteHarvestersConfig = {
  creepType: CreepType.REMOTE_HARVESTER,
  role: CreepRole.REMOTE_HARVESTER,
  desired: 3,
  body: [WORK, WORK, CARRY, MOVE, MOVE],
  scaleBody: [WORK, CARRY, MOVE],
  scaleLimit: 1
};

const remoteHaulersConfig = {
  creepType: CreepType.REMOTE_HAULER,
  role: CreepRole.REMOTE_HAULER,
  desired: 4,
  body: [CARRY, CARRY, MOVE, MOVE],
  scaleBody: [CARRY, MOVE],
  scaleLimit: 3
};

const regularHaulersConfigs = {
  creepType: CreepType.HAULER,
  role: CreepRole.HAULER,
  desired: 5,
  body: [CARRY, MOVE],
  scaleBody: [CARRY, MOVE]
};

class Rcl1State implements RoomState {
  creepConfigs: CreepConfig[];

  constructor(room: StatefulRoom) {
    let configIndex = 100; // 100 for RCL=1, 200 for RCL=2, etc.
    const spawn = room.spawns[0];
    const sourcesByRangeToSpawn = room.sources.sort((a, b) => {
      return a.pos.getRangeTo(spawn) <= b.pos.getRangeTo(spawn) ? -1 : 1;
    });
    const configData: CreepConfigData[] = [];
    let sourceCount = 0;
    for (const source of sourcesByRangeToSpawn) {
      const sourceHarvesters = {
        ...harvestersConfig,
        id: configIndex,
        target: source.id,
        name: "harv" + sourceCount
      };
      configData.push(sourceHarvesters);
      configIndex++;

      const sourceHaulers = {
        ...sourceHaulersConfig,
        id: configIndex,
        target: source.id,
        name: "haul" + sourceCount
      };
      configData.push(sourceHaulers);
      configIndex++;

      sourceCount++;
    }

    configData.push({ ...upgradersConfig, id: configIndex });
    configIndex++;

    configData.push({
      ...upgradeSuppliersConfig,
      id: configIndex,
      target: room.controller?.id
    });
    configIndex++;

    if (room.rcl >= 2) {
      configData.push({ ...buildersConfig, id: configIndex });
      configIndex++;

      const remotes: RemoteSource[] = [
        {
          remoteRoom: "W8N2",
          sourceId: "a06f077240e9885" as Id<Source>,
          pos: { x: 4, y: 12 },
        },
        {
          remoteRoom: "W7N2",
          sourceId: "80f307729faa16e" as Id<Source>,
          pos: { x: 23, y: 34 }
        },
        {
          remoteRoom: "W8N2",
          sourceId: "911d077240eff21" as Id<Source>,
          pos: { x: 21, y: 43 }
        }
      ];
      // this is writing to memory, will want to improve when implement scouting/claiming of rooms (i.e. when found, store pos in memory)
      room.remoteSources = remotes;

      let remoteCount = 0;
      remotes.forEach(remote => {
        const { remoteRoom, sourceId: target } = remote;
        configData.push({
          ...remoteHarvestersConfig,
          id: configIndex,
          name: "remHarv" + remoteCount,
          home: room.name,
          remoteRoom,
          target
        });
        configIndex++;

        configData.push({
          ...remoteHaulersConfig,
          id: configIndex,
          name: "remHaul" + remoteCount,
          home: room.name,
          remoteRoom,
          target
        });
        configIndex++;

        remoteCount++;
      });

      configData.push({
        ...regularHaulersConfigs,
        id: configIndex,
        name: "haul"
      })
    }

    this.creepConfigs = makeCreepConfigs(configData);
  }
}

export default Rcl1State;

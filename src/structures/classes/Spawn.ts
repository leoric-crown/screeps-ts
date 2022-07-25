import creepConfigs, { CreepConfig } from "creeps/creeps.config";
import { StateCode } from "../../types/States";

declare global {
  interface SpawnMemory extends StructureMemory {
    spawningCreep?: {
      type: string;
      role: string;
      cost: number;
    };
  }
}

export interface SpawnerStates extends BaseStructureStates {
  idle: StructureState;
  spawning: StructureState;
}

interface CreepCounts {
  [typeName: string]: number;
}

interface StatefulSpawn extends StructureSpawn {
  updateStateCode: (code: StateCode, message?: string) => void;
  logged: boolean;
  log: () => void;
  creepCounts: CreepCounts;
  startedSpawn: boolean;

  creepConfigs: CreepConfig[];
  nextRequest: CreepConfig | undefined;

  states?: SpawnerStates;
}

const extendSpawn = function (spawn: StructureSpawn) {
  const extend: any = {};
  extend.creepConfigs = creepConfigs;
  extend.creepCounts = getCreepCounts(spawn.room, extend.creepConfigs);
  extend.nextRequest = getNextRequest(extend.creepCounts, extend.creepConfigs);
  extend.logged = false;
  extend.startedSpawn = false;

  const log = function (this: StatefulSpawn) {
    if (!this.logged) {
      global.log(
        `Spawner: ${this.room} - creepCounts: ${JSON.stringify(this.creepCounts)}`
      );
      !this.nextRequest &&
        global.log(
          `Spawner: ${this.room} - creepCounts satisfied requests, no need to spawn more creeps`
        );
    }
    this.logged = true;
  };

  const statefulSpawn = _.extend(spawn, extend) as StatefulSpawn
  statefulSpawn.log = log.bind(statefulSpawn);
  statefulSpawn.states = spawnerStates.bind(statefulSpawn)();

  return statefulSpawn;
};

export const spawnerStates = function (this: StatefulSpawn) {
  return {
    init: {
      code: StateCode.INIT,
      run: () => {
        this.log();
      },
      transition: () => {
        if (this.spawning) this.updateStateCode(StateCode.SPAWNING);
        else this.updateStateCode(StateCode.IDLE);
      }
    },
    idle: {
      code: StateCode.IDLE,
      run: () => {
        this.log();
        if (this.nextRequest) {
          const request = this.nextRequest;
          const cost = request.bodies.reduce((count, body) => {
            return count + BODYPART_COST[body];
          }, 0);

          if (this.room.energyAvailable < cost) {
            // tell the room to build up $cost energy for this creep
            global.log(
              `Spawner: ${this.room} - waiting for ${cost} energy to spawn creep of type: ${request.creepType} and role: ${request.role}`
            );
            return;
          }
          const creepName = `${request.bodies
            .map(body => bodyAbbreviations[body])
            .join("")}-${Game.time}`;
          if (!this.spawning) {
            const { creepType, role } = request;
            this.memory.spawningCreep = {
              type: creepType,
              role,
              cost
            };
            const trySpawn = this.spawnCreep(request.bodies, creepName, {
              memory: {
                type: request.creepType,
                role: request.role
              }
            });
            if (trySpawn === OK) {
              this.startedSpawn = true;
              global.log(
                `Spawner: ${this.room} - spawning: ${creepName} of type: ${request.creepType}, role: ${request.role} and cost: ${cost}`
              );
            } else {
              global.log(
                `Spawner: ${this.room} - failed to spawn creep of type: ${request.creepType}, role: ${request.role} and cost: ${cost} ERROR: ${trySpawn}`
              );
            }
          }
        }
      },
      transition: () => {
        if (this.spawning) {
          this.updateStateCode(StateCode.SPAWNING);
        }
      }
    },
    spawning: {
      code: StateCode.SPAWNING,
      run: () => {
        this.log();
        // Avoid an extra line in console if we started spawning during this tick
        if (!this.startedSpawn && this.memory.spawningCreep) {
          const { type, role, cost } = this.memory.spawningCreep;
          global.log(
            `Spawner: ${this.room} - currently spawning a creep of type: ${type}, role: ${role}, and cost: ${cost} `
          );
        }
        return;
      },
      transition: () => {
        if (!this.spawning) {
          this.memory.spawningCreep = undefined;
          this.updateStateCode(StateCode.IDLE);
        }
      }
    }
  };
};

const getCreepCounts = function (room: Room, creepConfigs: CreepConfig[]) {
  let creepCounts = {} as CreepCounts;
  for (let request of creepConfigs) {
    creepCounts[request.creepType] = room.creeps.mine.filter(creep => {
      return creep.type === request.creepType;
    }).length;
  }
  return creepCounts;
};

const getNextRequest = function (
  creepCounts: CreepCounts,
  creepConfigs: CreepConfig[]
): CreepConfig | undefined {
  return creepConfigs.find(request => {
    return creepCounts[request.creepType] < request.desired;
  });
};

const bodyAbbreviations = {
  move: "M",
  work: "W",
  carry: "C"
  // Constructs: "Co",
  // Repairs: "R",
  // ATTACK: "A",
  // RANGED_ATTACK: "Ra",
  // HEAL: "H",
  // TOUGH: "T",
  // CLAIM: "C"
};

export default extendSpawn;

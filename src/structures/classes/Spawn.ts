import { CreepConfig } from "creeps/creeps.config";
import { StateCode, StateDictionary } from "../../types/States";

type NextCreepMemory = {
  tick?: number;
  config: number;
  name?: string;
  type?: string;
  role?: string;
};

declare global {
  interface SpawnMemory extends StructureMemory {
    nextCreep?: NextCreepMemory;
  }
}

export interface SpawnerStates extends BaseStructureStates {
  idle: StructureState;
  wait: StructureState;
  spawning: StructureState;
}

interface CreepCounts {
  [configId: number]: number;
}

interface StatefulSpawn extends StructureSpawn {
  room: StatefulRoom;
  creepConfigs: CreepConfig[];
  creepCounts: CreepCounts;
  nextCreep: { request: CreepConfig; tick: number | undefined };
  updateStateCode: (code: StateCode, message?: string) => void;
  getState: () => { stateName: string | undefined; state: StructureState | undefined };

  log: () => void;

  states?: SpawnerStates;
}

const extendSpawn = function () {
  Object.defineProperties(StructureSpawn.prototype, {
    creepConfigs: {
      get: function () {
        return this.room.state.creepConfigs;
      },
      set: function (value: CreepConfig[]) {
        this.room.state.creepConfigs = value;
      }
    },
    creepCounts: {
      get: function () {
        if (!this._creepCounts)
          this._creepCounts = getCreepCounts(this.room, this.creepConfigs);
        return this._creepCounts;
      }
    },
    nextCreep: {
      get: function (this: StatefulSpawn): {
        request: CreepConfig | undefined;
        tick: number | undefined;
      } {
        const missing = this.creepConfigs.find(request => {
          return this.creepCounts[request.id] < request.desired;
        });
        if (missing !== undefined) {
          this.memory.nextCreep = {
            config: missing.id,
            tick: undefined
          };
          return { request: missing, tick: undefined };
        }

        const nextCreep = this.memory.nextCreep;
        if (nextCreep) {
          const request = this.creepConfigs.find(
            config => config.id === nextCreep.config
          );
          return { request, tick: nextCreep.tick };
        }

        return { request: undefined, tick: undefined };
      },
      set: function (value: {
        request: CreepConfig | undefined;
        tick: number | undefined;
      }) {
        const { request, tick } = value;
        request &&
          tick &&
          (this.memory.nextCreep = {
            config: request.id,
            tick
          });
      }
    },
    log: {
      value: function () {
        const stateCode = this.memory.state;

        const creepCountsWithName: { [name: string]: any } = {};
        for (let [id, count] of Object.entries(this.creepCounts as CreepCounts)) {
          const request = this.creepConfigs.find(
            (config: CreepConfig) => config.id.toString() === id
          );
          const { name, desired } = request;
          creepCountsWithName[name] = `${count}/${desired}`;
        }

        global.log(`Spawn: ${this.room} - In state: ${StateDictionary[stateCode]}`);
        global.log(`Spawn: ${this.room} - ${JSON.stringify(creepCountsWithName)}`);
      },
      writable: true
    }
  });
};

export const getStatefulSpawn = function (spawn: StructureSpawn, room: StatefulRoom) {
  const extend = { room };
  const statefulSpawn = _.extend(spawn, extend) as StatefulSpawn;
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
        else if (this.nextCreep.request) this.updateStateCode(StateCode.WAITING);
        else this.updateStateCode(StateCode.IDLE);
      }
    },

    idle: {
      code: StateCode.IDLE,
      run: () => {
        this.log();
        if (!this.nextCreep.request) {
          const { request, ticksToLive: tick } = checkCreepExpiry.bind(this)();
          if (request && tick) {
            this.nextCreep = {
              request,
              tick: tick + Game.time
            };
            global.log(
              `Spawn: ${this.room} - Set nextCreep: ${JSON.stringify(
                this.memory.nextCreep
              )}`
            );
          } else {
            global.log(`Spawn idle`);
          }
        }
      },
      transition: () => {
        if (this.nextCreep.request) {
          const requestCost = this.nextCreep.request.getRequestCost(
            this.room.energyCapacityAvailable
          );
          this.updateStateCode(StateCode.WAITING);
        }
      }
    },

    wait: {
      code: StateCode.WAITING,
      run: () => {
        this.log();
        if (this.nextCreep.request) {
          let logMessage = `Spawn: ${this.room} - `;

          const maxCost = this.room.energyCapacityAvailable;
          const { request } = this.nextCreep;

          let needSpawn = false;
          let saveResources = false;
          const body = request.getScaledBody(maxCost);

          if (this.nextCreep.tick !== undefined) {
            const timeToSpawn = body.length * 3;

            const ticksToExpire = this.nextCreep.tick - Game.time;
            if (ticksToExpire > 0) {
              const remaining = ticksToExpire - timeToSpawn;
              if (remaining <= 0) needSpawn = true;
              if (remaining < 400) saveResources = true; // this should probably be smarter (only saving resources within 400 ticks of need to start spawning)
              logMessage += `${ticksToExpire} ticks until next creep expires. Trying spawn in ${remaining} ticks (spawn duration: ${timeToSpawn})`;
            }
          } else {
            needSpawn = true;
            saveResources = true;
            const configName = this.nextCreep.request.name;
            logMessage += `Need to spawn ${configName} creep now`;
          }

          const requestCost = request.getRequestCost(maxCost);

          if (saveResources) {
            this.room.minAvailableEnergy = requestCost;
          }

          if (needSpawn && !this.spawning) {
            if (requestCost > this.room.energyAvailable) {
              logMessage += `: Spawner waiting for ${requestCost} energy.`;
              global.log(logMessage);
              return;
            }

            // const creepName = `${body.map(part => bodyAbbreviations[part]).join("")}-${
            //   Game.time
            // }`;

            const creepName = `${request.creepType}-${Game.time}`;

            const trySpawn = this.spawnCreep(body, creepName, {
              memory: {
                type: request.creepType,
                role: request.role,
                config: request.id,
                target: request.target,
                remoteRoom: request.remoteRoom,
                home: request.home
              }
            });
            if (trySpawn !== 0) throw new Error(`Error spawning creep: ${trySpawn}`);
          }
          global.log(logMessage);
        } else {
          throw new Error("Spawner in WAITING state but nextCreep === undefined");
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
        if (this.spawning !== null) {
          const { creepType: type, role } = this.nextCreep.request;
          const { name, remainingTime } = this.spawning;
          global.log(
            `Spawn: ${this.room} - Spawning creep to replace expiring creep of type ${type} and role: ${role} [${remainingTime} ticks remaining]`
          );
        }
      },
      transition: () => {
        if (this.spawning === null) {
          global.log(
            `Spawn: ${this.room} - Spawning complete or interrupted. Transitioning to IDLE...`
          );
          this.memory.nextCreep = undefined;
          this.updateStateCode(StateCode.IDLE);
        }
      }
    }
  };
};

const checkCreepExpiry = function (this: StatefulSpawn) {
  let searchResult: {
    ticksToLive: number | undefined;
    config: number | undefined;
  } = {
    ticksToLive: undefined,
    config: undefined
  };

  const uniqueCreeps: Creep[] = [];
  [...this.room.creeps.mine, ...this.room.remoteCreeps].forEach(creep => {
    if (!uniqueCreeps.map(c => c.name).includes(creep.name) && !creep.spawning) {
      uniqueCreeps.push(creep);
    }
  });

  const creeps = uniqueCreeps.filter(creep => {
    let keep = false;
    const config = this.creepConfigs.find(config => config.id === creep.memory.config);
    if (config) {
      const overDesired = this.creepCounts[creep.memory.config] > config.desired;
      !overDesired && (keep = true);
      return keep;
    } else {
      throw new Error(`Config not found for creep: ${creep.name} [type=${creep.type}]`);
    }
  });
  for (let creep of creeps) {
    const { type, role, ticksToLive } = creep;
    const { config } = creep.memory;
    if (ticksToLive && role && type) {
      if (!searchResult.ticksToLive) searchResult = { ticksToLive, config };
      else if (ticksToLive < searchResult.ticksToLive) {
        searchResult = { ticksToLive, config };
      }
    }
  }
  let request = undefined;
  let ticksToLive = undefined;
  if (searchResult.config !== undefined && searchResult.ticksToLive !== undefined) {
    request = this.room.state.creepConfigs.find(req => req.id === searchResult.config);
    ticksToLive = searchResult.ticksToLive;
  }
  return { request, ticksToLive };
};

const getCreepCounts = function (room: Room, creepConfigs: CreepConfig[]) {
  let creepCounts = {} as CreepCounts;
  for (let request of creepConfigs) {
    const uniqueCreeps: Creep[] = [];
    [...room.creeps.mine, ...room.remoteCreeps].forEach(creep => {
      if (!uniqueCreeps.map(c => c.name).includes(creep.name) && !creep.spawning) {
        uniqueCreeps.push(creep);
      }
    });
    creepCounts[request.id] = uniqueCreeps.filter(creep => {
      return creep.memory.config === request.id;
    }).length;
  }
  return creepCounts;
};

export default extendSpawn;

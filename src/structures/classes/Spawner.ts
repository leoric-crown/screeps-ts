import { StructureState, BaseStructureStates, StateCode } from "types/States";
import creepConfigs, { CreepConfig } from "creeps/creeps.config";
import StatefulRoom from "rooms/StatefulRoom";
import ExtendedStructure, {
  StatefulStructure,
  StructureMemory
} from "../ExtendedStructure";

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

interface CreepCounts {
  [typeName: string]: number;
}

export interface SpawnerStates extends BaseStructureStates {
  idle: StructureState;
  spawning: StructureState;
}

class Spawner extends ExtendedStructure implements StatefulStructure {
  private creepCounts: CreepCounts;
  states: SpawnerStates;
  creepConfigs: CreepConfig[];
  nextRequest: CreepConfig | undefined;
  logged: boolean;
  startedSpawn: boolean;

  constructor(spawn: StructureSpawn, room: StatefulRoom) {
    super(spawn, room);

    this.creepConfigs = creepConfigs;
    this.creepCounts = this.getCreepCounts();
    this.nextRequest = this.getNextRequest();
    this.logged = false;
    this.startedSpawn = false;

    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {
          this.log();
        },
        transition: () => {
          if (spawn.spawning) this.updateStateCode(StateCode.SPAWNING);
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
              console.log(
                `Spawner: ${this.room} - waiting for ${cost} energy to spawn creep of type: ${request.creepType} and role: ${request.role}`
              );
              return;
            }
            const creepName = `${request.bodies
              .map(body => bodyAbbreviations[body])
              .join("")}-${Game.time}`;
            if (!spawn.spawning) {
              const { creepType, role } = request;
              this.memory.spawningCreep = {
                type: creepType,
                role,
                cost
              };
              const trySpawn = spawn.spawnCreep(request.bodies, creepName, {
                memory: {
                  type: request.creepType,
                  role: request.role
                }
              });
              if (trySpawn === OK) {
                this.startedSpawn = true;
                console.log(
                  `Spawner: ${this.room} - spawning: ${creepName} of type: ${request.creepType}, role: ${request.role} and cost: ${cost}`
                );
              } else {
                console.log(
                  `Spawner: ${this.room} - failed to spawn creep of type: ${request.creepType}, role: ${request.role} and cost: ${cost} ERROR: ${trySpawn}`
                );
              }
            }
          }
        },
        transition: () => {
          if (spawn.spawning) {
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
            console.log(
              `Spawner: ${this.room} - currently spawning a creep of type: ${type}, role: ${role}, and cost: ${cost} `
            );
          }
          return;
        },
        transition: () => {
          if (!spawn.spawning) {
            this.memory.spawningCreep = undefined;
            this.updateStateCode(StateCode.IDLE);
          }
        }
      }
    };
  }

  log = () => {
    if (!this.logged) {
      console.log(
        `Spawner: ${this.room} - creepCounts: ${JSON.stringify(this.creepCounts)}`
      );
      !this.nextRequest &&
        console.log(
          `Spawner: ${this.room} - creepCounts satisfied requests, no need to spawn more creeps`
        );
    }
    this.logged = true;
  };

  getCreepCounts = () => {
    let creepCounts = {} as CreepCounts;
    for (let request of creepConfigs) {
      creepCounts[request.creepType] = _.filter(this.room.creeps, creep => {
        return creep.type === request.creepType;
      }).length;
    }
    return creepCounts;
  };

  getNextRequest = (): CreepConfig | undefined => {
    return creepConfigs.find(request => {
      return this.creepCounts[request.creepType] < request.desired;
    });
  };
}

export default Spawner;

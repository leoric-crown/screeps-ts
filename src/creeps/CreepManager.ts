import { CreepState } from "../types/CreepState";
import { CreepsList, ExtendedCreepsList } from "../types/CreepsList";
import { CreepRole, CreepType } from "../types/Creeps";
import ExtendedRoom from "../extend/ExtendedRoom";
import ExtendedCreep from "../extend/ExtendedCreep";
import { BuilderCreep, HarvesterCreep, UpgraderCreep } from "./classes/";

const getCreepForRole = (creep: Creep, type: CreepType, role: CreepRole) => {
  switch (role) {
    case CreepRole.HARVESTER:
      return new HarvesterCreep(creep);
    case CreepRole.UPGRADER:
      return new UpgraderCreep(creep);
    case CreepRole.BUILDER:
      return new BuilderCreep(creep);
    default:
      throw new Error(
        `There was an error getting ExtendedCreep for: type: ${type}, role: ${role}`
      );
  }
};

class CreepManager {
  creeps: ExtendedCreepsList;
  room: ExtendedRoom;
  get: (creepType?: CreepType) => ExtendedCreepsList;
  run: (creepType?: CreepType) => void;
  private runCreeps: () => void;

  constructor(creeps: CreepsList, room: ExtendedRoom) {
    this.room = room;
    const creepList = {} as ExtendedCreepsList;
    _.forEach(creeps, creep => {
      creepList[creep.name] = getCreepForRole(
        creep,
        creep.memory.type,
        creep.memory.role
      );
    });
    this.creeps = creepList;

    this.get = (creepType?: CreepType) => {
      if (!creepType) return this.creeps;
      else {
        const filteredCreeps = {} as ExtendedCreepsList;
        _.forEach(this.creeps, creep => {
          if (creep.type === creepType) {
            filteredCreeps[creep.name] = creep;
          }
        });
        return filteredCreeps;
      }
    };

    this.run = (creepType?: CreepType) => {
      let total = 0;
      const creeps = creepType ? this.get(creepType) : this.creeps;
      const currentStatus = _.reduce(
        creeps,
        (memo, creep) => {
          for (let [state, handler] of Object.entries(creep.states as any)) {
            if (!memo[state]) memo[state] = 0;
            if ((handler as any).code === creep.memory.state) {
              memo[state] = (memo[state] || 0) + 1;
              total++;
            }
          }
          return memo;
        },
        {} as any
      );
      console.log(`CreepManager: ${this.room} - ${JSON.stringify(currentStatus)}`);
      for (let [state, count] of Object.entries(currentStatus)) {
        console.log(
          `CreepManager: ${this.room} - ${state}ing: ${count}`.replace(
            "upgrade",
            "upgrad"
          )
        );
      }
      console.log(`CreepManager: Total Creeps: ${total}`);

      this.runCreeps();
    };

    this.runCreeps = () => {
      for (let creep of Object.values(this.creeps)) {
        creep = setMemory(creep);
        const creepStates = Object(creep.states);
        for (let state in creepStates) {
          if (creep.memory.state === creepStates[state].code) {
            (creepStates[state] as CreepState).run(room);
            (creepStates[state] as CreepState).transition(room);
          }
        }
      }
    };
  }
}
const setMemory = (creep: ExtendedCreep) => {
  !Object(creep.memory).hasOwnProperty("state") &&
    (creep.memory.state = creep.states?.init.code);

  return creep;
};

export default CreepManager;

import { CreepState } from "../types/States";
import { ExtendedCreepList } from "../types/CreepsList";
import { CreepType } from "../types/Creeps";
import ExtendedRoom from "../rooms/ExtendedRoom";
import ExtendedCreep from "./ExtendedCreep";

class CreepManager {
  creeps: ExtendedCreepList;
  room: ExtendedRoom;
  getCreeps: (creepType?: CreepType) => ExtendedCreepList;
  run: (creepType?: CreepType) => void;
  private runCreeps: () => void;

  constructor(room: ExtendedRoom) {
    this.room = room;
    this.creeps = room.creeps;

    this.getCreeps = (creepType?: CreepType) => {
      if (!creepType) return this.creeps;
      else {
        const filteredCreeps = {} as ExtendedCreepList;
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
      const creeps = creepType ? this.getCreeps(creepType) : this.creeps;
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
          `CreepManager: ${this.room} - ${state}ing: ${count}`
            .replace("upgradeing", "upgrading")
            .replace("initing", "initializing")
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

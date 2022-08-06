import { CreepType } from "types/States";
import { CreepList } from "../types/CreepsList";
//@ts-ignore
import profiler from "../utils/screeps-profiler";
import { getStatefulCreep } from "./extend.creep";

class CreepManager {
  room: Room;
  creeps: CreepList;
  getCreeps: (creepType?: CreepType) => CreepList;
  run: (creepType?: CreepType) => void;
  private runCreeps: () => void;

  constructor(room: Room) {
    this.room = room;
    let creepList = {} as CreepList;
    const uniqueCreeps: Creep[] = [];
    [...room.creeps.mine, ...room.remoteCreeps].forEach(creep => {
      if (!uniqueCreeps.map(c => c.name).includes(creep.name) && !creep.spawning) {
        uniqueCreeps.push(creep);
      }
    });
    uniqueCreeps.forEach(creep => {
      creepList[creep.name] = getStatefulCreep(creep);
    });
    this.creeps = creepList;

    this.getCreeps = (creepType?: CreepType) => {
      if (!creepType) return this.creeps;
      else {
        const filteredCreeps = {} as CreepList;
        _.forEach(this.creeps, creep => {
          if (creep.type === creepType) {
            filteredCreeps[creep.name] = getStatefulCreep(creep);
          }
        });
        return filteredCreeps;
      }
    };

    let _run = (creepType?: CreepType) => {
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
      global.log(`CreepManager: ${this.room} - ${JSON.stringify(currentStatus)}`);
      global.log(`CreepManager: ${this.room} -  Total Creeps: ${total}`);

      this.runCreeps();
    };
    if (profiler) _run = profiler.registerFN(_run, "CreepManager.run");
    this.run = _run;

    let _runCreeps = () => {
      for (let creepName in this.creeps) {
        const creep = this.creeps[creepName];
        setMemory(creep);
        const { stateName, state } = creep.getState();
        try {
          state?.run();
          state?.transition();
        } catch (err) {
          global.error(`{red-fg}${err}`);
        }
      }
    };
    if (profiler) _runCreeps = profiler.registerFN(_runCreeps, "CreepManager.runCreeps");
    this.runCreeps = _runCreeps;
  }
}
const setMemory = (creep: Creep) => {
  !Object(creep.memory).hasOwnProperty("state") &&
    (creep.memory.state = creep.states?.init.code);
};

export default CreepManager;

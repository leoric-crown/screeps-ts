import { ExtendedCreepsList } from "./types/CreepsList";
import { CreepConfig } from "./creeps/creeps.config";
import ExtendedRoom from "./extend/ExtendedRoom";
import ExtendedCreep from "./extend/ExtendedCreep";

const spawner = (
  creeps: ExtendedCreepsList,
  room: ExtendedRoom,
  spawn: StructureSpawn,
  creepConfigs: CreepConfig[]
) => {
  interface CreepCounts {
    [index: string]: number;
  }
  let creepCounts = {} as CreepCounts;

  for (let conf of creepConfigs) {
    creepCounts[conf.creepType] = _.filter(
      creeps,
      (creep: ExtendedCreep) => creep.type === conf.creepType
    ).length;
    if (
      creepCounts[conf.creepType] < conf.total &&
      room.energyAvailable === room.energyCapacityAvailable
    ) {
      const bodyAbb = {
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
      const creepName = `${conf.bodies.map(body => bodyAbb[body]).join("")} - ${
        Game.time
      }`;
      console.log(`module spawner - spawning: ${creepName} with role: ${conf.role}`);
      spawn.spawnCreep(conf.bodies, creepName, {
        memory: {
          type: conf.creepType,
          role: conf.role
        }
      });
    }
  }
  console.log(`module spawner - creepCounts: ${JSON.stringify(creepCounts)}`);
};

export default spawner;

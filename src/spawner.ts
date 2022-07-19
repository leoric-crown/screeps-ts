import { CreepConfig } from "./creeps/creeps.config";
import ExtendedRoom from "./rooms/ExtendedRoom";
import ExtendedCreep from "./creeps/ExtendedCreep";

const spawner = (room: ExtendedRoom, creepConfigs: CreepConfig[]) => {
  interface CreepCounts {
    [index: string]: number;
  }

  let spawned = false;
  let creepCounts = {} as CreepCounts;
  for (let conf of creepConfigs) {
    creepCounts[conf.creepType] = _.filter(
      room.creeps,
      (creep: ExtendedCreep) => creep.type === conf.creepType
    ).length;
    if (creepCounts[conf.creepType] < conf.total && room.energyAvailable >= 300) {
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
      const creepName = `${conf.bodies.map(body => bodyAbb[body]).join("")}-${Game.time}`;

      const trySpawn = room.spawns[0].spawnCreep(conf.bodies, creepName, {
        memory: {
          type: conf.creepType,
          role: conf.role
        }
      });
      if (trySpawn === OK) {
        console.log(
          `Spawner: ${room} - spawning: ${creepName} with type: ${conf.creepType} and role: ${conf.role}`
        );
        break;
      } else {
        console.log(`Spawner: ${room} - failed to spawn creep ERROR: ${trySpawn}`);
      }
    }
  }
  !spawned &&
    console.log(
      `Spawner: ${room} - creepCounts satisfied config, no need to spawn more creeps`
    );
  console.log(`Spawner: ${room} - creepCounts: ${JSON.stringify(creepCounts)}`);
};

export default spawner;

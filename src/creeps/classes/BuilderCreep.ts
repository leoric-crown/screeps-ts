import { CreepRole, CreepType } from "../../types/Creeps";
import { BaseCreepStates, CreepState, StateCode } from "../../types/CreepState";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedCreep from "../../extend/ExtendedCreep";

export interface BuilderRoleStates extends BaseCreepStates {
  build: CreepState;
  harvest: CreepState;
  load: CreepState;
  loadSelf: CreepState;
}
const minRoomEnergy = 350;
class BuilderCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    super(creep);
    this.type = CreepType.BUILDER;
    this.role = CreepRole.BUILDER;
    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {
          console.log('BUILDER HAS BEEN INITED')
        },
        transition: (room: ExtendedRoom) => {
          if (
            room.buildables.length > 0 &&
            room.energyAvailable >= this.store.getCapacity()
          ) {
            this.memory.state = (this.states as BuilderRoleStates).loadSelf.code;
            this.say("loadSelf in");
          } else {
            this.memory.state = (this.states as BuilderRoleStates).harvest.code;
            this.say("harvest in");
          }
        }
      },
      loadSelf: {
        code: StateCode.LOADSELF,
        run: this.loadSelfProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.getFreeCapacity() === 0) {
            this.memory.state = (this.states as BuilderRoleStates).build.code;
            this.say("build ls");
          }
        }
      },
      build: {
        code: StateCode.BUILDING,
        run: (room: ExtendedRoom) => {
          if (room.buildables.length > 0) {
            const tryBuild = this.build(room.buildables[0]);
            if (tryBuild === ERR_NOT_IN_RANGE) {
              this.moveTo(room.buildables[0], {
                visualizePathStyle: { stroke: "#ffffff" }
              });
            }
          }
        },
        transition: (room: ExtendedRoom) => {
          if (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            if (room.buildables.length === 0 || room.energyAvailable < minRoomEnergy) {
              this.memory.state = (this.states as BuilderRoleStates).harvest.code;
              this.say("harvest bd");
            } else {
              this.memory.state = (this.states as BuilderRoleStates).loadSelf.code;
              this.say("loadSelf bd");
            }
          }
        }
      },
      harvest: {
        code: StateCode.HARVESTING,
        run: this.harvestProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.getUsedCapacity(RESOURCE_ENERGY) === this.store.getCapacity()) {
            if (room.buildables.length > 0) {
              this.memory.state = (this.states as BuilderRoleStates).build.code;
              this.say("build hv");
            } else {
              this.memory.state = (this.states as BuilderRoleStates).load.code;
              this.say("load hv");
            }
          }
        }
      },
      load: {
        code: StateCode.LOADING,
        run: this.loadProc,
        transition: (room: ExtendedRoom) => {
          if (this.store.energy === 0) {
            if (room.buildables.length > 0 && room.energyAvailable > minRoomEnergy) {
              this.memory.state = (this.states as BuilderRoleStates).loadSelf.code;
              this.say("loadSelf ld");
            } else {
              this.memory.state = (this.states as BuilderRoleStates).harvest.code;
              this.say("harvest ld");
            }
          }
        }
      }
    };
  }
}

export default BuilderCreep;

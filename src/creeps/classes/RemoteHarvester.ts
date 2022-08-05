import { BaseCreepStates, CreepRole, StateCode } from "../../types/States";

declare global {
  interface RemoteHarvesterStates extends BaseCreepStates {
    // switchRoom: CreepState;
    move: CreepState;
    harvest: CreepState;
    load: CreepState;
    wait: CreepState;
  }
}

const getRemoteHarvester = function (this: Creep): Creep {
  const getTargetSource = () => {
    if (!this.memory.target) return undefined;
    return Game.getObjectById(this.memory.target) as Source;
  };

  const remoteRoom = this.memory.remoteRoom;
  const home = this.memory.home ? Game.rooms[this.memory.home] : undefined;

  const getHaulersAvailable = () => {
    if (home) {
      const remoteHaulers = home.remoteCreeps.filter(creep => {
        return (
          creep.role === CreepRole.REMOTE_HAULER &&
          creep.memory.target === this.memory.target
        );
      });
      const haulersAvailable = remoteHaulers.length > 0;
      return haulersAvailable;
    } else return false;
  };

  const getTargetPos = () => {
    if (home && remoteRoom) {
      const source = home.remoteSources.find(
        remote => remote.sourceId === this.memory.target
      );
      if (source) {
        return { x: source.pos.x, y: source.pos.y, roomName: remoteRoom };
      }
    }
    throw new Error("Couldn't find target source in home.remoteSources");
  };
  const states: RemoteHarvesterStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (home && remoteRoom) {
          this.memory.destination = getTargetPos();
          this.updateStateCode(StateCode.MOVE, "move");
        } else throw new Error("Remote harvester has no remoteRoom");
      }
    },
    move: {
      code: StateCode.MOVE,
      run: this.moveProc,
      transition: () => {
        if (home && this.destination) {
          if (this.pos.getRangeTo(this.destination) <= 5) {
            if (this.pos.roomName === home.name) {
              this.updateStateCode(StateCode.LOAD, "rem load");
            } else if (this.pos.roomName === remoteRoom) {
              this.updateStateCode(StateCode.HARVEST, "rem harv");
            }
          }
        } else throw new Error(`Remote harvester ${this.name} has no destination`);
      }
    },
    harvest: {
      code: StateCode.HARVEST,
      run: () => {
        const targetSource = getTargetSource();
        if (targetSource) {
          this.harvestProc(targetSource);
        } else throw new Error(`Remote harvester ${this.name} has no target source`);
      },
      transition: () => {
        const targetSource = getTargetSource();
        if (targetSource && home) {
          if (this.store.getFreeCapacity() === 0) {
            if (!getHaulersAvailable()) {
              this.destination = home.spawns[0].pos;
              this.updateStateCode(StateCode.MOVE, "move home");
            } else {
              this.updateStateCode(StateCode.WAITING, "wait full");
            }
          }
        } else throw new Error(`Remote harvester ${this.name} has no target source`);
      }
    },
    load: {
      code: StateCode.LOAD,
      run: this.loadProc,
      transition: () => {
        if (remoteRoom) {
          if (this.store.energy === 0) {
            this.memory.destination = getTargetPos();
            this.updateStateCode(StateCode.MOVE, "rem move");
          }
        } else throw new Error("Remote harvester has no remoteRoom");
      }
    },
    wait: {
      code: StateCode.WAITING,
      run: () => {},
      transition: () => {
        if (this.store.getFreeCapacity() > 0) {
          this.updateStateCode(StateCode.HARVEST, "harvest");
        } else if (!getHaulersAvailable() && home) {
          this.destination = home.spawns[0].pos;
          this.updateStateCode(StateCode.MOVE, "move home");
        }
      }
    }
  };
  this.states = states;
  return this;
};

export default getRemoteHarvester;

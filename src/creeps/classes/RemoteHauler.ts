import { BaseCreepStates, CreepRole, StateCode } from "../../types/States";

declare global {
  interface RemoteHaulerStates extends BaseCreepStates {
    move: CreepState;
    haul: CreepState;
    load: CreepState;
  }
}

const getRemoteHauler = function (this: Creep): Creep {
  const getTargetSource = () => {
    if (!this.memory.target) return undefined;
    return Game.getObjectById(this.memory.target) as Source;
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

  const remoteRoom = this.memory.remoteRoom;
  const home = this.memory.home ? Game.rooms[this.memory.home] : undefined;

  const states: RemoteHaulerStates = {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (home && remoteRoom) {
          this.memory.destination = getTargetPos();
          this.updateStateCode(StateCode.MOVE, "move");
        } else throw new Error("Remote hauler is missing remoteRoom or home");
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
              this.updateStateCode(StateCode.HAUL, "rem haul");
            }
          }
        }
      }
    },
    haul: {
      code: StateCode.HAUL,
      run: () => {
        if (home) {
          const remoteHarvesters = home.remoteCreeps.filter(creep => {
            return (
              creep.memory.target === this.memory.target &&
              creep.role === CreepRole.REMOTE_HARVESTER
            );
          });
          this.haulProc(remoteHarvesters);
          const targetSource = getTargetSource();
          if (targetSource && this.pos.getRangeTo(targetSource) === 1) {
            const direction = this.pos.getDirectionTo(targetSource) as number;
            let opposite = (direction + 4) % 8;
            if (opposite === 0) opposite = 8;
            this.move(opposite as DirectionConstant);
          }
        } else throw new Error("Remote hauler has no home room set");
      },
      transition: () => {
        if (home) {
          if (this.store.getFreeCapacity() === 0) {
            this.destination = home.spawns[0].pos;
            this.updateStateCode(StateCode.MOVE, "move home");
          }
        }
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
    }
  };
  this.states = states;
  return this;
};

export default getRemoteHauler;

import { BaseCreepStates, CreepState, StateCode } from "../../types/States";
import { StatefulRoom } from "../../rooms/";
import ExtendedCreep, {CreepRole, CreepType} from "../ExtendedCreep";

export interface UpgraderRoleStates extends BaseCreepStates {
  harvest: CreepState;
  upgrade: CreepState;
  loadSelf: CreepState;
}

class UpgraderCreep extends ExtendedCreep {
  constructor(creep: Creep) {
    super(creep);
    this.type = CreepType.UPGRADER;
    this.role = CreepRole.UPGRADER;
    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: (room: StatefulRoom) => {
          if (room.energyAvailable > room.minAvailableEnergy) {
            this.updateStateCode(StateCode.LOADSELF, "loadself");
          } else {
            this.updateStateCode(StateCode.HARVEST, "harvest");
          }
        }
      },
      harvest: {
        code: StateCode.HARVEST,
        run: this.harvestProc,
        transition: (room: StatefulRoom) => {
          if (this.store.getFreeCapacity() === 0) {
            this.updateStateCode(StateCode.UPGRADE, "upgrade");
          }
        }
      },
      upgrade: {
        code: StateCode.UPGRADE,
        run: this.upgradeProc,
        transition: (room: StatefulRoom) => {
          if (this.store.energy === 0) {
            if (room.energyAvailable > room.minAvailableEnergy) {
              this.updateStateCode(StateCode.LOADSELF, "loadSelf");
            } else {
              this.updateStateCode(StateCode.HARVEST, "harvest");
            }
          }
        }
      },
      loadSelf: {
        code: StateCode.LOADSELF,
        run: this.loadSelfProc,
        transition: (room: StatefulRoom) => {
          if (this.store.getFreeCapacity() === 0) {
            this.updateStateCode(StateCode.UPGRADE, "upgrade");
          }
        }
      }
    };
  }
}

export default UpgraderCreep;

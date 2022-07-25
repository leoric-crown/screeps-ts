import { StateCode } from "../../types/States";

export interface TowerStates extends BaseStructureStates {
  attack: StructureState;
  repair: StructureState;
  heal: StructureState;
}

interface StatefulTower extends StructureTower {
  updateStateCode: (code: StateCode, message?: string) => void;
  states?: TowerStates;
}

export const extendTower = function (tower: StructureTower) {
  const extend: any = {};

  const statefulTower = _.extend(tower, extend) as StatefulTower;
  statefulTower.states = towerStates.bind(statefulTower)();

  return statefulTower;
};

const towerStates = function (this: StatefulTower) {
  return {
    init: {
      code: StateCode.INIT,
      run: () => {},
      transition: () => {
        if (this.room.damagedCreeps.mine.length > 0) {
          this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
          return;
        } else if (this.room.damagedStructures.total > 0) {
          this.updateStateCode(StateCode.REPAIR, "Repairing structures");
          return;
        }
      }
    },
    attack: {
      code: StateCode.ATTACK,
      run: attackProc.bind(this),
      transition: () => {
        if (this.room.creeps.hostile.length === 0) {
          this.updateStateCode(StateCode.INIT, "Threats eliminated. Resetting...");
          return;
        }
      }
    },
    repair: {
      code: StateCode.REPAIR,
      run: repairProc.bind(this),
      transition: () => {
        if (this.room.creeps.hostile.length > 0) {
          this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
          return;
        }
        if (this.room.damagedCreeps.mine.length > 0) {
          this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
          return;
        }
      }
    },
    heal: {
      code: StateCode.HEAL,
      run: healProc.bind(this),
      transition: () => {
        if (this.room.creeps.hostile.length > 0) {
          this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
          return;
        }
        if (
          this.room.damagedCreeps.mine.length === 0 &&
          this.room.damagedStructures.total > 0
        ) {
          this.updateStateCode(StateCode.REPAIR, "Repairing structures");
          return;
        }
      }
    }
  };
};

const attackProc = function (this: StructureTower) {
  const target = this.pos.findClosestByRange(this.room.creeps.hostile);
  target && this.attack(target);
};

const healProc = function (this: StructureTower) {
  if (this.room.damagedCreeps.mine.length > 0) {
    const target = this.pos.findClosestByRange(this.room.damagedCreeps.mine);
    target && this.heal(target);
  }
};

const repairProc = function (this: StructureTower) {
  if (this.room.damagedStructures.total > 0) {
    const { roads, defenses, others } = this.room.damagedStructures;
    let target = undefined;
    if (roads.length > 0) {
      target = this.pos.findClosestByRange(roads);
    }

    if (!target && others.length > 0) {
      target = others.sort((a, b) => {
        return a.hits < b.hits ? -1 : 1;
      })[0];
    }

    if (!target && defenses.length > 0) {
      target = defenses.sort((a, b) => {
        return a.hits < b.hits ? -1 : 1;
      })[0];
    }

    target && this.repair(target);
  }
};

export default extendTower;

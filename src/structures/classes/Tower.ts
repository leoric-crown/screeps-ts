import StatefulRoom from "rooms/StatefulRoom";
import { StructureState, BaseStructureStates, StateCode } from "../../types/States";
import ExtendedStructure, { StatefulStructure } from "structures/ExtendedStructure";

export interface TowerStates extends BaseStructureStates {
  attack: StructureState;
  repair: StructureState;
  heal: StructureState;
}

class Tower extends ExtendedStructure implements StatefulStructure {
  states: TowerStates;
  damagedCreeps: Creep[];
  target?: Creep | Structure;

  constructor(tower: StructureTower, room: StatefulRoom) {
    super(tower, room);

    this.damagedCreeps =
      _.filter(this.room.creeps, creep => creep.hits < creep.hitsMax) || [];

    const attackProc = () => {
      const target = this.pos.findClosestByRange(this.room.hostileCreeps);
      target && tower.attack(target);
    };

    const healProc = () => {
      if (this.damagedCreeps.length > 0) {
        const target = this.pos.findClosestByRange(this.damagedCreeps);
        target && tower.heal(target);
      }
    };

    const repairProc = () => {
      if (this.room.damagedStructures.length > 0) {
        const { roads, defenses, others } = splitStructures(
          this.room.damagedStructures
        );
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

        target && tower.repair(target);
      }
    };

    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: () => {
          if (this.damagedCreeps.length > 0) {
            this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
            return;
          } else if (this.room.damagedStructures) {
            this.updateStateCode(StateCode.REPAIR, "Repairing structures");
            return;
          }
        }
      },
      attack: {
        code: StateCode.ATTACK,
        run: attackProc,
        transition: () => {
          if (this.room.hostileCreeps.length === 0) {
            this.updateStateCode(StateCode.INIT, "Threats eliminated. Resetting...");
            return;
          }
        }
      },
      repair: {
        code: StateCode.REPAIR,
        run: repairProc,
        transition: () => {
          if (this.room.hostileCreeps.length > 0) {
            this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
            return;
          }
          if (this.damagedCreeps.length > 0) {
            this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
            return;
          }
        }
      },
      heal: {
        code: StateCode.HEAL,
        run: healProc,
        transition: () => {
          if (this.room.hostileCreeps.length > 0) {
            this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
            return;
          }
          if (this.damagedCreeps.length === 0 && this.room.damagedStructures.length > 0) {
            this.updateStateCode(StateCode.REPAIR, "Repairing structures");
            return;
          }
        }
      }
    };
  }
}
export default Tower;

const splitStructures = (structures: Structure[]) => {
  const roads: Structure[] = [];
  const defenses: Structure[] = [];
  const others: Structure[] = [];
  structures.forEach(structure => {
    const structureType = structure.structureType;
    switch (structureType) {
      case STRUCTURE_ROAD:
        roads.push(structure);
        break;
      case STRUCTURE_WALL:
        defenses.push(structure);
        break;
      case STRUCTURE_RAMPART:
        defenses.push(structure);
        break;
      default:
        others.push(structure);
        break;
    }
  });

  return { roads, defenses, others };
};

// class Tower extends ExtendedStructure {
//   // attack: (target: Structure<StructureConstant> | AnyCreep) => ScreepsReturnCode;
//   // heal: (target: AnyCreep) => ScreepsReturnCode;
//   // repair: (target: Structure<StructureConstant>) => ScreepsReturnCode;
//   // store: Store<"energy", false>;
//   // my: boolean;
//   // owner: Owner;
//   damagedCreeps: ExtendedCreep[];

//   constructor(tower: StructureTower, room: StatefulRoom) {
//     super(tower, room);
//     // this.attack = tower.attack;
//     // this.heal = tower.heal;
//     // this.repair = tower.repair;
//     // this.store = tower.store;
//     // this.my = tower.my;
//     // this.owner = tower.owner;

//     // this.damagedCreeps = _.filter(
//     //   this.room.find(FIND_MY_CREEPS),
//     //   creep => creep.hits < creep.hitsMax
//     // );

//     // const attackProc = () => {
//     //   const enemies = this.room.find(FIND_HOSTILE_CREEPS);
//     //   const target = this.pos.findClosestByRange(enemies);
//     //   target && tower.attack(target);
//     // };

//     // const healProc = () => {
//     //   if (this.damagedCreeps.length > 0) {
//     //     const target = this.pos.findClosestByRange(this.damagedCreeps);
//     //     target && tower.heal(target);
//     //   }
//     // };

//     // const repairProc = () => {
//     //   if (this.room.damagedStructures.length > 0) {
//     //     const roads: Structure[] = [];
//     //     const defenses: Structure[] = [];
//     //     const others: Structure[] = [];
//     //     this.room.damagedStructures.forEach(structure => {
//     //       const structureType = structure.structureType;
//     //       switch (structureType) {
//     //         case STRUCTURE_ROAD:
//     //           roads.push(structure);
//     //           break;
//     //         case STRUCTURE_WALL:
//     //           defenses.push(structure);
//     //           break;
//     //         case STRUCTURE_RAMPART:
//     //           defenses.push(structure);
//     //           break;
//     //         default:
//     //           others.push(structure);
//     //           break;
//     //       }
//     //     });
//     //     let target = undefined;
//     //     if (roads.length > 0) {
//     //       target = this.pos.findClosestByRange(roads);
//     //     }

//     //     if (!target && others.length > 0) {
//     //       target = others.sort((a, b) => {
//     //         return a.hits < b.hits ? -1 : 1;
//     //       })[0];
//     //     }

//     //     if (!target && defenses.length > 0) {
//     //       target = defenses.sort((a, b) => {
//     //         return a.hits < b.hits ? -1 : 1;
//     //       })[0];
//     //     }

//     //     target && tower.repair(target);
//     //   }
//     // };

//     // this.states = {
//     //   init: {
//     //     code: StateCode.INIT,
//     //     run: () => {},
//     //     transition: () => {
//     //       if (this.damagedCreeps.length > 0)
//     //         this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
//     //       else if (this.room.damagedStructures)
//     //         this.updateStateCode(StateCode.REPAIR, "Repairing structures");
//     //     }
//     //   },
//     //   attack: {
//     //     code: StateCode.ATTACK,
//     //     run: attackProc,
//     //     transition: () => {
//     //       if (this.room.find(FIND_HOSTILE_CREEPS).length === 0) {
//     //         this.updateStateCode(StateCode.INIT, "Threats eliminated. Resetting...");
//     //       }
//     //     }
//     //   },
//     //   repair: {
//     //     code: StateCode.REPAIR,
//     //     run: repairProc,
//     //     transition: () => {
//     //       if (this.room.find(FIND_HOSTILE_CREEPS).length > 0) {
//     //         this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
//     //       }
//     //       if (this.damagedCreeps.length > 0) {
//     //         this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
//     //       }
//     //     }
//     //   },
//     //   heal: {
//     //     code: StateCode.HEAL,
//     //     run: healProc,
//     //     transition: () => {
//     //       if (this.room.find(FIND_HOSTILE_CREEPS).length > 0) {
//     //         this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
//     //       }
//     //       if (this.damagedCreeps.length === 0) {
//     //         this.room.damagedStructures.length > 0 &&
//     //           this.updateStateCode(StateCode.REPAIR, "Repairing structures");
//     //       }
//     //     }
//     //   }
//     // };
//   }
// }

// export default Tower;

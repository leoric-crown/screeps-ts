import { BaseStructureStates, StructureState, StateCode } from "../../types/States";
import ExtendedRoom from "../../extend/ExtendedRoom";
import ExtendedStructure from "../../extend/ExtendedStructure";
import ExtendedCreep from "extend/ExtendedCreep";

export interface TowerStates extends BaseStructureStates {
  attack: StructureState;
  repair: StructureState;
  heal: StructureState;
}

class Tower extends ExtendedStructure {
  attack: (target: Structure<StructureConstant> | AnyCreep) => ScreepsReturnCode;
  heal: (target: AnyCreep) => ScreepsReturnCode;
  repair: (target: Structure<StructureConstant>) => ScreepsReturnCode;
  store: Store<"energy", false>;
  my: boolean;
  owner: Owner;
  damagedCreeps: ExtendedCreep[];

  constructor(tower: StructureTower, room: ExtendedRoom) {
    super(tower, room);
    this.attack = tower.attack;
    this.heal = tower.heal;
    this.repair = tower.repair;
    this.store = tower.store;
    this.my = tower.my;
    this.owner = tower.owner;

    this.damagedCreeps = _.filter(
      this.room.find(FIND_MY_CREEPS),
      creep => creep.hits < creep.hitsMax
    );

    const attackProc = (room: ExtendedRoom) => {
      const enemies = room.find(FIND_HOSTILE_CREEPS);
      const target = this.pos.findClosestByRange(enemies);
      target && this.attack(target);
    };

    const healProc = () => {
      if (this.damagedCreeps.length > 0) {
        const target = this.pos.findClosestByRange(this.damagedCreeps);
        target && this.heal(target);
      }
    };

    const repairProc = () => {
      if (this.room.damagedStructures.length > 0) {
        const roads: Structure[] = [];
        const defenses: Structure[] = [];
        const others: Structure[] = [];
        this.room.damagedStructures.forEach(structure => {
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

    this.states = {
      init: {
        code: StateCode.INIT,
        run: () => {},
        transition: () => {
          if (this.damagedCreeps.length > 0)
            this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
          else if (this.room.damagedStructures)
            this.updateStateCode(StateCode.REPAIR, "Repairing structures");
        }
      },
      attack: {
        code: StateCode.ATTACK,
        run: attackProc,
        transition: (room: ExtendedRoom) => {
          if (room.find(FIND_HOSTILE_CREEPS).length === 0) {
            this.updateStateCode(StateCode.INIT, "Threats eliminated. Resetting...");
          }
        }
      },
      repair: {
        code: StateCode.REPAIR,
        run: repairProc,
        transition: () => {
          if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
            this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
          }
          if (this.damagedCreeps.length > 0) {
            this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
          }
        }
      },
      heal: {
        code: StateCode.HEAL,
        run: healProc,
        transition: (room: ExtendedRoom) => {
          if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
            this.updateStateCode(StateCode.ATTACK, "Attacking hostile creeps");
          }
          if (this.damagedCreeps.length === 0) {
            this.room.damagedStructures.length > 0 &&
              this.updateStateCode(StateCode.REPAIR, "Repairing structures");
          }
        }
      }
    };
  }
}

export default Tower;

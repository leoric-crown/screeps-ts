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

    this.damagedCreeps = _.filter(this.room.creeps, creep => creep.hits < creep.hitsMax);
    const attackProc = () => {};
    const healProc = () => {
      if (this.damagedCreeps.length > 0) {
        const target = this.pos.findClosestByRange(this.damagedCreeps);
        target && this.heal(target);
      }
    };
    const repairProc = () => {
      if (this.room.damagedStructures.length > 0) {
        const roads: Structure[] = [];
        const walls: Structure[] = [];
        const others: Structure[] = [];
        this.room.damagedStructures.forEach(structure => {
          const structureType = structure.structureType;
          switch (structureType) {
            case STRUCTURE_ROAD:
              roads.push(structure);
              break;
            case STRUCTURE_WALL:
              walls.push(structure);
              break;
            default:
              others.push(structure);
              break;
          }
          structureType === STRUCTURE_ROAD && roads.push(structure);
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

        if (!target && walls.length > 0) {
          if (room.energyAvailable > room.energyCapacityAvailable * 0.7)
            target = walls.sort((a, b) => {
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
        transition: () => {}
      },
      repair: {
        code: StateCode.REPAIR,
        run: repairProc,
        transition: () => {
          if (this.damagedCreeps.length > 0) {
            this.updateStateCode(StateCode.HEAL, "Healing my fellow creeps");
          }
        }
      },
      heal: {
        code: StateCode.HEAL,
        run: healProc,
        transition: () => {
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

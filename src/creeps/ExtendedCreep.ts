// import { CreepState, StateCode } from "types/States";
// import { CreepRoleStates } from ".";

// // declare global {
// //   interface CreepMemory {
// //     type: CreepType;
// //     role: CreepRole;
// //     state?: number;
// //     target?: Id<_HasId>;
// //     room?: Id<_HasId>;
// //     working?: boolean;
// //   }
// // }

// export enum CreepType {
//   HARVESTER = "harvester",
//   BUILDER = "builder",
//   UPGRADER = "upgrader",
//   HAULER = "hauler"
// }

// export enum CreepRole {
//   HARVESTER = "harvester",
//   UPGRADER = "upgrader",
//   BUILDER = "builder",
//   HAULER = "hauler"
// }

// export type CreepTarget = Creep | ConstructionSite | Structure;

// export class ExtendedCreep extends Creep {
//   type?: CreepType;
//   role?: CreepRole;
//   states?: CreepRoleStates;
//   target?: CreepTarget;

//   updateStateCode: (code: StateCode, message?: string) => void;
//   harvestProc: (room: Room) => void;
//   upgradeProc: (room: Room) => void;
//   loadProc: (room: Room, filter?: (structure: Structure) => boolean) => void;
//   loadSelfProc: (room: Room) => void;
//   buildProc: (room: Room) => void;
//   haulProc: (room: Room) => void;
//   loadStructureProc: (room: Room) => void;

//   stateCodeMap = () => {
//     const map: { [stateCode: number]: CreepState } = {};
//     if (this.states) Object.entries(this.states).forEach(([name, state]) => {
//       map[state.code] = state;
//     })
//     return map;
//   };

//   getState = () => {
//     let state = {} as CreepState;
//     Object(this.memory).hasOwnProperty("state") && (state = this.stateCodeMap()[this.memory.state as number]);
//     return state;
//   };

//   constructor(creep: Creep) {
//     super(creep.id);

//     this.updateStateCode = (code: StateCode, message?: string) => {
//       this.memory.state = code;
//       this.memory.target = undefined;
//       if (message) this.say(message);
//     };

//     this.harvestProc = (room: Room) => {
//       const targetSource = this.pos.findClosestByPath(room.sources.filter(source => source.energy > 0));
//       if (targetSource && this.harvest(targetSource) === ERR_NOT_IN_RANGE) {
//         this.moveTo(targetSource, {
//           visualizePathStyle: { stroke: "#ffffff" }
//         });
//       }
//     };
//     this.upgradeProc = (room: Room) => {
//       if (
//         room.controller &&
//         this.upgradeController(room.controller) === ERR_NOT_IN_RANGE
//       ) {
//         this.moveTo(room.controller);
//       }
//     };
//     this.loadProc = (room: Room, filter?: (structure: Structure) => boolean) => {
//       const targets = filter ? room.loadables.filter(filter) : room.loadables;

//       let target: LoadableStructure | undefined = undefined;
//       if (this.memory.target) {
//         const fetchedObject = Game.getObjectById(
//           this.memory.target as Id<LoadableStructure>
//         );
//         target = (fetchedObject as LoadableStructure) || undefined;
//         if (target && target.store.getFreeCapacity() === 0) target = undefined;
//       }

//       if (target == undefined)
//         target = this.pos.findClosestByPath(targets) || room.spawns[0];
//       const tryLoad = this.transfer(target as LoadableStructure, RESOURCE_ENERGY);
//       if (tryLoad === ERR_NOT_IN_RANGE) {
//         this.moveTo(target, {
//           visualizePathStyle: { stroke: "#ffffff" }
//         });
//       } else if (tryLoad === ERR_FULL) {
//         this.memory.target = undefined;
//       }
//     };
//     this.loadSelfProc = (room: Room) => {
//       const target =
//         this.pos.findClosestByPath(
//           [...room.spawns, ...room.extensions].filter(structure => structure.energy > 0)
//         ) || room.spawns[0];
//       const tryWithdraw = this.withdraw(target, RESOURCE_ENERGY);
//       if (tryWithdraw === ERR_NOT_IN_RANGE) {
//         this.moveTo(target);
//       }
//     };
//     this.buildProc = (room: Room) => {
//       if (room.buildables.length > 0) {
//         const tryBuild = this.build(room.buildables[0]);
//         if (tryBuild === ERR_NOT_IN_RANGE) {
//           this.moveTo(room.buildables[0], {
//             visualizePathStyle: { stroke: "#ffffff" }
//           });
//         }
//       }
//     };
//     this.haulProc = (room: Room) => {
//       let target: LoadableStructure | undefined = undefined;
//       if (this.memory.target) {
//         const fetchedObject = Game.getObjectById(
//           this.memory.target as Id<LoadableStructure>
//         );
//         target = (fetchedObject as LoadableStructure) || undefined;
//         if (target && target.store.getFreeCapacity() === 0) target = undefined;
//       }
//       if (target == undefined) {
//         const findTarget =
//           this.pos.findClosestByPath(room.containersAndStorage, {
//             filter: structure => structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
//           }) || undefined;
//         if (findTarget) {
//           target = findTarget;
//           this.memory.target = findTarget.id;
//         }
//       }

//       if (target !== undefined) {
//         const tryWithdraw = this.withdraw(
//           target as StructureContainer | StructureStorage,
//           RESOURCE_ENERGY
//         );
//         if (tryWithdraw === ERR_NOT_IN_RANGE) {
//           this.moveTo(target);
//         } else if (tryWithdraw === ERR_NOT_ENOUGH_ENERGY) {
//           this.memory.target = undefined;
//         }
//       }
//     };
//     this.loadStructureProc = (room: Room) => {
//       const targets = room.managedStructures
//         .filter(
//           structure =>
//             structure.store.getFreeCapacity() !== 0 &&
//             structure.structureType !== STRUCTURE_SPAWN
//         )
//         .sort((a, b) => (a.store.energy < b.store.energy ? -1 : 1))
//         .filter((structure, idx, structures) => {
//           return structure.store.energy === structures[0].store.energy;
//         });

//       const target = this.pos.findClosestByPath(targets);
//       if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) >= 50) {
//         if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
//           this.moveTo(target);
//       }
//     };
//   }
// }

// export default ExtendedCreep;

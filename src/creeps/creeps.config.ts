import { forEach } from "lodash";
import { CreepType, CreepRole } from "../types/States";

type CreepConfigData = {
  id: number;
  creepType: CreepType;
  role: CreepRole;
  desired: number;
  body: BodyPartConstant[];
  scaleBody?: BodyPartConstant[];
  bodyOrder: BodyPartConstant[];
  scaleLimit?: number;
};

export interface CreepConfig extends CreepConfigData {
  getBodyCost: () => number;
  getRequestCost: (maxCost: number) => number;
  getScaledBodyCount: (maxCost: number) => number;
  getScaledBody: (maxCost: number) => BodyPartConstant[];
}

export const bodyAbbreviations = {
  move: "M",
  work: "W",
  carry: "C",
  attack: "A",
  ranged_attack: "Ra",
  tough: "T",
  heal: "H",
  claim: "C"
};

const defaultBodyOrder = [WORK, CARRY, MOVE];

const configData: CreepConfigData[] = [
  {
    id: 0,
    creepType: CreepType.HARVESTER,
    role: CreepRole.HARVESTER,
    desired: 3, // at least 5 work parts per source
    body: [WORK, WORK, CARRY, MOVE],
    scaleBody: [WORK],
    scaleLimit: 1,
    bodyOrder: defaultBodyOrder
  },
  {
    id: 1,
    creepType: CreepType.HAULER,
    role: CreepRole.HAULER,
    desired: 1,
    body: [WORK, CARRY, MOVE],
    scaleBody: [CARRY, MOVE],
    bodyOrder: defaultBodyOrder
  },
  // remote creeps here
  {
    id: 2,
    creepType: CreepType.BUILDER,
    role: CreepRole.BUILDER,
    desired: 1,
    body: [WORK, CARRY, MOVE, MOVE],
    scaleBody: [CARRY, MOVE],
    bodyOrder: defaultBodyOrder
  },
  {
    id: 3,
    creepType: CreepType.UPGRADER,
    role: CreepRole.UPGRADER,
    desired: 1,
    body: [WORK, CARRY, MOVE],
    scaleBody: [WORK, CARRY, MOVE],
    bodyOrder: defaultBodyOrder
  }
];

const getBodyCost = function (body: BodyPartConstant[]) {
  return body.reduce((count, part) => {
    return count + BODYPART_COST[part];
  }, 0);
};

const getRequestCost = function (this: CreepConfigData, maxCost: number) {
  const baseCost = getBodyCost(this.body);
  const scaleCost = this.scaleBody ? getBodyCost(this.scaleBody) : 0;
  const scaleCount = scaleCost > 0 ? getScaledBodyCount.bind(this)(maxCost) : 0;

  return baseCost + scaleCost * scaleCount;
};

const getScaledBody = function (this: CreepConfigData, maxCost: number) {
  let scaledBody: BodyPartConstant[] = this.body;
  if (this.scaleBody && this.scaleBody.length > 0) {
    const scaleNum = getScaledBodyCount.bind(this)(maxCost);
    const scaleBody = this.scaleBody;
    if (scaleNum > 0)
      _.range(0, scaleNum, 1).forEach(() => {
        if (scaledBody.length + scaleBody.length <= 50)
          scaledBody = [...scaledBody, ...(this.scaleBody as BodyPartConstant[])];
      });
  }
  return scaledBody;
};

const getScaledBodyCount = function (this: CreepConfigData, maxCost: number) {
  const baseCost = getBodyCost(this.body);
  const scaleCost = this.scaleBody ? getBodyCost(this.scaleBody) : 0;
  return (
    Math.min(
      this.scaleLimit || Math.floor((maxCost - baseCost) / scaleCost),
      Math.floor((maxCost - baseCost) / scaleCost)
    ) || 0
  );
};

export const sortBodiesByOrder = (bodyOrder: BodyPartConstant[]) => {
  const filter = (x: BodyPartConstant, y: BodyPartConstant) => {
    return bodyOrder.indexOf(x) <= bodyOrder.indexOf(y) ? -1 : 1;
  };

  return filter;
};

const creepsConfig = configData.map(configData => {
  const creepConfig = configData;
  Object.defineProperties(creepConfig, {
    // bodyCost: {
    //   value: getBodyCost
    // },
    getRequestCost: {
      value: getRequestCost.bind(configData)
    },
    getScaledBody: {
      value: (maxCost: number) => {
        const body = getScaledBody.bind(configData)(maxCost);
        return body.sort(sortBodiesByOrder(defaultBodyOrder));
      }
    },
    getScaledBodyCount: {
      value: getScaledBodyCount.bind(configData)
    }
  });
  return creepConfig as CreepConfig;
});

export default creepsConfig;

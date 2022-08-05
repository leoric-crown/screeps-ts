import { forEach } from "lodash";
import { CreepType, CreepRole } from "../types/States";

export type CreepConfigData = {
  id: number;
  name: string;
  creepType: CreepType;
  role: CreepRole;
  desired: number;
  // desired: () => number;
  body: BodyPartConstant[];
  scaleBody?: BodyPartConstant[];
  bodyOrder?: BodyPartConstant[];
  scaleLimit?: number;
  target?: Id<Creep | AnyStoreStructure | Source | StructureController>;
  remoteRoom?: string;
  home?: string;
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

const defaultBodyOrder: BodyPartConstant[] = [WORK, CARRY, MOVE];

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

export const sortBodiesByOrder = function (
  this: CreepConfigData,
  bodyOrder?: BodyPartConstant[]
) {
  const _bodyOrder = bodyOrder || this.bodyOrder || defaultBodyOrder;
  const filter = (x: BodyPartConstant, y: BodyPartConstant) => {
    return _bodyOrder.indexOf(x) <= _bodyOrder.indexOf(y) ? -1 : 1;
  };

  return filter;
};

const makeCreepConfigs = (data: CreepConfigData[]) => {
  return data.map(configData => {
    const creepConfig = configData;
    Object.defineProperties(creepConfig, {
      getRequestCost: {
        value: getRequestCost.bind(configData)
      },
      getScaledBody: {
        value: (maxCost: number) => {
          const body = getScaledBody.bind(configData)(maxCost);
          return body.sort(sortBodiesByOrder.bind(configData)());
        }
      },
      getScaledBodyCount: {
        value: getScaledBodyCount.bind(configData)
      }
    });
    return creepConfig as CreepConfig;
  });
};

export default makeCreepConfigs;

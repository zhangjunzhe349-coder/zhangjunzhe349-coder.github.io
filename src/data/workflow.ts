/**
 * AIGC 内容生产工作流 —— 六步方法论（能力演示）
 * 内容来自 content.json 的 workflow 段，此处只做类型与转发。
 */

import content from "./content.json";

export interface FlowStep {
  /** 步骤序号 */
  no: string;
  /** 英文阶段名 */
  stage: string;
  /** 中文标题 */
  title: string;
  /** 正文，段落数组 */
  body: string[];
  /** 是否为核心关键步骤（高亮） */
  key?: boolean;
  /** 补充说明（缩小、弱化） */
  note?: string;
  /** 关键步骤的分支路线 */
  routes?: { label: string; text: string }[];
}

export const flowSteps: FlowStep[] = content.workflow.steps as FlowStep[];

/** 贯穿全流程的原则 */
export const flowPrinciples: string[] = content.workflow.principles;

/** 一句话主张 */
export const flowMotto: string = content.workflow.motto;

/** 页面导语 */
export const flowIntro = content.workflow.intro;

/**
 * AIGC 内容生产工作流 —— 六步方法论（能力演示）
 * 内容来自 aigc_workflow.html，此处用站点设计语言的深色版本重建。
 */

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

export const flowSteps: FlowStep[] = [
  {
    no: "01",
    stage: "INPUT",
    title: "整理所有现有资料",
    body: [
      "卖点、场景、拍摄、模型——全部整合进画布。",
    ],
    note: "Agent 阅读本地文件 → 卖点自动总结",
  },
  {
    no: "02",
    stage: "PLAN",
    title: "策划案：脚本 + 镜头创意",
    body: ["脑中大致有画面；没灵感就找对标。"],
    note: "把想法发给 AI，让它输出专业的静图 / 动态视频提示词脚本。",
  },
  {
    no: "03",
    stage: "VISUAL",
    title: "确定主场景产品图 + 人物聚餐图",
    body: [
      "沉淀的 Skill 效果总不理想，本质在这一步。",
    ],
    key: true,
    routes: [
      { label: "路线 A", text: "反推参考图 + 加入 Z 轴空间关系。" },
      {
        label: "路线 B",
        text: "只用简单提示词描述人物、带到一点场景，让 AI 自由发挥——过程中自然抽到好人物、好场景。",
      },
    ],
  },
  {
    no: "04",
    stage: "STORYBOARD",
    title: "确定卖点分镜",
    body: [
      "根据实拍换底 / 建模，挑出可用的白底图资产。",
      "用「场景图 + 脚本」抽 9 宫格分镜；脚本要精简，去掉无关噪音。脑中过一遍画面，没灵感就找对标——参考帧做像素级反推。",
    ],
  },
  {
    no: "05",
    stage: "REFINE",
    title: "精修卖点分镜 → 生视频",
    body: ["把分镜图传进去，一段一段手修提示词，逐帧打磨，再生成动态视频。"],
  },
  {
    no: "06",
    stage: "DELIVER",
    title: "后期成片",
    body: ["剪辑、配乐、补拍、包装——交付上线。"],
  },
];

/** 贯穿全流程的原则 */
export const flowPrinciples: string[] = [
  "资产沉淀：白底图 / Skill / 提示词",
  "一张对的参考图 > 长提示词",
  "人在回路，逐段精修",
];

/** 一句话主张 */
export const flowMotto = "AI 出初稿，人做导演。";

/** 页面导语 */
export const flowIntro = {
  eyebrow: "AIGC CONTENT PIPELINE · 个人方法论",
  title: "从素材到成片的六步生产工作流",
  sub: "把模糊的创意需求，拆成可重复执行、可沉淀资产、可交付协作的标准动作。",
};

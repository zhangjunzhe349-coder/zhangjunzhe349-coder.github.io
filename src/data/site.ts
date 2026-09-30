/**
 * 站点级配置 —— 这里只是一层「类型 + 转发」，真正的文字内容在 ./content.json。
 *
 * 改文案的两种方式：
 *   1. 双击工作区根目录的「启动编辑器.bat」，在可视化界面里改（推荐）
 *   2. 直接编辑 portfolio/src/data/content.json
 * 本文件通常不需要动。
 */

import content from "./content.json";

export const site = content.site;
export const keywords = content.keywords;

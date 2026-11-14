import fs from "node:fs";
let p="lib/subject-dictionaries.js"; let c=fs.readFileSync(p,"utf8");
const marker="export const SUBJECT_IDS = Object.keys(SUBJECT_ASSOCIATIONS);";
const add=`/** Subject-specific suffixes for the strong-term demotion gate only. Never used for term expansion. */
export const SUBJECT_GATE_SUFFIXES = {
  语文: ['主旨', '手法', '修辞', '病句', '文言文', '古诗', '作文'],
  数学: ['函数', '方程', '不等式', '数列', '几何', '概率', '统计', '导数', '向量'],
  英语: ['语法', '时态', '从句', '词汇', '阅读', '写作', '完形'],
  物理: ['力学', '电磁学', '运动学', '电路', '光学', '热学', '实验'],
  化学: ['化学', '反应', '工艺', '原理', '实验', '流程', '装置', '设备', '材料', '物质'],
  生物: ['细胞', '遗传', '生态', '调节', '代谢', '免疫', '基因'],
  历史: ['革命', '战争', '制度', '改革', '运动', '事件', '背景', '影响'],
  地理: ['地理', '气候', '地形', '水文', '区域', '人口', '城市', '农业', '工业'],
  政治: ['政治', '经济', '文化', '哲学', '法律', '政府', '市场', '矛盾', '价值观'],
};

${marker}`;
if(c.includes("SUBJECT_GATE_SUFFIXES")) throw new Error('already exists');
c=c.replace(marker,add);
fs.writeFileSync(p,c,"utf8");
console.log("subject gate suffixes");

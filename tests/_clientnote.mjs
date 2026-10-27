import fs from "node:fs";
let p="lib/client.js"; let c=fs.readFileSync(p,"utf8");
c=c.replace("这里控制每次检索让模型看什么、看多少。设置只影响输出，不会重建索引，也不改变题库文件。","这里控制检索输出、题库位置和索引位置。只改输出不会重建索引；修改题库/索引路径并保存后会自动开始建库。");
fs.writeFileSync(p,c,"utf8");
console.log("client note");

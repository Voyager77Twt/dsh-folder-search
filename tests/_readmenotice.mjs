import fs from "node:fs";
const zh = `

---

## 声明与免责

- 本插件主要由 AI 辅助生成，并由维护者进行人工审阅、测试和整理；可能存在错误、遗漏或不适合特定用途之处。
- 代码和文档按 MIT License 提供，不提供任何明示或暗示担保；使用本插件造成的直接或间接损失，由使用者自行承担。
- 插件读取、索引和展示的题库内容、文件名、第三方文档、商标和示例归各自权利人所有。MIT License 不覆盖这些第三方内容；使用者应确保自己有权处理相关文件。
- 本项目与 DeepSeek、DSH 或任何题库/文档提供方没有隶属、合作或背书关系；文中出现的第三方名称仅用于说明兼容性。
- AI 生成内容可能包含与公开代码或资料相似的片段。若你认为本项目侵犯了你的权利，请通过仓库 Issue 联系，核实后会删除或调整相关内容。
- 以上内容不构成法律意见；涉及商业分发、二次修改或高风险使用场景时，请自行进行版权、许可和安全审查。
`;
const en = `

---

## Notice and Disclaimer

- This plugin is primarily AI-assisted, with human review, testing, and editing by the maintainer. It may contain errors, omissions, or unsuitability for a particular purpose.
- Code and documentation are provided under the MIT License, without warranties of any kind. Users are responsible for any direct or indirect loss arising from use.
- Library content, file names, third-party documents, trademarks, and examples remain the property of their respective owners. The MIT License does not cover third-party content; users must ensure they have the right to process their files.
- This project is not affiliated with, endorsed by, or partnered with DeepSeek, DSH, or any content provider. Third-party names are used only to describe compatibility.
- AI-assisted output may resemble publicly available code or material. If you believe this project infringes your rights, please open an issue in the repository; verified material will be removed or adjusted.
- This notice is not legal advice. For commercial distribution, modification, or high-risk use, perform your own copyright, licensing, and security review.
`;
for (const [file, text] of [["README.md", zh], ["README.en.md", en]]) {
  let c=fs.readFileSync(file,"utf8");
  if(!c.includes("## 声明与免责") && !c.includes("## Notice and Disclaimer")) c += text;
  fs.writeFileSync(file,c,"utf8");
}
console.log("README notices");

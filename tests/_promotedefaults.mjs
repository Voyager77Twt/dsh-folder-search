import fs from "node:fs";
let p="lib/settings-store.js"; let c=fs.readFileSync(p,"utf8");
const replacements=[
 ["  normalMaxFiles: 12,","  normalMaxFiles: 16,"],
 ["  expandSnippetChars: 45,","  expandSnippetChars: 30,"],
 ["  associationLimit: 4,","  associationLimit: 2,"],
 ["  generalLimit: 4,","  generalLimit: 1,"],
 ["  strongMaxFiles: 6,","  strongMaxFiles: 8,"],
 ["  strongSnippetChars: 45,","  strongSnippetChars: 60,"],
 ["  finalMaxFiles: 20,","  finalMaxFiles: 30,"]
];
for(const [a,b] of replacements){ if(!c.includes(a)) throw new Error('missing '+a); c=c.replace(a,b); }
fs.writeFileSync(p,c,"utf8");
p="lib/search.js"; c=fs.readFileSync(p,"utf8");
c=c.replace("  } else if (mode === 'default') {\n    next.normalMaxFiles = 12;\n    next.normalMaxBlocksPerFile = 2;\n    next.expandMaxFiles = 6;\n    next.expandMaxBlocksPerFile = 2;\n    next.strongMaxFiles = 6;\n    next.strongMaxBlocksPerFile = 2;\n    next.finalMaxFiles = 20;\n  } else if (mode === 'full') {","  } else if (mode === 'full') {");
c=c.replace("    next.normalMaxFiles = 20;\n    next.normalMaxBlocksPerFile = 2;\n    next.expandMaxFiles = 10;\n    next.expandMaxBlocksPerFile = 2;\n    next.strongMaxFiles = 10;\n    next.strongMaxBlocksPerFile = 2;\n    next.finalMaxFiles = 30;\n  }","    next.normalMaxBlocksPerFile = 2;\n    next.expandMaxBlocksPerFile = 2;\n    next.strongMaxBlocksPerFile = 2;\n  }");
fs.writeFileSync(p,c,"utf8");
console.log("promote custom defaults");

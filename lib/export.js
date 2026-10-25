import fs from 'node:fs/promises';
import path from 'node:path';
import { buildDocx } from './docx-writer.js';

function sanitizeName(name) {
  return String(name ?? '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function linesOf(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function cleanNumber(value, fallback) {
  const text = String(value ?? fallback).trim();
  return text.replace(/[.、．]$/, '');
}

export async function exportPaper(args, config = {}) {
  const questions = Array.isArray(args.questions) ? args.questions : [];
  if (!questions.length) throw new Error('questions 不能为空');
  const title = String(args.title ?? '文件库组卷（实验）').trim() || '文件库组卷（实验）';
  const includeAnswers = args.includeAnswers !== false;
  const outputDir = path.resolve(String(args.outputDir ?? config.outputDir ?? path.join(process.cwd(), '组卷')));
  const filename = `${sanitizeName(args.filename ?? title) || '组卷'}.docx`;
  const outputPath = path.join(outputDir, filename);

  const items = [];
  items.push({ kind: 'title', text: title });
  items.push({ kind: 'meta', text: `共 ${questions.length} 题 · 生成于 ${new Date().toLocaleString('zh-CN')} · 由“文件库检索模式”导出（实验功能）` });
  items.push({ kind: 'gap' });

  questions.forEach((question, index) => {
    const no = cleanNumber(question?.number, index + 1);
    const lines = linesOf(question?.text);
    if (!lines.length) return;
    items.push({ kind: 'question', number: no, text: lines[0], score: question?.score });
    for (const line of lines.slice(1)) items.push({ kind: 'line', text: line });
    if (question?.source) items.push({ kind: 'source', text: String(question.source) });
    items.push({ kind: 'gap' });
  });

  if (includeAnswers) {
    const answered = questions.some((question) => linesOf(question?.answer).length > 0);
    if (answered) {
      items.push({ kind: 'gap' });
      items.push({ kind: 'heading', text: '参考答案' });
      questions.forEach((question, index) => {
        const lines = linesOf(question?.answer);
        if (!lines.length) return;
        const no = cleanNumber(question?.number, index + 1);
        items.push({ kind: 'answer', number: no, text: lines[0] });
        for (const line of lines.slice(1)) items.push({ kind: 'line', text: line });
        items.push({ kind: 'gap' });
      });
    }
  }

  const buffer = buildDocx(items);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);
  const stat = await fs.stat(outputPath);
  return { path: outputPath, bytes: stat.size, questions: questions.length, includeAnswers, outputDir };
}

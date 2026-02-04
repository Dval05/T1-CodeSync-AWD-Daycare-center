import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import strip from 'strip-comments';

const cwd = process.cwd();

const patterns = [
  'api-crud/**/*.{js,jsx,ts,tsx}',
  'api-business/**/*.{js,jsx,ts,tsx}',
  'client/**/*.{js,jsx,ts,tsx}',
];

const ignore = [
  '**/node_modules/**',
  'Project-V1/**',
  'Project-V2/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/*.min.*',
];

function isTextLikelyCode(file) {
  // Skip config root files like vite.config.js in Project-V1/V2 via ignore
  return true;
}

async function processFile(file) {
  try {
    const abs = path.join(cwd, file);
    const src = await fs.readFile(abs, 'utf8');
    if (!isTextLikelyCode(file)) return;

    // Do not modify if file is empty
    if (!src.trim()) return;

    const stripped = strip(src, { preserveNewlines: true });
    if (stripped !== src) {
      await fs.writeFile(abs, stripped, 'utf8');
      console.log(`Stripped comments: ${file}`);
    }
  } catch (err) {
    console.warn(`Skip ${file}: ${err.message}`);
  }
}

async function main() {
  const files = await fg(patterns, { cwd, ignore, dot: false });
  for (const f of files) {
    await processFile(f);
  }
  console.log('Comment stripping complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

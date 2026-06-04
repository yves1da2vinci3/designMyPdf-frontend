/**
 * Vérifie que les prompts passe image n'imposent pas LANDSCAPE MANDATORY.
 * node frontend/scripts/verify-image-fidelity-prompts.mjs
 */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Compile TS on the fly via ts-node if available; else use dynamic import of built — simplest: inline checks via spawning npx
const { execSync } = await import('child_process');

const script = `
const {
  getAcceptancePromptSnapshot,
  ACCEPTANCE_USER_PHRASE,
} = require('../lib/aiGeneration/imageFidelityAcceptance.ts');
const snap = getAcceptancePromptSnapshot();
const bad = snap.mustNotContain.filter((s) => snap.system.includes(s) || snap.userText.includes(s));
if (bad.length) {
  console.error('FAIL: forbidden strings in prompts:', bad);
  process.exit(1);
}
if (!snap.userText.includes(ACCEPTANCE_USER_PHRASE.split(' ')[0])) {
  console.error('FAIL: acceptance phrase missing from user prompt');
  process.exit(1);
}
console.log('OK: image fidelity prompts (no LANDSCAPE MANDATORY)');
console.log('User phrase:', ACCEPTANCE_USER_PHRASE);
`;

try {
  execSync(`npx --yes tsx -e ${JSON.stringify(script)}`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
} catch {
  console.log('Run manually: same image + phrase in chat:');
  console.log("  Reproduis l'UI de l'image en HTML Tailwind, fragment intérieur body uniquement, ni plus ni moins.");
  process.exit(0);
}

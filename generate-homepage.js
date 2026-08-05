const fs = require('fs');
const path = require('path');

const root = __dirname;
const indexPath = path.join(root, 'index.html');
const excludedDirs = new Set(['.git', 'node_modules']);

const appMeta = {
  'algebra-app': { icon: '🧮', description: 'Practice algebra with interactive questions.' },
  'calculus cricket': { icon: '🏏', description: 'Explore calculus through a game.' },
  'collecting like terms': { icon: '➕', description: 'Simplify expressions by collecting like terms.' },
  'congruency crunch': { icon: '🔺', description: 'Test triangle congruence with quick problems.' },
  'distance vs time graph': { icon: '📈', description: 'Interpret motion graphs and speed.' },
  'divisibility-dash': { icon: '🔢', description: 'Race through divisibility rules.' },
  'equivalent-fraction-quest': { icon: '🍕', description: 'Explore equivalent fractions with visual models.' },
  'fraction-pizza-party': { icon: '🍕', description: 'Compare fraction slices in a fun party setting.' },
  'integration practice': { icon: '∫', description: 'Practise integration with guided questions.' },
  'mixed graphing 2': { icon: '📊', description: 'Plot and interpret mixed graphs.' },
  'mixed-numeral-conversion': { icon: '🔄', description: 'Convert between mixed numerals and improper fractions.' },
  'parabola-sketcher': { icon: '📐', description: 'Sketch parabolas and explore transformations.' },
  'set notation in venn diagram': { icon: '📚', description: 'Learn set notation visually with Venn diagrams.' },
  'simplify fractions': { icon: '✂️', description: 'Simplify fractions quickly and confidently.' },
  'simplify-proper-fractions': { icon: '✂️', description: 'Simplify proper fractions with confidence.' },
  'soh-cah-toa-challenge': { icon: '📐', description: 'Solve right-triangle problems using trigonometry.' },
  'thermal-directed-number-lab': { icon: '🌡️', description: 'Explore directed numbers with a temperature lab.' },
  'transformation-explorer': { icon: '🔄', description: 'Explore transformations in geometry.' },
  'trig-equation-builder': { icon: '📐', description: 'Build and solve trigonometric equations.' },
  'trig-side-master': { icon: '📐', description: 'Master trigonometric side-length problems.' }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTitle(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAppInfo(name) {
  const key = name.toLowerCase();
  const title = toTitle(name);
  const meta = appMeta[key];

  if (meta) {
    return { title, icon: meta.icon, description: meta.description };
  }

  const fallbackIcons = ['🧠', '📐', '🎯', '📊', '✨', '🔢', '🧪', '📈'];
  const index = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % fallbackIcons.length;

  return {
    title,
    icon: fallbackIcons[index],
    description: `Interactive ${title.toLowerCase()} activity.`
  };
}

if (!fs.existsSync(indexPath)) {
  console.error(`Homepage file not found at ${indexPath}`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

const appDirs = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    if (excludedDirs.has(name) || name.startsWith('.')) {
      return false;
    }

    const fullPath = path.join(root, name);
    return fs.existsSync(path.join(fullPath, 'index.html'));
  })
  .sort();

const items = appDirs
  .map((name) => {
    const app = getAppInfo(name);
    const safeTitle = escapeHtml(app.title);
    const safeDescription = escapeHtml(app.description);
    const encodedName = encodeURIComponent(name);

    return `            <li class="app-item">
                <a href="./${encodedName}/" class="app-link">
                    <div class="app-card-top">
                        <span class="app-icon" aria-hidden="true">${app.icon}</span>
                        <div class="app-text">
                            <span class="title">${safeTitle}</span>
                            <span class="app-description">${safeDescription}</span>
                        </div>
                    </div>
                    <span class="app-button">Open app</span>
                </a>
            </li>`;
  })
  .join('\n');

const updatedHtml = html.replace(
  /<!-- APP_LIST_START -->[\s\S]*?<!-- APP_LIST_END -->/,
  `<!-- APP_LIST_START -->\n${items}\n            <!-- APP_LIST_END -->`
);

fs.writeFileSync(indexPath, updatedHtml);
console.log(`Updated homepage with ${appDirs.length} apps.`);

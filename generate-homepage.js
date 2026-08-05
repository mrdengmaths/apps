const fs = require('fs');
const path = require('path');

const root = __dirname;
const indexPath = path.join(root, 'index.html');
const excludedDirs = new Set(['.git', 'node_modules']);

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
    const title = name
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return `            <li class="app-item">
                <a href="./${name}/" class="app-link">
                    <span class="title">${title}</span>
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

const fs = require("fs");
const path = require("path");

const root = __dirname;
const indexPath = path.join(root, "index.html");

let html = fs.readFileSync(indexPath, "utf8");

const appDirs = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    const fullPath = path.join(root, name);
    return !name.startsWith(".") && fs.existsSync(path.join(fullPath, "index.html"));
  })
  .sort();

const items = appDirs
  .map((name) => {
    const title = name
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return `            <li class="app-item">
                <a href="./${name}/" class="app-link">
                    <span class="title">${title}</span>
                </a>
            </li>`;
  })
  .join("\n");

html = html.replace(
  /<!-- APP_LIST_START -->[\s\S]*?<!-- APP_LIST_END -->/,
  `<!-- APP_LIST_START -->\n${items}\n            <!-- APP_LIST_END -->`
);

fs.writeFileSync(indexPath, html);
console.log(`Updated homepage with ${appDirs.length} apps.`);

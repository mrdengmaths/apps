const fs = require('fs');
const path = require('path');

const root = __dirname;
const indexPath = path.join(root, 'index.html');
const appRoot = path.join(root, 'app');
const excludedDirs = new Set(['.git', 'node_modules']);

const appMeta = {
  'algebra app': { icon: '🧮', description: 'Practice algebra with interactive questions.', keywords: 'algebra equations expressions variables simplify linear quadratic solving factor expand substitute evaluate polynomial constant coefficient' },
  'calculus cricket': { icon: '🏏', description: 'Explore calculus through a game.', keywords: 'calculus derivative integration limits area motion graph rate change antiderivative function curve' },
  'collecting like terms': { icon: '➕', description: 'Simplify expressions by collecting like terms.', keywords: 'like terms simplify algebra expressions combine collect polynomial term expand contract' },
  'congruency crunch': { icon: '🔺', description: 'Test triangle congruence with quick problems.', keywords: 'congruence triangles congruent sides angles sss sas asa aas rhs geometry proof' },
  'distance vs time graph': { icon: '📈', description: 'Interpret motion graphs and speed.', keywords: 'distance time graph speed velocity acceleration gradient rate motion linear' },
  'divisibility dash': { icon: '🔢', description: 'Race through divisibility rules.', keywords: 'divisibility factors multiples prime composite remainder divisible integer' },
  'equivalent fraction quest': { icon: '🍕', description: 'Explore equivalent fractions with visual models.', keywords: 'equivalent fractions simplify numerator denominator ratio proportion reduce' },
  'fraction pizza party': { icon: '🍕', description: 'Compare fraction slices in a fun party setting.', keywords: 'fractions pizza equivalent partition parts sharing numerator denominator portion' },
  'integration practice': { icon: '∫', description: 'Practise integration with guided questions.', keywords: 'integration calculus antiderivative definite integral area region function' },
  'mixed graphing 2': { icon: '📊', description: 'Plot and interpret mixed graphs.', keywords: 'graphing functions coordinates plot lines curves intercepts' },
  'mixed numeral conversion': { icon: '🔄', description: 'Convert between mixed numerals and improper fractions.', keywords: 'mixed numbers improper fraction convert decimal fraction ratio percent' },
  'parabola sketcher': { icon: '📐', description: 'Sketch parabolas and explore transformations.', keywords: 'parabola sketch graph quadratic vertex axis curve functions graphing symmetry' },
  'set notation in venn diagram': { icon: '📚', description: 'Learn set notation visually with Venn diagrams.', keywords: 'set notation venn diagram union intersection complement subset elements logic' },
  'simplify fractions': { icon: '✂️', description: 'Simplify fractions quickly and confidently.', keywords: 'simplify reduce fractions numerator denominator gcd lowest terms fraction' },
  'simplify proper fractions': { icon: '✂️', description: 'Simplify proper fractions with confidence.', keywords: 'proper fractions simplify reduce numerator denominator mixed number improper' },
  'soh cah toa challenge': { icon: '📐', description: 'Solve right-triangle problems using trigonometry.', keywords: 'soh cah toa sine cosine tangent right triangle trigonometry ratio' },
  'thermal directed number lab': { icon: '🌡️', description: 'Explore directed numbers with a temperature lab.', keywords: 'directed numbers positive negative integers temperature thermal opposites absolute value' },
  'transformation explorer': { icon: '🔄', description: 'Explore transformations in geometry.', keywords: 'transformation functions translation rotation reflect scale curve graph mapping shift' },
  'trig equation builder': { icon: '📐', description: 'Build and solve trigonometric equations.', keywords: 'trig equations sine cosine tangent identities solve radians degrees periodic' },
  'trig side master': { icon: '📐', description: 'Master trigonometric side-length problems.', keywords: 'trig sides sine rule cosine rule triangle lengths opposite adjacent hypotenuse' }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStars(rating) {
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.round(normalized);
  const emptyStars = 5 - fullStars;
  return `${'★'.repeat(fullStars)}${'☆'.repeat(emptyStars)}`;
}

function toTitle(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[-_]+/g, ' ').trim();
}

function getAppInfo(name) {
  const key = normalizeName(name);
  const title = toTitle(name);
  const meta = appMeta[key];

  if (meta) {
    return {
      title,
      icon: meta.icon,
      description: meta.description,
      keywords: meta.keywords,
      rating: meta.rating ?? 4.5,
      ratingCount: meta.ratingCount ?? 8
    };
  }

  const fallbackIcons = ['🧠', '📐', '🎯', '📊', '✨', '🔢', '🧪', '📈'];
  const index = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % fallbackIcons.length;
  const fallbackDescription = `Interactive ${title.toLowerCase()} activity.`;

  return {
    title,
    icon: fallbackIcons[index],
    description: fallbackDescription,
    keywords: `${title.toLowerCase()} ${fallbackDescription.toLowerCase()}`,
    rating: 4.5,
    ratingCount: 8
  };
}

if (!fs.existsSync(indexPath)) {
  console.error(`Homepage file not found at ${indexPath}`);
  process.exit(1);
}

if (!fs.existsSync(appRoot)) {
  console.error(`App folder not found at ${appRoot}`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

const appDirs = fs
  .readdirSync(appRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    if (excludedDirs.has(name) || name.startsWith('.')) {
      return false;
    }

    const fullPath = path.join(appRoot, name);
    const hasIndex = fs.existsSync(path.join(fullPath, 'index.html'));
    const hasHtml = fs.existsSync(path.join(fullPath, `${name}.html`));
    const hasJs = fs.existsSync(path.join(fullPath, `${name}.js`));

    return hasIndex || hasHtml || hasJs || fs.existsSync(path.join(fullPath, 'script.js')) || fs.existsSync(path.join(fullPath, 'style.css'));
  })
  .sort();

const items = appDirs
  .map((name) => {
    const app = getAppInfo(name);
    const safeTitle = escapeHtml(app.title);
    const safeDescription = escapeHtml(app.description);
    const safeKeywords = escapeHtml(app.keywords);
    const safeRating = escapeHtml(app.rating.toFixed(1));
    const safeRatingCount = escapeHtml(String(app.ratingCount));
    const encodedName = encodeURIComponent(name);

    return `            <li class="app-item">
                <a href="./app/${encodedName}/" class="app-link">
                    <div class="app-card-top">
                        <span class="app-icon" aria-hidden="true">${app.icon}</span>
                        <div class="app-text">
                            <span class="title">${safeTitle}</span>
                            <span class="app-description">${safeDescription}</span>
                            <div class="app-rating" aria-label="Rated ${safeRating} out of 5">
                                <span class="stars" aria-hidden="true">${renderStars(app.rating)}</span>
                                <span class="rating-text">${safeRating}/5</span>
                                <span class="rating-count">(${safeRatingCount} reviews)</span>
                            </div>
                            <span class="visually-hidden">${safeKeywords}</span>
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

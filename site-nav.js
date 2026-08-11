(() => {
    const styleId = 'mr-deng-global-nav-style';
    const navClass = 'mr-deng-global-nav';
    const navLinkClass = 'mr-deng-global-nav__link';
    const navLinkActiveClass = 'mr-deng-global-nav__link--active';
    const navBrandClass = 'mr-deng-global-nav__brand';
    const navBrandLinkClass = 'mr-deng-global-nav__brand-link';

    if (document.getElementById(styleId)) {
        return;
    }

    const path = (window.location.pathname || '').replace(/\\/g, '/');
    const segments = path.split('/').filter(Boolean);
    const appIndex = segments.lastIndexOf('app');
    const quizIndex = segments.lastIndexOf('quiz');
    const inApp = appIndex !== -1 && appIndex > quizIndex;
    const inQuiz = quizIndex !== -1 && quizIndex > appIndex;

    const prefixes = (() => {
        if (inApp) {
            const depth = Math.max(0, segments.length - appIndex - 2);
            const up = '../'.repeat(depth);
            return {
                home: `${up}../`,
                apps: up || './',
                quiz: `${up}../quiz/`,
                active: 'apps'
            };
        }

        if (inQuiz) {
            const depth = Math.max(0, segments.length - quizIndex - 2);
            const up = '../'.repeat(depth);
            return {
                home: `${up}../`,
                apps: `${up}../app/`,
                quiz: up || './',
                active: 'quiz'
            };
        }

        return {
            home: './',
            apps: './app/',
            quiz: './quiz/',
            active: 'home'
        };
    })();

    const existingNav = document.querySelector('.topbar-nav, .nav-links, nav[aria-label="Primary navigation"]');
    const links = [
        { href: prefixes.apps, label: 'Apps', key: 'apps' },
        { href: prefixes.quiz, label: 'Quiz', key: 'quiz' }
    ];

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .${navClass} {
            position: sticky;
            top: 0.75rem;
            z-index: 1000;
            width: min(1180px, calc(100% - 2rem));
            margin: 0.75rem auto 1rem;
            padding: 0.9rem 1rem;
            border: 1px solid rgba(255, 255, 255, 0.65);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(16px);
            box-shadow: 0 10px 30px rgba(16, 36, 58, 0.08);
        }

        .${navClass}__inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .${navClass}__brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-family: 'Roboto Slab', serif;
            font-size: 1.1rem;
            color: #002d4a;
            font-weight: 700;
            white-space: nowrap;
        }

        .${navBrandLinkClass} {
            color: inherit;
            text-decoration: none;
        }

        .${navBrandLinkClass}:hover {
            text-decoration: underline;
        }

        .${navClass}__brand-mark {
            width: 2.6rem;
            height: 2.6rem;
            border-radius: 14px;
            display: grid;
            place-items: center;
            font-family: 'Poppins', sans-serif;
            font-size: 1.25rem;
            background: linear-gradient(135deg, #005b94, #19a7ce);
            color: #ffffff;
            box-shadow: 0 10px 24px rgba(11, 110, 168, 0.22);
        }

        .${navLinkClass} {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.45rem 0.85rem;
            margin: 0.1rem;
            border-radius: 999px;
            text-decoration: none;
            font-family: 'Poppins', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: #334155;
            transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .${navLinkClass}:hover {
            transform: translateY(-1px);
            background: rgba(0, 91, 148, 0.08);
        }

        .${navLinkActiveClass} {
            background: linear-gradient(135deg, #005b94, #19a7ce);
            color: #ffffff !important;
        }

        .${navClass}__links {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            flex-wrap: wrap;
        }

        .${navClass}__links--fallback {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.3rem;
            flex-wrap: wrap;
        }

        .${navClass}__fallback-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        body > .${navClass}:first-child {
            margin-top: 0.5rem;
        }

        @media (max-width: 720px) {
            .${navClass} {
                width: min(100% - 0.75rem, 1180px);
                border-radius: 24px;
            }

            .${navClass}__inner {
                justify-content: center;
                text-align: center;
            }

            .${navClass}__brand {
                width: 100%;
                justify-content: center;
            }

            .${navClass}__links,
            .${navClass}__links--fallback {
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);

    const linkMarkup = links
        .map((link) => `<a href="${link.href}" class="${navLinkClass}${prefixes.active === link.key ? ` ${navLinkActiveClass}` : ''}">${link.label}</a>`)
        .join('');

    if (existingNav) {
        const existingHeader = existingNav.closest('header') || existingNav.parentElement;
        const brandTarget = existingHeader && existingHeader.querySelector('.topbar-title, .brand-copy h1, h1');
        if (brandTarget) {
            brandTarget.outerHTML = `<a href="${prefixes.home}" class="${navBrandLinkClass}">${brandTarget.textContent || 'Mr Deng Maths'}</a>`;
        }
        existingNav.innerHTML = linkMarkup;
        return;
    }

    const fallback = document.createElement('header');
    fallback.className = navClass;
    fallback.setAttribute('aria-label', 'Primary navigation');
    fallback.innerHTML = `
        <div class="${navClass}__inner">
            <div class="${navClass}__brand">
                <div class="${navClass}__brand-mark" aria-hidden="true">∑</div>
                <a href="${prefixes.home}" class="${navBrandLinkClass}">Mr Deng Maths</a>
            </div>
            <nav class="${navClass}__links--fallback" aria-label="Primary navigation">
                ${linkMarkup}
            </nav>
        </div>
    `;

    document.body.insertBefore(fallback, document.body.firstChild);
})();
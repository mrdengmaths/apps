document.addEventListener('DOMContentLoaded', () => {
    const RATING_STORAGE_KEY = 'mrDengMathsAppRatings';

    function getRatings() {
        const ratings = localStorage.getItem(RATING_STORAGE_KEY);
        return ratings ? JSON.parse(ratings) : {};
    }

    function saveRatings(ratings) {
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
    }

    function normalizeAppName(name) {
        return String(name || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^a-z0-9 \-]/g, '')
            .replace(/\s+/g, '-');
    }

    function getAppKey(appItem) {
        let appName = appItem.dataset.appName;
        if (!appName) {
            const titleText = appItem.querySelector('.title')?.textContent || appItem.querySelector('.app-link')?.getAttribute('href') || '';
            appName = normalizeAppName(titleText);
            if (appName) {
                appItem.dataset.appName = appName;
            }
        }
        return appName;
    }

    function ensureRatingUi(appItem) {
        let ratingContainer = appItem.querySelector('.app-rating');
        if (!ratingContainer) {
            ratingContainer = document.createElement('div');
            ratingContainer.className = 'app-rating';
            ratingContainer.setAttribute('aria-label', `Rate ${appItem.querySelector('.title')?.textContent || 'this app'} from one to five stars`);

            const starsContainer = document.createElement('div');
            starsContainer.className = 'stars';
            starsContainer.setAttribute('role', 'group');
            ratingContainer.appendChild(starsContainer);

            const ratingText = document.createElement('span');
            ratingText.className = 'rating-text';
            ratingContainer.appendChild(ratingText);

            const textContainer = appItem.querySelector('.app-text');
            if (textContainer) {
                textContainer.appendChild(ratingContainer);
            }
        }
        return ratingContainer;
    }

    function renderStar(i, rating) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.dataset.value = i;
        star.setAttribute('role', 'button');
        star.setAttribute('tabindex', '0');
        star.setAttribute('aria-label', `${i} star${i === 1 ? '' : 's'}`);
        star.textContent = i <= rating ? '★' : '☆';
        return star;
    }

    function updateStars(appName, rating) {
        const appItem = document.querySelector(`.app-item[data-app-name="${appName}"]`);
        if (!appItem) return;

        const ratingContainer = ensureRatingUi(appItem);
        const starsContainer = ratingContainer.querySelector('.stars');
        const ratingText = ratingContainer.querySelector('.rating-text');

        appItem.dataset.rating = String(rating || 0);
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = renderStar(i, rating);
            starsContainer.appendChild(star);
        }

        ratingText.textContent = rating > 0 ? `${rating}/5` : 'No rating';
    }

    function setRating(appName, rating) {
        const ratings = getRatings();
        ratings[appName] = rating;
        saveRatings(ratings);
        return ratings;
    }

    function handleStarClick(event) {
        const star = event.target.closest('.star');
        if (!star) return;

        event.preventDefault();
        event.stopPropagation();

        const appItem = star.closest('.app-item');
        if (!appItem) return;

        const appName = getAppKey(appItem);
        if (!appName) return;

        const rating = parseInt(star.dataset.value, 10);
        setRating(appName, rating);
        updateStars(appName, rating);
        document.dispatchEvent(new CustomEvent('ratingUpdated'));
    }

    function handleStarKeydown(event) {
        const star = event.target.closest('.star');
        if (!star) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        handleStarClick(event);
    }

    function initRatings() {
        const ratings = getRatings();
        const appItems = document.querySelectorAll('.app-item');

        appItems.forEach(appItem => {
            const appKey = getAppKey(appItem);
            if (!appKey) return;

            const savedRating = ratings[appKey] || 0;
            updateStars(appKey, savedRating);

            const ratingContainer = ensureRatingUi(appItem);
            ratingContainer.addEventListener('click', handleStarClick);
            ratingContainer.addEventListener('keydown', handleStarKeydown);
        });
    }

    initRatings();
});

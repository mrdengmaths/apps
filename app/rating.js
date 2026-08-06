document.addEventListener('DOMContentLoaded', () => {
    const RATING_STORAGE_KEY = 'mrDengMathsAppRatings';

    function getRatings() {
        const ratings = localStorage.getItem(RATING_STORAGE_KEY);
        return ratings ? JSON.parse(ratings) : {};
    }

    function saveRatings(ratings) {
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
    }

    function setRating(appName, rating) {
        const ratings = getRatings();
        ratings[appName] = rating;
        saveRatings(ratings);
        return ratings;
    }

    function renderStar(i, rating) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.dataset.value = i;
        star.textContent = i <= rating ? '★' : '☆';
        return star;
    }

    function updateStars(appName, rating) {
        const appItem = document.querySelector(`.app-item[data-app-name="${appName}"]`);
        if (!appItem) return;

        const starsContainer = appItem.querySelector('.stars');
        const ratingText = appItem.querySelector('.rating-text');
        
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = renderStar(i, rating);
            starsContainer.appendChild(star);
        }
        
        ratingText.textContent = rating > 0 ? `${rating}/5` : 'No rating';
    }

    function handleStarClick(event) {
        const star = event.target.closest('.star');
        if (!star) return;
        
        event.preventDefault();
        event.stopPropagation();

        const appItem = star.closest('.app-item');
        const appName = appItem.dataset.appName;
        const rating = parseInt(star.dataset.value, 10);

        setRating(appName, rating);
        updateStars(appName, rating);
    }

    function initRatings() {
        const ratings = getRatings();
        const appItems = document.querySelectorAll('.app-item');

        appItems.forEach(appItem => {
            const appName = appItem.dataset.appName;
            const savedRating = ratings[appName] || 0;
            updateStars(appName, savedRating);
            
            const starsContainer = appItem.querySelector('.stars');
            starsContainer.addEventListener('click', handleStarClick);
        });
    }

    initRatings();
});

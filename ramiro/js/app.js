document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    loadDailySpecials();
    initReviewsCarousel();
});

/* 1. Mobile Menu */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animate Links
        links.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `fadeInUp 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // Burger Animation
        hamburger.classList.toggle('toggle');
    });

    // Close menu when clicking a link
    navLinks.addEventListener('click', (e) => {
        if(e.target.tagName === 'A') {
            navLinks.classList.remove('active');
        }
    });
}

/* 2. Scroll Animations (Intersection Observer) */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Select elements to animate
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(el => {
        el.classList.add('aos-init'); // Base class for CSS
        observer.observe(el);
    });
}

/* 3. Daily Specials Loader */
async function loadDailySpecials() {
    const container = document.getElementById('specials-container');
    
    try {
        const response = await fetch('data/daily-specials.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const specials = await response.json();
        
        container.innerHTML = ''; // Clear loading text
        
        specials.forEach((special, index) => {
            const card = document.createElement('div');
            card.className = 'special-card';
            card.setAttribute('data-aos', 'fade-up');
            
            // Add delay for second item
            if (index > 0) card.style.transitionDelay = '0.2s';

            card.innerHTML = `
                <div class="special-img-container">
                    <img src="${special.image}" alt="${special.name}" class="special-image">
                </div>
                <div class="special-info">
                    <h3 class="special-name">${special.name}</h3>
                    <p>${special.description}</p>
                    <p class="price" style="font-weight: bold; font-size: 1.2rem; margin-top: 10px; color: var(--primary-color);">${special.price}</p>
                </div>
            `;
            
            // Responsive fix for the inline styles above would be better in CSS, 
            // but keeping it simple here or I can add a class.
            // Let's fix the CSS for .special-card in styles.css later or relies on flex-direction row.
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading specials:', error);
        container.innerHTML = '<p class="text-center">Consulte o menu completo abaixo.</p>';
    }
}

/* 4. Reviews Carousel */
function initReviewsCarousel() {
    const track = document.getElementById('reviews-track');
    const prevBtn = document.getElementById('prev-review');
    const nextBtn = document.getElementById('next-review');
    
    const reviews = [
        {
            platform: 'TheFork',
            text: "Uma experiência gastronómica incrível. O cabrito estava divinal e o serviço foi impecável.",
            author: "Ana Martins",
            rating: 5
        },
        {
            platform: 'TripAdvisor',
            text: "O melhor restaurante da região de Abrantes. Ambiente familiar e comida que conforta a alma.",
            author: "Carlos Silva",
            rating: 5
        },
        {
            platform: 'Google Reviews',
            text: "Adorámos os bifinhos com camarão. Espaço muito acolhedor, voltaremos certamente!",
            author: "Família Costa",
            rating: 5
        },
        {
            platform: 'Facebook',
            text: "Recomendo vivamente! A equipa é super simpática e os preços são justos para a qualidade.",
            author: "Miguel Oliveira",
            rating: 4
        }
    ];

    let currentIndex = 0;

    function renderReview(index) {
        const review = reviews[index];
        track.innerHTML = `
            <div class="review-card fade-in">
                <span class="review-platform-icon">${review.platform}</span>
                <div class="review-stars">${'★'.repeat(review.rating)}</div>
                <p class="review-text">"${review.text}"</p>
                <p class="review-author">- ${review.author}</p>
            </div>
        `;
    }

    // Initial Render
    renderReview(currentIndex);

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % reviews.length;
        renderReview(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
        renderReview(currentIndex);
    });

    // Auto rotate
    setInterval(() => {
        currentIndex = (currentIndex + 1) % reviews.length;
        renderReview(currentIndex);
    }, 6000);
}



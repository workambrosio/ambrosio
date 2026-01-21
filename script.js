document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initGlowEffect();
    initSecretTrigger();
});

function initSecretTrigger() {
    const trigger = document.getElementById('secret-trigger');
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent text selection or other defaults
            window.location.href = 'reaction.html';
        });
    }
}

/* =========================================
   GLOW EFFECT (SVG MASK TRACKING)
   ========================================= */
function initGlowEffect() {
    const svg = document.getElementById('text-svg');
    const spotlight = document.getElementById('glow-spotlight');
    const targetText = document.querySelector('.glow-text-stroke');

    if (!svg || !spotlight || !targetText) return;

    // State for optimization
    let mouseX = 0;
    let mouseY = 0;
    let isTracking = false;
    let cachedCTM = null;
    let pt = svg.createSVGPoint();

    // Cache CTM on resize and init
    const updateCTM = () => {
        cachedCTM = targetText.getScreenCTM();
    };
    
    // Initial cache
    updateCTM();
    window.addEventListener('resize', updateCTM);
    window.addEventListener('scroll', updateCTM);

    // Update loop using requestAnimationFrame
    function updateSpotlight() {
        if (!isTracking || !cachedCTM) {
            requestAnimationFrame(updateSpotlight);
            return;
        }

        // Set point coordinates
        pt.x = mouseX;
        pt.y = mouseY;

        // Transform screen coordinate to the target element's coordinate system
        // Using cached CTM avoids expensive reflows
        try {
            const svgP = pt.matrixTransform(cachedCTM.inverse());
            spotlight.setAttribute('cx', svgP.x);
            spotlight.setAttribute('cy', svgP.y);
        } catch (e) {
            // Fallback if CTM becomes invalid (e.g. element hidden)
            updateCTM();
        }

        requestAnimationFrame(updateSpotlight);
    }

    // Start the loop
    requestAnimationFrame(updateSpotlight);

    // Mouse tracking only updates coordinates
    document.addEventListener('mousemove', (evt) => {
        mouseX = evt.clientX;
        mouseY = evt.clientY;
        isTracking = true;
    });

    // Handle visibility (entering/leaving window)
    document.addEventListener('mouseleave', () => {
        spotlight.style.r = '0'; // Override CSS for hiding
    });

    document.addEventListener('mouseenter', () => {
        spotlight.style.r = ''; // Remove inline style to let CSS take over (60px)
    });
}

/* =========================================
   PARTICLES BACKGROUND
   ========================================= */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration
    const particleCount = 50; 
    
    // Pre-render sprite for performance
    const spriteSize = 20; // 2 * (max particle size + shadow blur) approx
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteSize;
    spriteCanvas.height = spriteSize;
    const spriteCtx = spriteCanvas.getContext('2d');

    // Draw the glowing particle once
    function renderSprite() {
        const center = spriteSize / 2;
        const radius = 2; // Max particle size
        
        spriteCtx.clearRect(0, 0, spriteSize, spriteSize);
        spriteCtx.beginPath();
        spriteCtx.arc(center, center, radius, 0, Math.PI * 2);
        spriteCtx.shadowBlur = 8; // Reduced slightly for pre-rendering context
        spriteCtx.shadowColor = 'white';
        spriteCtx.fillStyle = '#ffffff';
        spriteCtx.fill();
        spriteCtx.shadowBlur = 0;
    }
    renderSprite();

    // Resize handler
    function resize() {
        const oldWidth = width;
        const oldHeight = height;

        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Reposition particles proportionally
        if (particles.length > 0 && oldWidth && oldHeight) {
            particles.forEach(p => {
                p.x = p.x * (width / oldWidth);
                p.y = p.y * (height / oldHeight);
            });
        }
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // Slow velocity
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 1.5 + 0.5; // Size 0.5-2px
            // Removed unused alpha property
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            // Draw the pre-rendered sprite centered at particle position
            // We scale the image slightly based on particle "size" for variation
            // though using a single sprite is faster, small scale variations are cheap with drawImage
            const scale = this.size / 2; // Normalize around 1
            const drawSize = spriteSize * scale;
            const offset = drawSize / 2;
            
            ctx.drawImage(spriteCanvas, this.x - offset, this.y - offset, drawSize, drawSize);
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

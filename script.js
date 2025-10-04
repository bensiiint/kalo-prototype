// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach(el => {
    observer.observe(el);
});

// FAQ functionality
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const isActive = answer.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-answer').forEach(faq => {
        faq.classList.remove('active');
    });
    
    // Open clicked FAQ if it wasn't active
    if (!isActive) {
        answer.classList.add('active');
    }
}

// Newsletter subscription
function subscribeNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input').value;
    alert(`🏝️ Thank you for subscribing! ${email} will receive exclusive Kalo Villa updates.`);
    event.target.reset();
}

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
}

// Close menu when clicking on nav links
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Close the menu
        toggleMobileMenu();
        
        // If it's a hash link on the same page, handle smooth scroll
        if (link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                setTimeout(() => {
                    const headerOffset = 100;
                    const elementPosition = target.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 100;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});



// Prevent zoom on double tap for better mobile UX
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle viewport height changes on mobile (especially for iOS Safari)
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
});

// Improve scroll performance on mobile
let ticking = false;
let lastScrollY = window.scrollY;

function updateHeaderOnScroll() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(updateHeaderOnScroll);
        ticking = true;
    }
});

// Add touch feedback for better mobile UX
document.querySelectorAll('.cta-btn, .book-now-btn, .plan-trip-btn, .contact-method, .experience-card').forEach(element => {
    element.addEventListener('touchstart', function() {
        this.style.opacity = '0.7';
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
        this.style.opacity = '';
    }, { passive: true });
    
    element.addEventListener('touchcancel', function() {
        this.style.opacity = '';
    }, { passive: true });
});

// Lazy load images when they come into view
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Close mobile menu on window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 900 && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }, 250);
});

// Add active class to current page nav link
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================

let currentSlide = 0;
let isAnimating = false;

// Move carousel to next or previous slide
function moveCarousel(direction) {
    // Prevent rapid consecutive clicks
    if (isAnimating) return;
    
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!track || slides.length === 0) return;
    
    isAnimating = true;
    
    // Update current slide
    currentSlide += direction;
    
    // Loop around
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    // Update carousel position
    updateCarousel(track, dots);
    
    // Allow next animation after transition completes
    setTimeout(() => {
        isAnimating = false;
    }, 500); // Match the CSS transition duration
}

// Go to specific slide
function goToSlide(index) {
    // Prevent rapid consecutive clicks
    if (isAnimating) return;
    
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!track) return;
    
    isAnimating = true;
    currentSlide = index;
    updateCarousel(track, dots);
    
    // Allow next animation after transition completes
    setTimeout(() => {
        isAnimating = false;
    }, 500);
}

// Update carousel position and active dot
function updateCarousel(track, dots) {
    const slides = document.querySelectorAll('.carousel-slide');
    
    // Remove all classes from all slides
    slides.forEach((slide) => {
        slide.classList.remove('active', 'next', 'next-next', 'prev');
    });
    
    // Add classes based on position relative to current slide
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
        } else if (index === (currentSlide + 1) % slides.length) {
            slide.classList.add('next');
        } else if (index === (currentSlide + 2) % slides.length) {
            slide.classList.add('next-next');
        } else {
            slide.classList.add('prev');
        }
    });
    
    // Update dots
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50; // Minimum distance for swipe

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0) {
            // Swiped left - go to next
            moveCarousel(1);
        } else {
            // Swiped right - go to previous
            moveCarousel(-1);
        }
    }
}

// Mouse drag support for desktop
let mouseStartX = 0;
let mouseEndX = 0;
let isDragging = false;

function handleMouseDown(e) {
    isDragging = true;
    mouseStartX = e.clientX;
    mouseEndX = e.clientX;
}

function handleMouseMove(e) {
    if (!isDragging) return;
    mouseEndX = e.clientX;
}

function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    
    const swipeDistance = mouseStartX - mouseEndX;
    
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0) {
            // Dragged left - go to next
            moveCarousel(1);
        } else {
            // Dragged right - go to previous
            moveCarousel(-1);
        }
    }
}

function handleMouseLeave() {
    isDragging = false;
}

// ============================================
// INSTAGRAM CAROUSEL FUNCTIONALITY
// ============================================

let currentSlideInstagram = 0;
let isAnimatingInstagram = false;

// Move Instagram carousel
function moveCarouselInstagram(direction) {
    if (isAnimatingInstagram) return;
    
    const carousel = document.querySelector('.instagram-carousel');
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dots .dot');
    
    if (!track || slides.length === 0) return;
    
    isAnimatingInstagram = true;
    currentSlideInstagram += direction;
    
    if (currentSlideInstagram < 0) {
        currentSlideInstagram = slides.length - 1;
    } else if (currentSlideInstagram >= slides.length) {
        currentSlideInstagram = 0;
    }
    
    updateCarouselInstagram(track, dots, slides);
    
    setTimeout(() => {
        isAnimatingInstagram = false;
    }, 500);
}

// Go to specific slide in Instagram carousel
function goToSlideInstagram(index) {
    if (isAnimatingInstagram) return;
    
    const carousel = document.querySelector('.instagram-carousel');
    const track = carousel.querySelector('.carousel-track');
    const dots = carousel.querySelectorAll('.carousel-dots .dot');
    const slides = carousel.querySelectorAll('.carousel-slide');
    
    if (!track) return;
    
    isAnimatingInstagram = true;
    currentSlideInstagram = index;
    updateCarouselInstagram(track, dots, slides);
    
    setTimeout(() => {
        isAnimatingInstagram = false;
    }, 500);
}

// Update Instagram carousel position
function updateCarouselInstagram(track, dots, slides) {
    slides.forEach((slide) => {
        slide.classList.remove('active', 'next', 'next-next', 'prev');
    });
    
    slides.forEach((slide, index) => {
        if (index === currentSlideInstagram) {
            slide.classList.add('active');
        } else if (index === (currentSlideInstagram + 1) % slides.length) {
            slide.classList.add('next');
        } else if (index === (currentSlideInstagram + 2) % slides.length) {
            slide.classList.add('next-next');
        } else {
            slide.classList.add('prev');
        }
    });
    
    dots.forEach((dot, index) => {
        if (index === currentSlideInstagram) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Instagram carousel touch/mouse handlers
let touchStartXInstagram = 0;
let touchEndXInstagram = 0;
let mouseStartXInstagram = 0;
let mouseEndXInstagram = 0;
let isDraggingInstagram = false;

function handleTouchStartInstagram(e) {
    touchStartXInstagram = e.touches[0].clientX;
}

function handleTouchMoveInstagram(e) {
    touchEndXInstagram = e.touches[0].clientX;
}

function handleTouchEndInstagram() {
    const swipeDistance = touchStartXInstagram - touchEndXInstagram;
    
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0) {
            moveCarouselInstagram(1);
        } else {
            moveCarouselInstagram(-1);
        }
    }
}

function handleMouseDownInstagram(e) {
    isDraggingInstagram = true;
    mouseStartXInstagram = e.clientX;
    mouseEndXInstagram = e.clientX;
}

function handleMouseMoveInstagram(e) {
    if (!isDraggingInstagram) return;
    mouseEndXInstagram = e.clientX;
}

function handleMouseUpInstagram() {
    if (!isDraggingInstagram) return;
    isDraggingInstagram = false;
    
    const swipeDistance = mouseStartXInstagram - mouseEndXInstagram;
    
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0) {
            moveCarouselInstagram(1);
        } else {
            moveCarouselInstagram(-1);
        }
    }
}

function handleMouseLeaveInstagram() {
    isDraggingInstagram = false;
}

// Initialize Instagram carousel
function initializeInstagramCarousel() {
    const carousel = document.querySelector('.instagram-carousel');
    const track = carousel.querySelector('.carousel-track');
    const dots = carousel.querySelectorAll('.carousel-dots .dot');
    const slides = carousel.querySelectorAll('.carousel-slide');
    
    updateCarouselInstagram(track, dots, slides);
    
    // Touch events
    carousel.addEventListener('touchstart', handleTouchStartInstagram, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMoveInstagram, { passive: true });
    carousel.addEventListener('touchend', handleTouchEndInstagram);
    
    // Mouse events
    carousel.addEventListener('mousedown', handleMouseDownInstagram);
    carousel.addEventListener('mousemove', handleMouseMoveInstagram);
    carousel.addEventListener('mouseup', handleMouseUpInstagram);
    carousel.addEventListener('mouseleave', handleMouseLeaveInstagram);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.image-carousel');
    
    if (carousel) {
        // Initialize carousel state
        const track = document.querySelector('.carousel-track');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        updateCarousel(track, dots);
        
        // Add touch event listeners for mobile swipe support
        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd);
        
        // Add mouse event listeners for desktop drag support
        carousel.addEventListener('mousedown', handleMouseDown);
        carousel.addEventListener('mousemove', handleMouseMove);
        carousel.addEventListener('mouseup', handleMouseUp);
        carousel.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Initialize Instagram carousel if it exists
    const instagramCarousel = document.querySelector('.instagram-carousel');
    if (instagramCarousel) {
        initializeInstagramCarousel();
    }
});
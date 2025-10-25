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
// CAROUSEL FUNCTIONALITY WITH REALISTIC DRAG
// ============================================

let currentSlide = 0;
let isAnimating = false;
let isDragging = false;
let startX = 0;
let currentX = 0;
let dragOffset = 0;

// Go to specific slide
function goToSlide(index) {
    if (isAnimating) return;
    
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!track) return;
    
    isAnimating = true;
    currentSlide = index;
    updateCarousel(track, dots);
    
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

// Apply drag transform to create smooth following effect
function applyDragTransform(offset) {
    const slides = document.querySelectorAll('.carousel-slide');
    const carousel = document.querySelector('.image-carousel');
    const width = carousel.offsetWidth;
    
    // Calculate percentage for smooth dragging
    const percentage = (offset / width) * 100;
    
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            // Only move the active slide
            slide.style.transform = `translateX(${percentage}%) scale(1)`;
            slide.style.opacity = 1 - (Math.abs(offset) / width) * 0.3; // Fade slightly as you drag
        } else if (slide.classList.contains('next')) {
            // Keep next slides in their original position
            slide.style.transform = 'translateX(8%) scale(0.95)';
            slide.style.opacity = 0.7;
        } else if (slide.classList.contains('next-next')) {
            slide.style.transform = 'translateX(12%) scale(0.9)';
            slide.style.opacity = 0.4;
        } else if (slide.classList.contains('prev')) {
            slide.style.transform = 'translateX(-100%) scale(0.95)';
            slide.style.opacity = 0;
        }
    });
}

// Reset transforms with smooth transition
function resetDragTransform() {
    const slides = document.querySelectorAll('.carousel-slide');
    
    slides.forEach((slide) => {
        slide.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        if (slide.classList.contains('active')) {
            slide.style.transform = 'translateX(0) scale(1)';
            slide.style.opacity = '1';
        } else if (slide.classList.contains('next')) {
            slide.style.transform = 'translateX(8%) scale(0.95)';
            slide.style.opacity = '0.7';
        } else if (slide.classList.contains('next-next')) {
            slide.style.transform = 'translateX(12%) scale(0.9)';
            slide.style.opacity = '0.4';
        } else if (slide.classList.contains('prev')) {
            slide.style.transform = 'translateX(-100%) scale(0.95)';
            slide.style.opacity = '0';
        }
    });
    
    // Remove inline transition after animation
    setTimeout(() => {
        slides.forEach(slide => {
            slide.style.transition = '';
        });
    }, 500);
}

// Handle start of drag (touch or mouse)
function handleDragStart(e) {
    if (isAnimating) return;
    
    isDragging = true;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    currentX = startX;
    dragOffset = 0;
    
    const carousel = document.querySelector('.image-carousel');
    carousel.style.cursor = 'grabbing';
    
    // Disable transitions during drag
    const slides = document.querySelectorAll('.carousel-slide');
    slides.forEach(slide => {
        slide.style.transition = 'none';
    });
}

// Handle drag movement
function handleDragMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    dragOffset = currentX - startX;
    
    // Add resistance at the edges
    const carousel = document.querySelector('.image-carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const maxOffset = carousel.offsetWidth * 0.3; // 30% max drag
    
    // Apply resistance curve
    if (Math.abs(dragOffset) > maxOffset) {
        const excess = Math.abs(dragOffset) - maxOffset;
        const resistance = maxOffset + (excess * 0.3); // 30% of excess movement
        dragOffset = dragOffset > 0 ? resistance : -resistance;
    }
    
    applyDragTransform(dragOffset);
}

// Handle end of drag
function handleDragEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    
    const carousel = document.querySelector('.image-carousel');
    carousel.style.cursor = 'grab';
    
    const SWIPE_THRESHOLD = 50;
    const slides = document.querySelectorAll('.carousel-slide');
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    // Determine if swipe was strong enough
    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        isAnimating = true;
        
        if (dragOffset < 0) {
            // Swiped left - go to next
            currentSlide = (currentSlide + 1) % slides.length;
        } else {
            // Swiped right - go to previous
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        }
        
        updateCarousel(track, dots);
        resetDragTransform();
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    } else {
        // Snap back to original position
        resetDragTransform();
    }
    
    dragOffset = 0;
}

// Handle drag cancel
function handleDragCancel() {
    if (!isDragging) return;
    
    isDragging = false;
    const carousel = document.querySelector('.image-carousel');
    carousel.style.cursor = 'grab';
    resetDragTransform();
    dragOffset = 0;
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
        
        // Add touch event listeners for mobile
        carousel.addEventListener('touchstart', handleDragStart, { passive: true });
        carousel.addEventListener('touchmove', handleDragMove, { passive: false });
        carousel.addEventListener('touchend', handleDragEnd);
        carousel.addEventListener('touchcancel', handleDragCancel);
        
        // Add mouse event listeners for desktop
        carousel.addEventListener('mousedown', handleDragStart);
        carousel.addEventListener('mousemove', handleDragMove);
        carousel.addEventListener('mouseup', handleDragEnd);
        carousel.addEventListener('mouseleave', handleDragCancel);
    }
    
    // Initialize Instagram carousel if it exists
    const instagramCarousel = document.querySelector('.instagram-carousel');
    if (instagramCarousel) {
        initializeInstagramCarousel();
    }
});
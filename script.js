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
document.addEventListener('DOMContentLoaded', function() {
    // Set creation date
    const now = new Date();
    const creationDateElement = document.getElementById('creation-date');
    if (creationDateElement) {
        creationDateElement.textContent = now.toLocaleString();
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile navigation toggle
    const createMobileNav = () => {
        const header = document.querySelector('header');
        if (!header) return;

        const nav = header.querySelector('nav');
        if (!nav) return;

        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.classList.add('mobile-menu-toggle');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        header.querySelector('.logo').appendChild(mobileMenuBtn);

        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('mobile-nav-active');
            mobileMenuBtn.innerHTML = nav.classList.contains('mobile-nav-active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    };

    // Only create mobile nav for smaller screens
    if (window.innerWidth <= 768) {
        createMobileNav();
    }

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .project-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(element => {
            observer.observe(element);
        });
    };

    // Initialize animations if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        animateOnScroll();
    }

    // Theme toggle (if we want to add a dark/light mode)
    const setupThemeToggle = () => {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.classList.add('theme-toggle');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.setAttribute('title', 'Toggle dark/light mode');
        
        footer.querySelector('.footer-bottom').appendChild(themeToggleBtn);

        // Check for saved theme preference or use preference from OS
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
            document.body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    };

    // Setup theme toggle
    setupThemeToggle();
});
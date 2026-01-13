// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections for animation
    const animatedElements = document.querySelectorAll('.education-item, .research-card, .timeline-item, .teaching-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Dynamic content loading
    const navLinks = document.querySelectorAll('.nav-link');
    const dynamicContent = document.getElementById('dynamic-content');

    navLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default navigation

            const page = link.getAttribute('data-page');
            if (page) {
                try {
                    // Fetch the corresponding HTML file
                    const response = await fetch(`${page}.html`);
                    const html = await response.text();

                    // Extract the content inside <main> and replace the dynamic content
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelector('#dynamic-content');

                    if (newContent) {
                        dynamicContent.innerHTML = newContent.innerHTML;

                        // Update the active class for the navigation links
                        navLinks.forEach(nav => nav.classList.remove('active'));
                        link.classList.add('active');

                        // Update the browser history
                        history.pushState({ page }, '', `${page}.html`);
                    }
                } catch (error) {
                    console.error('Error loading page:', error);
                }
            }
        });
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', async (event) => {
        const page = event.state?.page || 'home';
        try {
            const response = await fetch(`${page}.html`);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('#dynamic-content');

            if (newContent) {
                dynamicContent.innerHTML = newContent.innerHTML;
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    });
});

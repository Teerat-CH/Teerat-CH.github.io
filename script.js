// Wake up the assistant API when page loads
function wakeUpAssistant() {
    fetch('https://assistant-2ip0.onrender.com/wakeup', {
        method: 'GET',
    }).catch(error => {
        console.log('Assistant wakeup call (expected on cold start):', error);
    });
}

// Call wakeup immediately when script loads
wakeUpAssistant();

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'light';
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

    // Chatbot Widget
    class ChatBot {
        constructor() {
            this.isOpen = false;
            this.messages = [];
            this.sessionId = this.generateSessionId();
            this.widget = document.querySelector('.chatbot-widget');
            this.container = document.querySelector('.chatbot-container');
            this.messagesContainer = document.querySelector('.chatbot-messages');
            this.input = document.querySelector('.chatbot-input');
            this.sendBtn = document.querySelector('.chatbot-send');
            this.toggleBtn = document.querySelector('.chatbot-toggle');
            
            if (this.widget) {
                this.init();
            }
        }
        
        generateSessionId() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        init() {
            // Toggle chatbot
            this.toggleBtn.addEventListener('click', () => this.toggle());
            
            // Send message on button click
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            
            // Send message on Enter key
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Add welcome message
            this.addBotMessage("Hi there! 👋 I'm Teerat's virtual assistant. How can I help you today? Feel free to ask about his experience, research, projects, or anything else!");
        }
        
        toggle() {
            this.isOpen = !this.isOpen;
            this.widget.classList.toggle('open', this.isOpen);
            
            if (this.isOpen) {
                setTimeout(() => this.input.focus(), 300);
            }
        }
        
        async sendMessage() {
            const message = this.input.value.trim();
            if (!message) return;
            
            // Add user message
            this.addUserMessage(message);
            this.input.value = '';
            
            // Disable input while waiting for response
            this.input.disabled = true;
            this.sendBtn.disabled = true;
            
            // Show typing indicator
            this.showTyping();
            
            try {
                // Call the API
                const url = new URL('https://assistant-2ip0.onrender.com/query');
                url.searchParams.set('query', message);
                url.searchParams.set('session_id', this.sessionId);

                const response = await fetch(url.toString(), {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                console.log('API Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', errorText);
                    throw new Error('API request failed');
                }
                
                const data = await response.json();
                console.log('API Response data:', data);
                this.hideTyping();
                this.addBotMessage(data.response || data.answer || data.message || data.reply || "I received your message!");
            } catch (error) {
                console.error('Chatbot API error:', error);
                this.hideTyping();
                this.addBotMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment or reach out via email at tchanromyen@umass.edu!");
            } finally {
                // Re-enable input
                this.input.disabled = false;
                this.sendBtn.disabled = false;
                this.input.focus();
            }
        }
        
        addUserMessage(text) {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message user';
            messageEl.textContent = text;
            this.messagesContainer.appendChild(messageEl);
            this.scrollToBottom();
        }
        
        addBotMessage(text) {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message bot';
            messageEl.textContent = text;
            this.messagesContainer.appendChild(messageEl);
            this.scrollToBottom();
        }
        
        showTyping() {
            const typingEl = document.createElement('div');
            typingEl.className = 'chat-message bot typing';
            typingEl.id = 'typing-indicator';
            typingEl.innerHTML = '<span></span><span></span><span></span>';
            this.messagesContainer.appendChild(typingEl);
            this.scrollToBottom();
        }
        
        hideTyping() {
            const typingEl = document.getElementById('typing-indicator');
            if (typingEl) {
                typingEl.remove();
            }
        }
        
        scrollToBottom() {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    // Initialize chatbot
    new ChatBot();
});

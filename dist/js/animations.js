// Animations.js - Advanced animation effects

// GSAP-like animation system (lightweight custom implementation)
class AnimationEngine {
    constructor() {
        this.animations = [];
        this.running = false;
        this.init();
    }
    
    init() {
        // Start animation loop
        this.animate();
    }
    
    add(element, properties, options = {}) {
        const animation = {
            element,
            properties,
            startValues: {},
            endValues: properties,
            duration: options.duration || 1000,
            delay: options.delay || 0,
            ease: options.ease || this.easeOutCubic,
            startTime: null,
            onComplete: options.onComplete
        };
        
        // Get initial values
        for (let prop in properties) {
            if (prop === 'opacity') {
                animation.startValues[prop] = parseFloat(window.getComputedStyle(element)[prop]) || 0;
            } else if (prop === 'transform') {
                animation.startValues[prop] = this.parseTransform(element);
            }
        }
        
        this.animations.push(animation);
        
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }
    
    animate() {
        const now = Date.now();
        let hasActiveAnimations = false;
        
        this.animations = this.animations.filter(anim => {
            if (!anim.startTime && now >= anim.delay) {
                anim.startTime = now;
            }
            
            if (!anim.startTime) {
                hasActiveAnimations = true;
                return true;
            }
            
            const elapsed = now - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            const easedProgress = anim.ease(progress);
            
            // Apply properties
            for (let prop in anim.properties) {
                if (prop === 'opacity') {
                    const value = anim.startValues[prop] + (anim.endValues[prop] - anim.startValues[prop]) * easedProgress;
                    anim.element.style.opacity = value;
                } else if (prop === 'transform') {
                    const transforms = [];
                    for (let transform in anim.endValues[prop]) {
                        const startVal = anim.startValues[prop][transform] || 0;
                        const endVal = anim.endValues[prop][transform];
                        const value = startVal + (endVal - startVal) * easedProgress;
                        
                        if (transform === 'scale') {
                            transforms.push(`scale(${value})`);
                        } else if (transform === 'translateY') {
                            transforms.push(`translateY(${value}px)`);
                        } else if (transform === 'translateX') {
                            transforms.push(`translateX(${value}px)`);
                        } else if (transform === 'rotate') {
                            transforms.push(`rotate(${value}deg)`);
                        }
                    }
                    anim.element.style.transform = transforms.join(' ');
                }
            }
            
            if (progress >= 1) {
                if (anim.onComplete) anim.onComplete();
                return false;
            }
            
            hasActiveAnimations = true;
            return true;
        });
        
        if (hasActiveAnimations) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.running = false;
        }
    }
    
    parseTransform(element) {
        const style = window.getComputedStyle(element);
        const transform = style.transform || 'none';
        
        if (transform === 'none') {
            return { translateX: 0, translateY: 0, scale: 1, rotate: 0 };
        }
        
        // Simple parsing for common transforms
        const values = {};
        const translateMatch = transform.match(/translate\((.+?)px,\s*(.+?)px\)/);
        if (translateMatch) {
            values.translateX = parseFloat(translateMatch[1]);
            values.translateY = parseFloat(translateMatch[2]);
        }
        
        return values;
    }
    
    // Easing functions
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
}

// Global animation engine
const animEngine = new AnimationEngine();

// Scroll-triggered animations
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.observeElements();
        this.parallaxElements();
        this.revealOnScroll();
    }
    
    observeElements() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.dataset.aosDelay || 0;
                    
                    setTimeout(() => {
                        el.classList.add('aos-animate');
                        
                        // Trigger custom animations based on type
                        if (el.dataset.aos === 'fade-up') {
                            animEngine.add(el, {
                                opacity: 1,
                                transform: { translateY: 0 }
                            }, {
                                duration: 800,
                                ease: animEngine.easeOutCubic
                            });
                        }
                    }, delay);
                    
                    observer.unobserve(el);
                }
            });
        }, options);
        
        // Add initial styles to elements
        document.querySelectorAll('[data-aos]').forEach(el => {
            if (el.dataset.aos === 'fade-up') {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
            }
            observer.observe(el);
        });
    }
    
    parallaxElements() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        
        window.addEventListener('scroll', () => {
            reveals.forEach(el => {
                const windowHeight = window.innerHeight;
                const elementTop = el.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < windowHeight - elementVisible) {
                    el.classList.add('active');
                }
            });
        });
    }
}

// Text animations
class TextAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.typewriterEffect();
        this.splitTextAnimation();
    }
    
    typewriterEffect() {
        const elements = document.querySelectorAll('[data-typewriter]');
        
        elements.forEach(el => {
            const text = el.textContent;
            const speed = el.dataset.typewriterSpeed || 50;
            el.textContent = '';
            el.style.visibility = 'visible';
            
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            };
            
            // Start typing when element is in view
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    type();
                    observer.disconnect();
                }
            });
            
            observer.observe(el);
        });
    }
    
    splitTextAnimation() {
        const elements = document.querySelectorAll('[data-split-text]');
        
        elements.forEach(el => {
            const text = el.textContent;
            el.innerHTML = '';
            
            // Split into spans
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                el.appendChild(span);
                
                // Animate on view
                setTimeout(() => {
                    animEngine.add(span, {
                        opacity: 1,
                        transform: { translateY: 0 }
                    }, {
                        duration: 500,
                        delay: i * 30
                    });
                }, 100);
            });
        });
    }
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
    new TextAnimations();
});
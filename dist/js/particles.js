// Particles.js - Animated particle background

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.init();
        this.animate();
        
        // Event listeners
        window.addEventListener('resize', () => this.init());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Create particles
        this.particles = [];
        const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas, this.ctx, this.mouse));
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Connect particles
        this.connectParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    connectParticles() {
        const maxDistance = 120;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = 1 - distance / maxDistance;
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.5})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas, ctx, mouse) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = mouse;
        
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
    }
    
    update() {
        // Calculate distance from mouse
        if (this.mouse.x && this.mouse.y) {
            const dx = this.mouse.x - this.x;
            const dy = this.mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = this.mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * this.density;
                const directionY = forceDirectionY * force * this.density;
                
                this.x -= directionX;
                this.y -= directionY;
            }
        }
        
        // Return to base position
        if (this.x !== this.baseX) {
            const dx = this.x - this.baseX;
            this.x -= dx / 20;
        }
        if (this.y !== this.baseY) {
            const dy = this.y - this.baseY;
            this.y -= dy / 20;
        }
        
        // Regular movement
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > this.canvas.width) {
            this.speedX = -this.speedX;
        }
        if (this.y < 0 || this.y > this.canvas.height) {
            this.speedY = -this.speedY;
        }
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// Initialize particle system
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem('particleCanvas');
});
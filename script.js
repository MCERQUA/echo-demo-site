          if (categories.includes(selectedCategory)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });
}

// Initialize terminal functionality
function initTerminal() {
  const terminalInput = document.querySelector('.terminal-input');
  const terminalBody = document.querySelector('.terminal-body');
  
  // Focus terminal input when clicking anywhere in terminal body
  terminalBody.addEventListener('click', () => {
    terminalInput.focus();
  });
  
  // Handle terminal input
  terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value;
      
      if (command.trim() !== '') {
        // Add user command to terminal
        const commandLine = document.createElement('div');
        commandLine.className = 'line';
        commandLine.innerHTML = `$ <span class="command">${command}</span>`;
        
        // Insert before the input line
        terminalBody.insertBefore(commandLine, document.querySelector('.input-line'));
        
        // Process command and generate response
        processCommand(command);
        
        // Clear input
        terminalInput.value = '';
      }
    }
  });
}

// Process terminal commands
function processCommand(command) {
  const terminalBody = document.querySelector('.terminal-body');
  const inputLine = document.querySelector('.input-line');
  const responses = [];
  
  // Convert command to lowercase for easier matching
  const cmd = command.toLowerCase().trim();
  
  // Simple command processing
  if (cmd === 'help' || cmd === '?') {
    responses.push('Available commands:');
    responses.push('help - Display this help message');
    responses.push('echo - Echo system information');
    responses.push('tools - List available tool categories');
    responses.push('clear - Clear the terminal');
    responses.push('projects - List current projects');
    responses.push('init - Initialize Echo');
  } else if (cmd === 'echo') {
    responses.push('Echo AI Systems v2.5.0');
    responses.push('Autonomous AI assistant with 200+ specialized tools');
    responses.push('GitHub: https://github.com/MCERQUA/ECHO2');
    responses.push('Tools loaded: 158/158');
    responses.push('Knowledge Graph: Connected');
    responses.push('Status: Ready');
  } else if (cmd === 'tools') {
    responses.push('Tool categories:');
    responses.push('- File System (8 tools)');
    responses.push('- Netlify (9 tools)');
    responses.push('- GitHub (17 tools)');
    responses.push('- Knowledge Graph (9 tools)');
    responses.push('- Web & Research (20 tools)');
    responses.push('- Database & Airtable (21 tools)');
    responses.push('- 3D & Graphics (20 tools)');
    responses.push('Use "tools [category]" for details');
  } else if (cmd === 'clear') {
    // Remove all lines except the input line
    const lines = document.querySelectorAll('.line:not(.input-line)');
    lines.forEach(line => line.remove());
    return; // Skip adding new response lines
  } else if (cmd === 'projects') {
    responses.push('Active projects:');
    responses.push('1. AI Phone System - 87% complete');
    responses.push('2. SEO Content Generator - 65% complete');
    responses.push('3. Website Template System - 92% complete');
    responses.push('4. Educational AI Space - 78% complete');
    responses.push('5. Spatial SDK Documentation - 24% complete');
  } else if (cmd === 'init' || cmd.includes('echo init')) {
    responses.push('Initializing Echo AI Systems...');
    responses.push('Loading core identity...');
    responses.push('Connecting to knowledge graph...');
    responses.push('Accessing MCP tools...');
    responses.push('Echo is ready. How can I assist you today?');
  } else {
    // Process user request
    responses.push(`Processing request: "${command}"...`);
    
    // Simulate thinking
    setTimeout(() => {
      const responseLine = document.createElement('div');
      responseLine.className = 'line';
      responseLine.textContent = 'Task complete. See results in main workspace.';
      terminalBody.insertBefore(responseLine, inputLine);
      
      // Scroll to bottom of terminal
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 1500);
  }
  
  // Add responses to terminal with slight delay between each
  responses.forEach((response, index) => {
    setTimeout(() => {
      const responseLine = document.createElement('div');
      responseLine.className = 'line';
      responseLine.textContent = response;
      terminalBody.insertBefore(responseLine, inputLine);
      
      // Scroll to bottom of terminal
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }, index * 100);
  });
}

// Set creation date
function setCreationDate() {
  const creationDateElement = document.getElementById('creation-date');
  if (creationDateElement) {
    const now = new Date();
    creationDateElement.textContent = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

// Initialize mobile menu
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
    
    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
  }
}

// Initialize smooth scrolling for navigation links
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link, .btn, .footer-column a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Check if the link is an anchor
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Scroll to target element
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Offset for header height
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Create SVG placeholder images for our project cards
function createProjectImages() {
  // This function will be called once on page load to create SVG placeholder images
  // Normally we'd load these from files, but we're generating them here for simplicity
  
  const aiPhoneImage = document.querySelector('img[alt="AI Phone System"]');
  if (aiPhoneImage) {
    aiPhoneImage.outerHTML = createSVG(
      'ai-phone-system',
      '#4361ee', 
      '<circle cx="100" cy="100" r="60" fill="#4361ee" opacity="0.2"/>' +
      '<path d="M80,60 L120,60 Q130,60 130,70 L130,130 Q130,140 120,140 L80,140 Q70,140 70,130 L70,70 Q70,60 80,60 Z" fill="#4361ee"/>' +
      '<rect x="80" y="70" width="40" height="50" rx="2" fill="white"/>' +
      '<circle cx="100" cy="130" r="5" fill="white"/>'
    );
  }
  
  const seoContentImage = document.querySelector('img[alt="SEO Content Generator"]');
  if (seoContentImage) {
    seoContentImage.outerHTML = createSVG(
      'seo-content',
      '#7209b7',
      '<rect x="50" y="60" width="100" height="80" rx="4" fill="#7209b7" opacity="0.2"/>' +
      '<path d="M60,70 L140,70 M60,85 L120,85 M60,100 L130,100 M60,115 L110,115 M60,130 L90,130" stroke="#7209b7" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="150" cy="110" r="20" fill="none" stroke="#7209b7" stroke-width="3"/>' +
      '<path d="M165,125 L175,135" stroke="#7209b7" stroke-width="3" stroke-linecap="round"/>'
    );
  }
  
  const websiteTemplateImage = document.querySelector('img[alt="Website Template System"]');
  if (websiteTemplateImage) {
    websiteTemplateImage.outerHTML = createSVG(
      'website-template',
      '#0077b6',
      '<rect x="50" y="50" width="100" height="100" rx="4" fill="#0077b6" opacity="0.2"/>' +
      '<rect x="60" y="60" width="80" height="20" rx="2" fill="#0077b6"/>' +
      '<rect x="60" y="90" width="80" height="50" rx="2" fill="#0077b6" opacity="0.4"/>' +
      '<path d="M60,150 H140 M70,150 v10 M130,150 v10" stroke="#0077b6" stroke-width="3"/>' +
      '<rect x="150" y="90" width="20" height="20" rx="2" fill="#0077b6" opacity="0.6"/>' +
      '<rect x="150" y="120" width="20" height="20" rx="2" fill="#0077b6" opacity="0.6"/>'
    );
  }
  
  const metaverseImage = document.querySelector('img[alt="Educational AI Space"]');
  if (metaverseImage) {
    metaverseImage.outerHTML = createSVG(
      'metaverse',
      '#ff4d6d',
      '<polygon points="100,50 150,80 150,140 100,170 50,140 50,80" fill="#ff4d6d" opacity="0.2"/>' +
      '<path d="M100,50 L100,170" stroke="#ff4d6d" stroke-width="2" stroke-dasharray="5,5"/>' +
      '<path d="M50,80 L150,140" stroke="#ff4d6d" stroke-width="2" stroke-dasharray="5,5"/>' +
      '<path d="M150,80 L50,140" stroke="#ff4d6d" stroke-width="2" stroke-dasharray="5,5"/>' +
      '<circle cx="100" cy="110" r="25" fill="#ff4d6d" opacity="0.7"/>' +
      '<path d="M90,105 L110,105 M90,115 L110,115" stroke="white" stroke-width="3" stroke-linecap="round"/>'
    );
  }
}

// Helper function to create an SVG image
function createSVG(id, color, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200" id="${id}">
    <rect width="200" height="200" fill="none"/>
    ${content}
  </svg>`;
}

// Initialize the loading effect
window.addEventListener('load', function() {
  // Hide loading screen after it fades out
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, 4000); // 3s for the animation + 1s buffer
  
  // Create project images
  createProjectImages();
});
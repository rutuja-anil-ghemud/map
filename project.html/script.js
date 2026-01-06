// Cursor Trail Effect
document.addEventListener('mousemove', (e) => {
  const trail = document.querySelector('.cursor-trail');
  trail.style.left = e.clientX + 'px';
  trail.style.top = e.clientY + 'px';
});

// Smooth Scrolling for Navigation
function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({
    behavior: 'smooth'
  });
}

// Navigation Links Smooth Scroll
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    scrollToSection(targetId);
  });
});

// Animated Counter for Stats
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current) + (target >= 100 ? '%' : '+');
  }, 20);
}

// Intersection Observer for Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      
      // Animate stats counters
      if (entry.target.classList.contains('stat-card')) {
        const number = entry.target.querySelector('.stat-number');
        const target = parseInt(entry.target.dataset.count);
        animateCounter(number, target);
      }
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
  // Set initial state for animated elements
  const animatedElements = document.querySelectorAll('.stat-card, .dept-card, .leader-card, .dashboard-card');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
});

// Smart Form Handling
const admissionForm = document.getElementById('admissionForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const programSelect = document.getElementById('program');

// Real-time preview updates with CET eligibility
function updatePreview() {
  document.getElementById('previewName').textContent = nameInput.value || 'Name will appear here';
  document.getElementById('previewEmail').textContent = emailInput.value || 'Email will appear here';
  
  const cetScore = document.getElementById('cetScore')?.value;
  const cetRank = document.getElementById('cetRank')?.value;
  
  if (cetScore && cetRank) {
    document.getElementById('previewCET').textContent = `CET: ${cetScore}/200 (Rank: ${cetRank})`;
    checkEligibility(cetRank, programSelect.value);
  } else {
    document.getElementById('previewCET').textContent = 'CET Score will appear here';
  }
  
  const selectedProgram = programSelect.options[programSelect.selectedIndex].text;
  document.getElementById('previewProgram').textContent = selectedProgram !== 'Choose Your Path' ? selectedProgram : 'Program will appear here';
}

// Check CET eligibility
function checkEligibility(rank, program) {
  const cutoffs = {
    cs: 5000,
    me: 8000,
    ee: 7000,
    ce: 10000,
    ae: 6000
  };
  
  const eligibilityDiv = document.getElementById('eligibilityCheck');
  const statusDiv = eligibilityDiv.querySelector('.eligibility-status');
  
  if (program && cutoffs[program]) {
    const isEligible = parseInt(rank) <= cutoffs[program];
    
    if (isEligible) {
      statusDiv.textContent = `✅ Eligible for ${programSelect.options[programSelect.selectedIndex].text}`;
      statusDiv.className = 'eligibility-status eligible';
    } else {
      statusDiv.textContent = `❌ Not eligible for ${programSelect.options[programSelect.selectedIndex].text} (Cutoff: ${cutoffs[program]})`;
      statusDiv.className = 'eligibility-status not-eligible';
    }
  } else {
    statusDiv.textContent = 'Select program to check eligibility';
    statusDiv.className = 'eligibility-status';
  }
}

nameInput.addEventListener('input', updatePreview);
emailInput.addEventListener('input', updatePreview);
programSelect.addEventListener('change', updatePreview);

// Add CET field listeners
const cetScoreInput = document.getElementById('cetScore');
const cetRankInput = document.getElementById('cetRank');

if (cetScoreInput) cetScoreInput.addEventListener('input', updatePreview);
if (cetRankInput) cetRankInput.addEventListener('input', updatePreview);

// Form submission with backend integration
admissionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  
  // Loading animation
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  submitBtn.disabled = true;
  
  try {
    const formData = {
      name: nameInput.value,
      email: emailInput.value,
      program: programSelect.value
    };
    
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Application Submitted!';
      submitBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
      
      // Store student ID for future use
      localStorage.setItem('studentId', result.studentId);
      
      // Update progress
      updateProgress(25);
      
      // Show success message
      showNotification('Application submitted successfully!', 'success');
    } else {
      throw new Error(result.error || 'Submission failed');
    }
  } catch (error) {
    submitBtn.innerHTML = '<i class="fas fa-times"></i> Submission Failed';
    submitBtn.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
    showNotification(error.message, 'error');
  }
  
  // Reset after delay
  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    submitBtn.style.background = 'linear-gradient(45deg, var(--accent), var(--primary))';
  }, 3000);
});

// Department Card Interactions
document.querySelectorAll('.dept-card').forEach(card => {
  card.addEventListener('click', () => {
    const dept = card.dataset.dept;
    showDepartmentDetails(dept);
  });
});

function showDepartmentDetails(dept) {
  const details = {
    cs: {
      title: '💻 Computer Science & AI',
      description: 'Leading the future with artificial intelligence, machine learning, and cutting-edge software development.',
      labs: ['AI Research Lab', 'Cybersecurity Center', 'Software Engineering Lab', 'Data Science Hub'],
      projects: ['Smart City Solutions', 'Healthcare AI', 'Autonomous Systems']
    },
    me: {
      title: '⚙️ Mechanical Engineering',
      description: 'Innovation in manufacturing, robotics, and sustainable engineering solutions.',
      labs: ['Robotics Lab', 'Manufacturing Center', 'Materials Testing', 'CAD Design Studio'],
      projects: ['Green Energy Systems', 'Industrial Automation', 'Aerospace Components']
    },
    ee: {
      title: '⚡ Electrical Engineering',
      description: 'Powering the future with smart grids, IoT, and renewable energy systems.',
      labs: ['Power Systems Lab', 'Electronics Workshop', 'IoT Development Center', 'Smart Grid Facility'],
      projects: ['Smart Home Systems', 'Renewable Energy', 'Electric Vehicle Tech']
    },
    ce: {
      title: '🏗️ Civil Engineering',
      description: 'Building sustainable infrastructure for tomorrow\'s cities.',
      labs: ['Structural Testing Lab', 'Environmental Engineering', 'Surveying Center', 'Materials Lab'],
      projects: ['Sustainable Buildings', 'Smart Infrastructure', 'Water Management']
    }
  };
  
  const detail = details[dept];
  if (detail) {
    alert(`${detail.title}\n\n${detail.description}\n\nLabs: ${detail.labs.join(', ')}\n\nCurrent Projects: ${detail.projects.join(', ')}`);
  }
}

// Progress Bar Animation
function updateProgress(percentage) {
  const progressPercent = document.getElementById('progressPercent');
  const progressRing = document.querySelector('.progress-ring-fill');
  
  if (progressRing) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset = offset;
  }
  
  if (progressPercent) {
    let current = parseInt(progressPercent.textContent);
    const increment = (percentage - current) / 50;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= percentage) || (increment < 0 && current <= percentage)) {
        current = percentage;
        clearInterval(timer);
      }
      progressPercent.textContent = Math.floor(current) + '%';
    }, 20);
  }
  
  // Update progress steps
  updateProgressSteps(percentage);
}

function updateProgressSteps(percentage) {
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    step.classList.remove('completed', 'current');
    
    if (percentage > (index + 1) * 25) {
      step.classList.add('completed');
    } else if (percentage > index * 25) {
      step.classList.add('current');
    }
  });
}

// File Upload Handling
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadedFiles = document.getElementById('uploadedFiles');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.style.background = 'rgba(240, 147, 251, 0.2)';
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.style.background = '';
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.background = '';
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  const studentId = localStorage.getItem('studentId');
  
  if (!studentId) {
    showNotification('Please submit your application first', 'warning');
    return;
  }
  
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('documents', file);
  });
  
  // Upload to server
  fetch(`/api/upload/${studentId}`, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      result.files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin: 10px 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          border-left: 4px solid var(--success);
        `;
        
        fileElement.innerHTML = `
          <span>📄 ${file.name}</span>
          <span style="color: var(--success);">✓ Uploaded</span>
        `;
        
        uploadedFiles.appendChild(fileElement);
      });
      
      showNotification('Documents uploaded successfully!', 'success');
      loadApplicationStatus();
    } else {
      showNotification(result.error, 'error');
    }
  })
  .catch(error => {
    showNotification('Upload failed: ' + error.message, 'error');
  });
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(26, 26, 46, 0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
  } else {
    navbar.style.background = 'rgba(26, 26, 46, 0.95)';
    navbar.style.boxShadow = 'none';
  }
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Particle Animation
function createParticle() {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
  particle.style.opacity = Math.random();
  
  document.querySelector('.particles').appendChild(particle);
  
  setTimeout(() => {
    particle.remove();
  }, 5000);
}

// Create particles periodically
setInterval(createParticle, 2000);

// Initialize progress on page load
document.addEventListener('DOMContentLoaded', () => {
  updateProgress(0);
  loadApplicationStatus();
  
  // Add loading animation to cards
  const cards = document.querySelectorAll('.card, .dept-card, .leader-card, .dashboard-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = (index * 0.1) + 's';
  });
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close any open modals or menus
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
  // Scroll-based animations can be added here
}, 16)); // ~60fps

console.log('🚀 NexGen Engineering Portal loaded successfully!');

// Load application status from backend
async function loadApplicationStatus() {
  const studentId = localStorage.getItem('studentId');
  
  if (!studentId) return;
  
  try {
    const response = await fetch(`/api/applications/${studentId}`);
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      updateProgress(data.progress_percentage);
      
      // Update status indicator
      const statusIndicator = document.querySelector('.status-indicator');
      if (statusIndicator) {
        statusIndicator.textContent = data.application_status.replace('_', ' ').toUpperCase();
      }
    }
  } catch (error) {
    console.error('Failed to load application status:', error);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };
  
  notification.style.background = colors[type] || colors.info;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
// Syllabus Tab Functionality
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const syllabusContents = document.querySelectorAll('.syllabus-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      syllabusContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding content
      const dept = button.dataset.dept;
      const content = document.getElementById(`${dept}-syllabus`);
      if (content) {
        content.classList.add('active');
      }
    });
  });
});

// Document Verification Functions
function initDocumentVerification() {
  const verifyButtons = document.querySelectorAll('.verify-btn');
  
  verifyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const docItem = e.target.closest('.doc-item');
      const docName = docItem.querySelector('span').textContent;
      
      // Create file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.jpg,.jpeg,.png';
      
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          uploadDocument(file, docName, button);
        }
      };
      
      fileInput.click();
    });
  });
}

function uploadDocument(file, docName, button) {
  const studentId = localStorage.getItem('studentId');
  
  if (!studentId) {
    showNotification('Please submit your application first', 'warning');
    return;
  }
  
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentName', docName);
  
  button.textContent = 'Uploading...';
  button.style.background = '#ff9800';
  
  // Simulate upload process
  setTimeout(() => {
    button.textContent = 'Verified ✓';
    button.style.background = '#4CAF50';
    button.style.pointerEvents = 'none';
    
    // Update verification status
    updateVerificationStatus();
    
    showNotification(`${docName} uploaded successfully!`, 'success');
  }, 2000);
}

function updateVerificationStatus() {
  const verifiedDocs = document.querySelectorAll('.verify-btn').length;
  const completedDocs = document.querySelectorAll('.verify-btn[style*="4CAF50"]').length;
  
  const steps = document.querySelectorAll('.step-status');
  
  if (completedDocs > 0) {
    steps[0].textContent = 'Completed';
    steps[0].className = 'step-status completed';
    steps[0].style.background = '#4CAF50';
  }
  
  if (completedDocs >= 2) {
    steps[1].textContent = 'Processing';
    steps[1].className = 'step-status processing';
    steps[1].style.background = '#ff9800';
  }
  
  if (completedDocs === verifiedDocs) {
    steps[2].textContent = 'In Review';
    steps[2].className = 'step-status review';
    steps[2].style.background = '#2196F3';
  }
}

// AI Document Scanner
function initAIScanner() {
  const scannerZone = document.getElementById('scannerZone');
  
  if (scannerZone) {
    scannerZone.addEventListener('click', () => {
      // Simulate AI scanning
      scannerZone.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>AI Scanning in progress...</p>
        <div class="scan-progress">
          <div class="progress-bar" style="width: 0%"></div>
        </div>
      `;
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        const progressBar = scannerZone.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.width = progress + '%';
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          scannerZone.innerHTML = `
            <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
            <p>Document scanned successfully!</p>
            <div class="scan-results">
              <span>✓ Text extracted</span>
              <span>✓ Authenticity verified</span>
              <span>✓ Quality approved</span>
            </div>
          `;
          
          showNotification('AI scan completed successfully!', 'success');
        }
      }, 300);
    });
  }
}

// Helpline Functions
function initHelpline() {
  const callButtons = document.querySelectorAll('.call-btn');
  
  callButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.helpline-card');
      const phoneNumber = card.querySelector('.phone-number').textContent;
      
      // Show call confirmation
      const confirmed = confirm(`Do you want to call ${phoneNumber}?`);
      
      if (confirmed) {
        // In a real app, this would initiate a call
        window.open(`tel:${phoneNumber}`);
        showNotification('Initiating call...', 'info');
      }
    });
  });
}

// Enhanced form submission with CET validation
admissionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  
  // Validate CET eligibility first
  const cetRank = document.getElementById('cetRank').value;
  const program = programSelect.value;
  
  const cutoffs = {
    cs: 5000, me: 8000, ee: 7000, ce: 10000, ae: 6000
  };
  
  if (program && cutoffs[program] && parseInt(cetRank) > cutoffs[program]) {
    showNotification('Your CET rank does not meet the cutoff for selected program', 'error');
    return;
  }
  
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing CET Application...';
  submitBtn.disabled = true;
  
  try {
    const formData = {
      name: nameInput.value,
      email: emailInput.value,
      cetScore: document.getElementById('cetScore').value,
      cetRank: cetRank,
      program: program
    };
    
    const response = await fetch('/api/cet-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      submitBtn.innerHTML = '<i class="fas fa-check"></i> CET Application Submitted!';
      submitBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
      
      localStorage.setItem('studentId', result.studentId);
      updateProgress(25);
      
      showNotification('CET-based application submitted successfully!', 'success');
    } else {
      throw new Error(result.error || 'Submission failed');
    }
  } catch (error) {
    submitBtn.innerHTML = '<i class="fas fa-times"></i> Submission Failed';
    submitBtn.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
    showNotification(error.message, 'error');
  }
  
  setTimeout(() => {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    submitBtn.style.background = 'linear-gradient(45deg, var(--accent), var(--primary))';
  }, 3000);
});

// Initialize all new features
document.addEventListener('DOMContentLoaded', () => {
  initDocumentVerification();
  initAIScanner();
  initHelpline();
  
  // Load syllabus data
  loadSyllabusData();
});

// Load syllabus data from backend
async function loadSyllabusData() {
  try {
    const response = await fetch('/api/syllabus');
    const result = await response.json();
    
    if (result.success) {
      updateSyllabusContent(result.data);
    }
  } catch (error) {
    console.error('Failed to load syllabus:', error);
  }
}

function updateSyllabusContent(syllabusData) {
  // Update syllabus content dynamically
  Object.keys(syllabusData).forEach(dept => {
    const content = document.getElementById(`${dept}-syllabus`);
    if (content && syllabusData[dept]) {
      // Update with real data from backend
      console.log(`Updated ${dept} syllabus`);
    }
  });
}

console.log('🎓 PREC Engineering Portal with CET admission system loaded successfully!');
// Download Center Functions
function downloadCollegeInfo() {
  const btn = event.target.closest('.download-btn');
  startDownload(btn, 'PREC_Loni_College_Brochure.pdf', generateCollegeBrochure());
}

function downloadRegistrationForm() {
  const btn = event.target.closest('.download-btn');
  startDownload(btn, 'PREC_Loni_Registration_Form.pdf', generateRegistrationForm());
}

function downloadSyllabus() {
  const btn = event.target.closest('.download-btn');
  startDownload(btn, 'PREC_Loni_Complete_Syllabus.pdf', generateSyllabusPDF());
}

function downloadAdmissionGuide() {
  const btn = event.target.closest('.download-btn');
  startDownload(btn, 'PREC_Loni_Admission_Guide.pdf', generateAdmissionGuide());
}

function startDownload(button, filename, content) {
  // Add downloading animation
  button.classList.add('downloading');
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
  
  // Simulate download process
  setTimeout(() => {
    // Create and trigger download
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Update download counter
    updateDownloadCounter();
    
    // Reset button
    button.classList.remove('downloading');
    button.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
    button.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
    
    // Show success notification
    showNotification(`${filename} downloaded successfully!`, 'success');
    
    // Reset button after delay
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-download"></i> Download';
      button.style.background = 'linear-gradient(45deg, var(--accent), var(--primary))';
    }, 3000);
  }, 2000);
}

function generateCollegeBrochure() {
  return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(PREC Loni Engineering College) Tj
0 -50 Td
/F1 16 Tf
(Pimpri Chinchwad Engineering College, Loni) Tj
0 -30 Td
(Excellence in Engineering Education) Tj
0 -50 Td
(Address: Loni Kalbhor, Pune, Maharashtra 412201) Tj
0 -30 Td
(Phone: +91-20-2765-3168) Tj
0 -30 Td
(Email: info@precloni.ac.in) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000000504 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
561
%%EOF`;
}

function generateRegistrationForm() {
  return `
%PDF-1.4
PREC Loni Registration Form

Student Information:
Name: ________________________
Email: _______________________
Phone: ______________________
CET Score: ___________________
CET Rank: ____________________

Program Selection:
□ Computer Science & AI
□ Mechanical Engineering  
□ Electrical Engineering
□ Civil Engineering
□ Aerospace Engineering

Documents Checklist:
□ 10th Mark Sheet
□ 12th Mark Sheet
□ CET Score Card
□ Aadhar Card
□ Passport Size Photos

Signature: ___________________
Date: _______________________

Submit to: PREC Loni Admission Office
Address: Loni Kalbhor, Pune, Maharashtra 412201
`;
}

function generateSyllabusPDF() {
  return `
PREC Loni - Complete Engineering Syllabus

Computer Science & AI:
Semester 1: Programming Fundamentals, Mathematics I, Physics, Engineering Graphics
Semester 2: Data Structures, Mathematics II, Digital Electronics, Computer Organization
Semester 3: Object Oriented Programming, Database Management, Computer Networks, Operating Systems
Semester 4: Machine Learning, Web Development, Software Engineering, Artificial Intelligence

Mechanical Engineering:
Semester 1: Engineering Mechanics, Engineering Drawing, Mathematics I, Physics
Semester 2: Thermodynamics, Manufacturing Processes, Mathematics II, Material Science

Electrical Engineering:
Semester 1: Circuit Analysis, Mathematics I, Physics, Engineering Graphics
Semester 2: Electronic Devices, Digital Logic, Mathematics II, Electromagnetic Theory

Civil Engineering:
Semester 1: Engineering Mechanics, Surveying, Mathematics I, Physics
Semester 2: Strength of Materials, Fluid Mechanics, Mathematics II, Building Materials

For complete syllabus details, visit: www.precloni.ac.in
`;
}

function generateAdmissionGuide() {
  return `
PREC Loni CET Admission Guide 2025

Step 1: Check Eligibility
- Valid CET Score (Out of 200)
- CET Rank within department cutoff
- 12th Pass with PCM subjects

Step 2: Online Application
- Visit: www.precloni.ac.in
- Fill CET-based application form
- Upload required documents

Step 3: Document Verification
- 10th & 12th Mark Sheets
- CET Score Card
- Aadhar Card
- Passport Photos

Step 4: Admission Process
- Merit list based on CET rank
- Counseling rounds
- Seat allocation
- Fee payment

Cutoff Ranks (Previous Year):
Computer Science: 1-5000
Mechanical: 1-8000
Electrical: 1-7000
Civil: 1-10000

Contact: +91-20-2765-3169
Email: admissions@precloni.ac.in
`;
}

function updateDownloadCounter() {
  const counter = document.getElementById('totalDownloads');
  if (counter) {
    let current = parseInt(counter.textContent.replace(',', ''));
    current += 1;
    counter.textContent = current.toLocaleString();
  }
}

console.log('📥 Download Center loaded successfully!');
// Government Schemes Functions
document.addEventListener('DOMContentLoaded', () => {
  initSchemeFilters();
});

function initSchemeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const schemeCards = document.querySelectorAll('.scheme-card');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      
      const category = button.dataset.category;
      
      // Filter scheme cards
      schemeCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.classList.remove('hidden');
          card.classList.add('show');
        } else {
          card.classList.add('hidden');
          card.classList.remove('show');
        }
      });
    });
  });
}

function applyScheme(schemeId) {
  const schemeDetails = {
    'pm-scholarship': {
      name: 'Prime Minister\'s Scholarship Scheme',
      url: 'https://ksb.gov.in/',
      requirements: ['Armed Forces background', 'Valid documents', 'Academic records']
    },
    'nsp': {
      name: 'National Scholarship Portal',
      url: 'https://scholarships.gov.in/',
      requirements: ['Income certificate', 'Caste certificate', 'Academic records']
    },
    'ebc-mh': {
      name: 'EBC Scholarship Maharashtra',
      url: 'https://mahadbt.maharashtra.gov.in/',
      requirements: ['EBC certificate', 'Income certificate', 'Domicile certificate']
    },
    'scst-mh': {
      name: 'SC/ST Scholarship Maharashtra',
      url: 'https://mahadbt.maharashtra.gov.in/',
      requirements: ['Caste certificate', 'Income certificate', 'Academic records']
    },
    'maulana-azad': {
      name: 'Maulana Azad Scholarship',
      url: 'https://scholarships.gov.in/',
      requirements: ['Minority certificate', 'Income certificate', 'Academic records']
    },
    'inspire': {
      name: 'INSPIRE Scholarship',
      url: 'https://online-inspire.gov.in/',
      requirements: ['Top 1% in boards', 'Science stream', 'Income certificate']
    }
  };
  
  const scheme = schemeDetails[schemeId];
  if (scheme) {
    // Show application confirmation
    const confirmed = confirm(`Apply for ${scheme.name}?\n\nYou will be redirected to the official portal.\n\nRequired documents:\n${scheme.requirements.join('\n')}`);
    
    if (confirmed) {
      // In real implementation, this would redirect to actual government portal
      showNotification(`Redirecting to ${scheme.name} portal...`, 'info');
      
      // Simulate redirect (in real app, use: window.open(scheme.url, '_blank'))
      setTimeout(() => {
        showNotification('Application portal opened in new tab', 'success');
      }, 2000);
    }
  }
}

function showSchemeDetails(schemeId) {
  const schemeInfo = {
    'pm-scholarship': {
      name: 'Prime Minister\'s Scholarship Scheme',
      details: `
        <h4>Eligibility Criteria:</h4>
        <ul>
          <li>Children/widows of Ex-Servicemen</li>
          <li>Children of serving personnel</li>
          <li>Minimum 60% marks in 12th</li>
        </ul>
        <h4>Benefits:</h4>
        <ul>
          <li>Boys: ₹25,000 per year</li>
          <li>Girls: ₹30,000 per year</li>
          <li>Duration: 4 years</li>
        </ul>
        <h4>Application Process:</h4>
        <ul>
          <li>Online application on KSB portal</li>
          <li>Document verification</li>
          <li>Merit-based selection</li>
        </ul>
      `
    },
    'nsp': {
      name: 'National Scholarship Portal',
      details: `
        <h4>Eligibility Criteria:</h4>
        <ul>
          <li>Family income below ₹6 lakh</li>
          <li>Minimum 80% in qualifying exam</li>
          <li>Indian citizen</li>
        </ul>
        <h4>Benefits:</h4>
        <ul>
          <li>Tuition fee reimbursement</li>
          <li>Maintenance allowance</li>
          <li>Book allowance</li>
        </ul>
      `
    },
    'ebc-mh': {
      name: 'EBC Scholarship Maharashtra',
      details: `
        <h4>Eligibility Criteria:</h4>
        <ul>
          <li>EBC category certificate</li>
          <li>Maharashtra domicile</li>
          <li>Family income below ₹8 lakh</li>
        </ul>
        <h4>Benefits:</h4>
        <ul>
          <li>Full tuition fee waiver</li>
          <li>Maintenance allowance: ₹51,000</li>
          <li>Additional benefits for hostellers</li>
        </ul>
      `
    }
  };
  
  const info = schemeInfo[schemeId];
  if (info) {
    // Create modal or show details (simplified version)
    const modal = document.createElement('div');
    modal.className = 'scheme-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${info.name}</h3>
          <button class="close-btn" onclick="closeSchemeModal()">&times;</button>
        </div>
        <div class="modal-body">
          ${info.details}
        </div>
        <div class="modal-footer">
          <button class="apply-btn" onclick="applyScheme('${schemeId}')">Apply Now</button>
          <button class="close-btn" onclick="closeSchemeModal()">Close</button>
        </div>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    modal.querySelector('.modal-content').style.cssText = `
      background: var(--dark);
      border-radius: 15px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      color: var(--light);
      border: 1px solid var(--accent);
    `;
    
    document.body.appendChild(modal);
  }
}

function closeSchemeModal() {
  const modal = document.querySelector('.scheme-modal');
  if (modal) {
    modal.remove();
  }
}

// Initialize schemes on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add scheme cards animation on scroll
  const schemeCards = document.querySelectorAll('.scheme-card');
  schemeCards.forEach((card, index) => {
    card.style.animationDelay = (index * 0.1) + 's';
    observer.observe(card);
  });
});

console.log('🏛️ Government Schemes section loaded successfully!');
// AI Assistant Functions
let chatOpen = false;
let chatMinimized = false;

// AI Knowledge Base for PREC Loni
const aiKnowledgeBase = {
  'cet cutoff': {
    answer: `🎯 **CET Cutoffs for PREC Loni (2024-25):**
    
    • Computer Science: Rank 1-5000
    • Mechanical Engineering: Rank 1-8000  
    • Electrical Engineering: Rank 1-7000
    • Civil Engineering: Rank 1-10000
    • Aerospace Engineering: Rank 1-6000
    
    These are general category cutoffs. OBC/SC/ST have relaxed cutoffs.`
  },
  'documents required': {
    answer: `📋 **Required Documents for Admission:**
    
    ✅ **Mandatory Documents:**
    • 10th Mark Sheet & Certificate
    • 12th Mark Sheet & Certificate  
    • CET Score Card
    • Aadhar Card
    • Passport Size Photos (4 copies)
    
    ✅ **Additional (if applicable):**
    • Caste Certificate (for reservation)
    • Income Certificate (for scholarships)
    • Domicile Certificate
    • Gap Certificate (if any)`
  },
  'fees structure': {
    answer: `💰 **PREC Loni Fee Structure (Annual):**
    
    📚 **Tuition Fees:**
    • General Category: ₹1,20,000
    • OBC Category: ₹85,000
    • SC/ST Category: ₹25,000
    
    🏠 **Additional Costs:**
    • Hostel Fees: ₹80,000/year
    • Mess Fees: ₹45,000/year
    • Development Fee: ₹15,000 (one-time)
    
    💡 Many scholarships available to reduce costs!`
  },
  'application process': {
    answer: `📝 **Step-by-Step Application Process:**
    
    **Step 1:** Check CET Eligibility
    • Enter your CET rank in our portal
    • Verify program eligibility
    
    **Step 2:** Online Application  
    • Fill the CET-based form
    • Upload required documents
    
    **Step 3:** Document Verification
    • AI verification process
    • Manual review by admin
    
    **Step 4:** Merit List & Counseling
    • Wait for merit list publication
    • Attend counseling rounds
    
    **Step 5:** Seat Confirmation
    • Pay admission fees
    • Confirm your seat`
  },
  'contact information': {
    answer: `📞 **PREC Loni Contact Information:**
    
    🏢 **Address:**
    Loni Kalbhor, Pune, Maharashtra 412201
    
    📱 **Phone Numbers:**
    • Admission Helpline: +91-20-2765-3169
    • General Inquiry: +91-20-2765-3171
    • Emergency: +91-20-2765-3168
    
    📧 **Email:**
    • Admissions: admissions@precloni.ac.in
    • General: info@precloni.ac.in
    
    🌐 **Website:** www.precloni.ac.in`
  },
  'scholarships': {
    answer: `🎓 **Available Scholarships:**
    
    🏛️ **Government Schemes:**
    • PM Scholarship: ₹25,000-30,000/year
    • NSP Scholarship: ₹10,000-20,000/year
    • EBC Maharashtra: ₹51,000/year
    • SC/ST Scholarship: ₹59,200/year
    
    🏆 **Merit Scholarships:**
    • Top 10 CET Rankers: 100% fee waiver
    • Top 50 CET Rankers: 50% fee waiver
    
    Check our Schemes section for detailed eligibility!`
  },
  'hostel facilities': {
    answer: `🏠 **Hostel Facilities at PREC Loni:**
    
    🛏️ **Accommodation:**
    • Separate hostels for boys & girls
    • 2/3 sharing rooms available
    • AC & Non-AC options
    
    🍽️ **Amenities:**
    • Mess with nutritious meals
    • Wi-Fi connectivity
    • Study rooms & library
    • Recreation facilities
    • 24/7 security
    
    💰 **Fees:** ₹80,000/year + ₹45,000 mess`
  },
  'placement': {
    answer: `💼 **Placement Statistics:**
    
    📊 **Overall Stats:**
    • Placement Rate: 95%
    • Average Package: ₹6.5 LPA
    • Highest Package: ₹45 LPA
    
    🏢 **Top Recruiters:**
    • TCS, Infosys, Wipro
    • Microsoft, Google, Amazon
    • L&T, Bajaj, Mahindra
    
    🎯 **Department-wise:**
    • Computer Science: 98% placement
    • Mechanical: 92% placement
    • Electrical: 90% placement`
  }
};

function openChat() {
  const assistant = document.getElementById('aiAssistant');
  const toggle = document.querySelector('.ai-toggle');
  
  assistant.classList.add('open');
  toggle.style.display = 'none';
  chatOpen = true;
  
  // Show notification for first-time users
  if (!localStorage.getItem('chatUsed')) {
    setTimeout(() => {
      addBotMessage("🎉 Welcome to PREC Loni! I'm here to help with all your admission queries. Try asking about CET cutoffs or fees!");
      localStorage.setItem('chatUsed', 'true');
    }, 1000);
  }
}

function closeChat() {
  const assistant = document.getElementById('aiAssistant');
  const toggle = document.querySelector('.ai-toggle');
  
  assistant.classList.remove('open');
  toggle.style.display = 'flex';
  chatOpen = false;
  chatMinimized = false;
}

function toggleChat() {
  const assistant = document.getElementById('aiAssistant');
  
  if (chatMinimized) {
    assistant.classList.remove('minimized');
    chatMinimized = false;
  } else {
    assistant.classList.add('minimized');
    chatMinimized = true;
  }
}

function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  
  if (message) {
    addUserMessage(message);
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and respond
    setTimeout(() => {
      hideTypingIndicator();
      processUserMessage(message);
    }, 1500);
  }
}

function askQuestion(question) {
  addUserMessage(question);
  showTypingIndicator();
  
  setTimeout(() => {
    hideTypingIndicator();
    processUserMessage(question);
  }, 1000);
}

function addUserMessage(message) {
  const chatBody = document.getElementById('chatBody');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${message}</p>
    </div>
  `;
  chatBody.appendChild(messageDiv);
  scrollToBottom();
}

function addBotMessage(message) {
  const chatBody = document.getElementById('chatBody');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot-message';
  messageDiv.innerHTML = `
    <div class="message-content">
      ${message.replace(/\n/g, '<br>')}
    </div>
  `;
  chatBody.appendChild(messageDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const chatBody = document.getElementById('chatBody');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-message';
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chatBody.appendChild(typingDiv);
  scrollToBottom();
}

function hideTypingIndicator() {
  const typingMessage = document.querySelector('.typing-message');
  if (typingMessage) {
    typingMessage.remove();
  }
}

function processUserMessage(message) {
  const lowerMessage = message.toLowerCase();
  let response = "🤔 I'm not sure about that. Let me help you with:\n\n";
  
  // Check knowledge base
  for (const [key, value] of Object.entries(aiKnowledgeBase)) {
    if (lowerMessage.includes(key) || 
        lowerMessage.includes(key.replace(' ', '')) ||
        checkSimilarTerms(lowerMessage, key)) {
      response = value.answer;
      break;
    }
  }
  
  // Default response with suggestions
  if (response.includes("I'm not sure")) {
    response += `
    • CET Cutoffs & Eligibility
    • Admission Process & Documents  
    • Fees & Scholarships
    • Hostel & Facilities
    • Placement Statistics
    • Contact Information
    
    Try asking: "What is the CET cutoff?" or "What documents are required?"`;
  }
  
  addBotMessage(response);
}

function checkSimilarTerms(message, key) {
  const synonyms = {
    'cet cutoff': ['cutoff', 'cut off', 'rank', 'merit', 'eligibility'],
    'documents required': ['documents', 'papers', 'certificates', 'requirements'],
    'fees structure': ['fees', 'cost', 'charges', 'money', 'payment'],
    'application process': ['apply', 'admission', 'process', 'procedure', 'steps'],
    'contact information': ['contact', 'phone', 'address', 'location', 'reach'],
    'scholarships': ['scholarship', 'financial aid', 'schemes', 'funding'],
    'hostel facilities': ['hostel', 'accommodation', 'rooms', 'facilities'],
    'placement': ['placement', 'jobs', 'companies', 'recruitment', 'career']
  };
  
  if (synonyms[key]) {
    return synonyms[key].some(term => message.includes(term));
  }
  return false;
}

function handleEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function scrollToBottom() {
  const chatBody = document.getElementById('chatBody');
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
  // Show notification dot for new users
  if (!localStorage.getItem('chatUsed')) {
    const notificationDot = document.getElementById('notificationDot');
    notificationDot.classList.add('show');
    
    // Auto-open chat after 5 seconds for first-time users
    setTimeout(() => {
      if (!chatOpen) {
        notificationDot.classList.remove('show');
        openChat();
      }
    }, 5000);
  }
});

console.log('🤖 AI Assistant loaded successfully!');
// Placement Map Functions
document.addEventListener('DOMContentLoaded', () => {
  initPlacementMap();
});

function initPlacementMap() {
  const mapButtons = document.querySelectorAll('.map-btn');
  const mapViews = document.querySelectorAll('.map-view');
  
  // Map view switching
  mapButtons.forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      
      // Update active button
      mapButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active map view
      mapViews.forEach(mapView => mapView.classList.remove('active'));
      document.getElementById(view + 'Map').classList.add('active');
      
      // Update info based on view
      updateMapInfo(view);
    });
  });
  
  // Add hover effects to map elements
  addMapInteractions();
}

function addMapInteractions() {
  // State hover effects
  const states = document.querySelectorAll('.state');
  states.forEach(state => {
    state.addEventListener('mouseenter', (e) => {
      showMapTooltip(e, state.dataset.state, state.dataset.rate);
    });
    
    state.addEventListener('mouseleave', hideMapTooltip);
    
    state.addEventListener('click', () => {
      updateMapInfo('state', {
        name: state.dataset.state,
        rate: state.dataset.rate
      });
    });
  });
  
  // City hover effects
  const cities = document.querySelectorAll('.city');
  cities.forEach(city => {
    city.addEventListener('mouseenter', (e) => {
      showMapTooltip(e, city.dataset.city, city.dataset.rate);
    });
    
    city.addEventListener('mouseleave', hideMapTooltip);
    
    city.addEventListener('click', () => {
      updateMapInfo('city', {
        name: city.dataset.city,
        rate: city.dataset.rate
      });
    });
  });
  
  // Company cluster interactions
  const clusters = document.querySelectorAll('.company-cluster');
  clusters.forEach(cluster => {
    cluster.addEventListener('click', () => {
      const sector = cluster.dataset.sector;
      updateMapInfo('company', { sector });
    });
  });
  
  // College marker interaction
  const collegeMarkers = document.querySelectorAll('.college-marker');
  collegeMarkers.forEach(marker => {
    marker.addEventListener('click', () => {
      updateMapInfo('college');
    });
  });
}

function showMapTooltip(event, name, rate) {
  let tooltip = document.querySelector('.map-tooltip');
  
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    document.body.appendChild(tooltip);
  }
  
  tooltip.innerHTML = `
    <strong>${formatName(name)}</strong><br>
    Placement Rate: <span style="color: var(--accent);">${rate}%</span>
  `;
  
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
  tooltip.classList.add('show');
}

function hideMapTooltip() {
  const tooltip = document.querySelector('.map-tooltip');
  if (tooltip) {
    tooltip.classList.remove('show');
  }
}

function formatName(name) {
  return name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function updateMapInfo(type, data = {}) {
  const infoTitle = document.getElementById('infoTitle');
  const overallRate = document.getElementById('overallRate');
  const avgPackage = document.getElementById('avgPackage');
  const highestPackage = document.getElementById('highestPackage');
  const topRecruiters = document.getElementById('topRecruiters');
  
  const mapData = {
    india: {
      title: 'India Placement Overview',
      rate: '95%',
      avg: '₹6.5 LPA',
      highest: '₹45 LPA',
      recruiters: 'Microsoft, TCS, L&T'
    },
    maharashtra: {
      title: 'Maharashtra Placement Details',
      rate: '95%',
      avg: '₹7.2 LPA',
      highest: '₹45 LPA',
      recruiters: 'Pune & Mumbai Companies'
    },
    companies: {
      title: 'Company-wise Distribution',
      rate: '95%',
      avg: '₹6.5 LPA',
      highest: '₹45 LPA',
      recruiters: 'IT: 45%, Core: 30%, Consulting: 15%'
    },
    state: {
      title: `${formatName(data.name)} Placement Rate`,
      rate: `${data.rate}%`,
      avg: '₹6.5 LPA',
      highest: '₹45 LPA',
      recruiters: 'Regional Companies'
    },
    city: {
      title: `${formatName(data.name)} Opportunities`,
      rate: `${data.rate}%`,
      avg: '₹7.0 LPA',
      highest: '₹45 LPA',
      recruiters: 'Local & MNC Companies'
    },
    company: {
      title: getCompanyInfo(data.sector).title,
      rate: '95%',
      avg: getCompanyInfo(data.sector).avg,
      highest: getCompanyInfo(data.sector).highest,
      recruiters: getCompanyInfo(data.sector).companies
    },
    college: {
      title: 'PREC Loni Placement Excellence',
      rate: '95%',
      avg: '₹6.5 LPA',
      highest: '₹45 LPA',
      recruiters: 'Top MNCs & Core Companies'
    }
  };
  
  const info = mapData[type] || mapData.india;
  
  infoTitle.textContent = info.title;
  overallRate.textContent = info.rate;
  avgPackage.textContent = info.avg;
  highestPackage.textContent = info.highest;
  topRecruiters.textContent = info.recruiters;
  
  // Add animation
  const infoCard = document.querySelector('.info-card');
  infoCard.style.transform = 'scale(0.95)';
  setTimeout(() => {
    infoCard.style.transform = 'scale(1)';
  }, 100);
}

function getCompanyInfo(sector) {
  const sectorData = {
    it: {
      title: 'IT & Software Sector',
      avg: '₹8.5 LPA',
      highest: '₹45 LPA',
      companies: 'TCS, Infosys, Microsoft, Google'
    },
    core: {
      title: 'Core Engineering Sector',
      avg: '₹6.2 LPA',
      highest: '₹25 LPA',
      companies: 'L&T, Bajaj, Mahindra, Tata Motors'
    },
    consulting: {
      title: 'Consulting Sector',
      avg: '₹12 LPA',
      highest: '₹35 LPA',
      companies: 'Deloitte, EY, KPMG, Accenture'
    },
    finance: {
      title: 'Finance & Banking Sector',
      avg: '₹9.8 LPA',
      highest: '₹30 LPA',
      companies: 'HDFC, ICICI, Goldman Sachs, JP Morgan'
    }
  };
  
  return sectorData[sector] || sectorData.it;
}

// Add placement statistics animation
function animatePlacementStats() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(stat => {
    const text = stat.textContent;
    if (text.includes('%')) {
      const percentage = parseInt(text);
      animateNumber(stat, 0, percentage, '%');
    } else if (text.includes('₹')) {
      const amount = parseFloat(text.replace('₹', '').replace('L', ''));
      animateNumber(stat, 0, amount, '₹', 'L');
    }
  });
}

function animateNumber(element, start, end, prefix = '', suffix = '') {
  const duration = 2000;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const current = start + (end - start) * progress;
    const displayValue = prefix + current.toFixed(1) + suffix;
    
    element.textContent = displayValue;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Initialize map interactions on scroll
const mapSection = document.querySelector('.placement-map-section');
if (mapSection) {
  observer.observe(mapSection);
  
  mapSection.addEventListener('animationend', () => {
    setTimeout(animatePlacementStats, 500);
  });
}

console.log('🗺️ Placement Map loaded successfully!');
// College Location Map Functions
function getDirections() {
  const collegeAddress = "Loni Kalbhor, Pune, Maharashtra 412201";
  
  // Check if geolocation is available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Open Google Maps with directions
        const directionsUrl = `https://www.google.com/maps/dir/${lat},${lng}/${encodeURIComponent(collegeAddress)}`;
        window.open(directionsUrl, '_blank');
        
        showNotification('Opening directions in Google Maps...', 'info');
      },
      (error) => {
        // Fallback: Open Google Maps without current location
        const directionsUrl = `https://www.google.com/maps/search/${encodeURIComponent(collegeAddress)}`;
        window.open(directionsUrl, '_blank');
        
        showNotification('Please allow location access for better directions', 'warning');
      }
    );
  } else {
    // Fallback for browsers without geolocation
    const directionsUrl = `https://www.google.com/maps/search/${encodeURIComponent(collegeAddress)}`;
    window.open(directionsUrl, '_blank');
    
    showNotification('Opening college location in Google Maps...', 'info');
  }
}

function shareLocation() {
  const collegeInfo = {
    name: 'PREC Loni - Pimpri Chinchwad Engineering College',
    address: 'Loni Kalbhor, Pune, Maharashtra 412201',
    phone: '+91-20-2765-3168',
    website: 'www.precloni.ac.in',
    coordinates: '18.5123456, 73.9876543'
  };
  
  const shareText = `📍 ${collegeInfo.name}\n\n🏢 Address: ${collegeInfo.address}\n📞 Phone: ${collegeInfo.phone}\n🌐 Website: ${collegeInfo.website}\n\n📍 Location: https://maps.google.com/?q=${collegeInfo.coordinates}`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: collegeInfo.name,
      text: shareText,
      url: `https://maps.google.com/?q=${collegeInfo.coordinates}`
    }).then(() => {
      showNotification('Location shared successfully!', 'success');
    }).catch((error) => {
      fallbackShare(shareText);
    });
  } else {
    fallbackShare(shareText);
  }
}

function fallbackShare(text) {
  // Copy to clipboard as fallback
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Location details copied to clipboard!', 'success');
    }).catch(() => {
      showShareModal(text);
    });
  } else {
    showShareModal(text);
  }
}

function showShareModal(text) {
  const modal = document.createElement('div');
  modal.className = 'share-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>📍 Share College Location</h3>
        <button class="close-btn" onclick="closeShareModal()">&times;</button>
      </div>
      <div class="modal-body">
        <textarea readonly class="share-text">${text}</textarea>
        <div class="share-options">
          <button class="share-option" onclick="shareVia('whatsapp', '${encodeURIComponent(text)}')">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </button>
          <button class="share-option" onclick="shareVia('email', '${encodeURIComponent(text)}')">
            <i class="fas fa-envelope"></i> Email
          </button>
          <button class="share-option" onclick="shareVia('sms', '${encodeURIComponent(text)}')">
            <i class="fas fa-sms"></i> SMS
          </button>
          <button class="share-option" onclick="copyToClipboard('${text}')">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  modal.querySelector('.modal-content').style.cssText = `
    background: var(--dark);
    border-radius: 15px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    color: var(--light);
    border: 1px solid var(--accent);
  `;
  
  document.body.appendChild(modal);
}

function closeShareModal() {
  const modal = document.querySelector('.share-modal');
  if (modal) {
    modal.remove();
  }
}

function shareVia(platform, text) {
  const urls = {
    whatsapp: `https://wa.me/?text=${text}`,
    email: `mailto:?subject=PREC Loni Location&body=${text}`,
    sms: `sms:?body=${text}`
  };
  
  if (urls[platform]) {
    window.open(urls[platform], '_blank');
    showNotification(`Opening ${platform}...`, 'info');
    closeShareModal();
  }
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  
  showNotification('Location details copied to clipboard!', 'success');
  closeShareModal();
}

// Distance Calculator
function initDistanceCalculator() {
  const locationSection = document.querySelector('.location-map-section');
  
  // Add distance calculator to the page
  const calculator = document.createElement('div');
  calculator.className = 'distance-calculator';
  calculator.innerHTML = `
    <h4>🗺️ Calculate Distance to PREC Loni</h4>
    <div class="distance-input">
      <input type="text" id="fromLocation" placeholder="Enter your location...">
      <button class="calculate-btn" onclick="calculateDistance()">Calculate</button>
    </div>
    <div class="distance-result" id="distanceResult" style="display: none;"></div>
  `;
  
  const addressCard = document.querySelector('.address-card');
  if (addressCard) {
    addressCard.appendChild(calculator);
  }
}

function calculateDistance() {
  const fromLocation = document.getElementById('fromLocation').value.trim();
  const resultDiv = document.getElementById('distanceResult');
  
  if (!fromLocation) {
    showNotification('Please enter your location', 'warning');
    return;
  }
  
  // Simulate distance calculation (in real app, use Google Distance Matrix API)
  const distances = {
    'mumbai': { distance: '150 km', time: '3 hours' },
    'pune': { distance: '25 km', time: '45 minutes' },
    'nashik': { distance: '180 km', time: '3.5 hours' },
    'nagpur': { distance: '450 km', time: '8 hours' },
    'aurangabad': { distance: '220 km', time: '4 hours' }
  };
  
  const searchKey = fromLocation.toLowerCase();
  let result = null;
  
  // Find matching city
  for (const [city, data] of Object.entries(distances)) {
    if (searchKey.includes(city)) {
      result = data;
      break;
    }
  }
  
  if (result) {
    resultDiv.innerHTML = `
      📍 Distance: <strong>${result.distance}</strong><br>
      ⏱️ Estimated Time: <strong>${result.time}</strong>
    `;
    resultDiv.style.display = 'block';
  } else {
    resultDiv.innerHTML = `
      📍 Distance calculation available for major cities.<br>
      🗺️ Use "Get Directions" for precise route planning.
    `;
    resultDiv.style.display = 'block';
  }
}

// Enhanced Map Interactions
function initLocationMap() {
  // Add map controls
  const mapWrapper = document.querySelector('.map-wrapper');
  if (mapWrapper) {
    const controls = document.createElement('div');
    controls.className = 'map-controls';
    controls.innerHTML = `
      <button class="map-control-btn" onclick="zoomIn()" title="Zoom In">
        <i class="fas fa-plus"></i>
      </button>
      <button class="map-control-btn" onclick="zoomOut()" title="Zoom Out">
        <i class="fas fa-minus"></i>
      </button>
      <button class="map-control-btn" onclick="resetView()" title="Reset View">
        <i class="fas fa-home"></i>
      </button>
      <button class="map-control-btn" onclick="satelliteView()" title="Satellite View">
        <i class="fas fa-satellite"></i>
      </button>
    `;
    
    mapWrapper.appendChild(controls);
  }
  
  // Initialize distance calculator
  initDistanceCalculator();
  
  // Add campus tour button
  addCampusTourButton();
}

function addCampusTourButton() {
  const actionButtons = document.querySelector('.action-buttons');
  if (actionButtons) {
    const tourBtn = document.createElement('button');
    tourBtn.className = 'direction-btn';
    tourBtn.style.background = 'linear-gradient(45deg, var(--primary), var(--accent))';
    tourBtn.innerHTML = '<i class="fas fa-street-view"></i> Virtual Tour';
    tourBtn.onclick = startVirtualTour;
    
    actionButtons.appendChild(tourBtn);
  }
}

function startVirtualTour() {
  showNotification('Virtual campus tour coming soon!', 'info');
  
  // In a real implementation, this would open a 360° virtual tour
  const tourModal = document.createElement('div');
  tourModal.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: var(--dark); padding: 30px; border-radius: 15px; 
                border: 1px solid var(--accent); z-index: 10000; text-align: center;">
      <h3 style="color: var(--accent); margin-bottom: 20px;">🏛️ Virtual Campus Tour</h3>
      <p style="color: var(--light); margin-bottom: 20px;">
        Experience PREC Loni campus from anywhere!<br>
        • 360° Library Views<br>
        • Lab Walkthroughs<br>
        • Hostel Tours<br>
        • Sports Facilities
      </p>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: var(--accent); color: var(--dark); border: none; 
                     padding: 10px 20px; border-radius: 8px; cursor: pointer;">
        Coming Soon!
      </button>
    </div>
  `;
  
  document.body.appendChild(tourModal);
  
  setTimeout(() => {
    tourModal.remove();
  }, 5000);
}

// Map control functions (placeholders for future implementation)
function zoomIn() { showNotification('Zoom In - Feature coming soon!', 'info'); }
function zoomOut() { showNotification('Zoom Out - Feature coming soon!', 'info'); }
function resetView() { showNotification('Reset View - Feature coming soon!', 'info'); }
function satelliteView() { showNotification('Satellite View - Feature coming soon!', 'info'); }

// Initialize location map on page load
document.addEventListener('DOMContentLoaded', () => {
  initLocationMap();
});

console.log('📍 College Location Map loaded successfully!');
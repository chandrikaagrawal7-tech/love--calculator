const jobs = [
    {
        id: 1,
        title: "Senior Full Stack Engineer",
        company: "Nebula Systems",
        location: "Remote, US",
        type: "Full-time",
        salary: "$160k - $220k",
        tags: ["React", "Node.js", "AWS"],
        logoText: "NS"
    },
    {
        id: 2,
        title: "Product Designer",
        company: "Lumina UX",
        location: "San Francisco, CA",
        type: "Hybrid",
        salary: "$140k - $190k",
        tags: ["Figma", "Design Systems"],
        logoText: "LX"
    },
    {
        id: 3,
        title: "DevOps Specialist",
        company: "CloudFlow",
        location: "London, UK",
        type: "On-site",
        salary: "£80k - £110k",
        tags: ["Kubernetes", "Terraform"],
        logoText: "CF"
    },
    {
        id: 4,
        title: "AI Research Scientist",
        company: "NeuralPulse",
        location: "Remote",
        type: "Full-time",
        salary: "$180k - $250k",
        tags: ["Python", "PyTorch", "ML"],
        logoText: "NP"
    },
    {
        id: 5,
        title: "Frontend Lead",
        company: "Vibe Tech",
        location: "New York, NY",
        type: "Full-time",
        salary: "$150k - $200k",
        tags: ["TypeScript", "Next.js"],
        logoText: "VT"
    }
];

const prepData = {
    "Technical Preparation": [
        { q: "How does React Reconciliation work?", a: "React uses a virtual DOM to compare changes and only update the necessary parts of the real DOM." },
        { q: "Explain the STAR method for System Design.", a: "Situation, Task, Action, Result - focused on scaling and reliability." },
        { q: "What is the Big O of QuickSort?", a: "O(n log n) average, O(n^2) worst case." }
    ],
    "Behavioral Mastery": [
        { q: "Tell me about a time you failed.", a: "Focus on what you learned and how you improved." },
        { q: "How do you handle conflict in a team?", a: "Emphasize communication and finding common ground." }
    ],
    "Mock Interviews": [
        { q: "Simulated Session 1", a: "Focus on Frontend performance and accessibility." },
        { q: "Simulated Session 2", a: "Focus on Backend scalability and API design." }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');
    const jobList = document.getElementById('job-list');
    const homeTrigger = document.getElementById('home-trigger');
    
    // Modal Elements
    const modal = document.getElementById('apply-modal');
    const closeModal = document.querySelector('.close-modal');
    const applyForm = document.getElementById('apply-form');
    const successMsg = document.getElementById('success-msg');
    const modalTitle = document.getElementById('modal-job-title');

    // Section Switching Logic
    function switchSection(targetId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            switchSection(targetId);
        });
    });

    homeTrigger.addEventListener('click', () => {
        switchSection('jobs-section');
    });

    // Render Jobs
    function renderJobs(filterText = '') {
        jobList.innerHTML = '';
        const filteredJobs = jobs.filter(job => 
            job.title.toLowerCase().includes(filterText.toLowerCase()) ||
            job.company.toLowerCase().includes(filterText.toLowerCase())
        );

        filteredJobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-info">
                    <div class="company-logo">${job.logoText}</div>
                    <div class="job-details">
                        <h4>${job.title}</h4>
                        <div class="job-meta">
                            <span>${job.company}</span> • 
                            <span>${job.location}</span> • 
                            <span>${job.salary}</span>
                        </div>
                        <div class="job-tags">
                            ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <button class="btn-primary apply-trigger" data-job="${job.title}">Apply Now</button>
            `;
            jobList.appendChild(card);
        });

        // Add event listeners to newly created buttons
        document.querySelectorAll('.apply-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                modalTitle.textContent = btn.getAttribute('data-job');
                modal.classList.add('active');
                applyForm.style.display = 'block';
                successMsg.style.display = 'none';
            });
        });
    }

    renderJobs();

    // Search Logic
    const searchInput = document.getElementById('job-search');
    searchInput.addEventListener('input', (e) => {
        renderJobs(e.target.value);
    });

    // Modal Closing
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Form Submission
    applyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyForm.style.display = 'none';
        successMsg.style.display = 'block';
        setTimeout(() => {
            modal.classList.remove('active');
        }, 3000);
    });

    // Preparation Logic
    const prepCards = document.querySelectorAll('.prep-card');
    const prepGrid = document.querySelector('.prep-grid');
    const prepDetails = document.getElementById('prep-details');
    const closePrep = document.getElementById('close-prep');
    const prepTitle = document.getElementById('prep-title');
    const questionsList = document.getElementById('questions-list');

    prepCards.forEach(card => {
        card.querySelector('button').addEventListener('click', () => {
            const track = card.querySelector('h3').textContent;
            prepTitle.textContent = track;
            prepGrid.style.display = 'none';
            prepDetails.style.display = 'block';
            
            // Render questions
            questionsList.innerHTML = '';
            (prepData[track] || []).forEach(item => {
                const qItem = document.createElement('div');
                qItem.className = 'question-item';
                qItem.innerHTML = `
                    <h4>Q: ${item.q}</h4>
                    <p>A: ${item.a}</p>
                `;
                questionsList.appendChild(qItem);
            });
        });
    });

    closePrep.addEventListener('click', () => {
        prepGrid.style.display = 'grid';
        prepDetails.style.display = 'none';
    });

    // Simulated Resume Interaction
    const uploadArea = document.querySelector('.upload-area');
    const scoreValue = document.querySelector('.score-value');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            uploadArea.innerHTML = '<p>Processing your resume...</p>';
            let score = 0;
            const interval = setInterval(() => {
                score += Math.floor(Math.random() * 10) + 1;
                if (score >= 92) {
                    score = 92;
                    clearInterval(interval);
                    uploadArea.innerHTML = `
                        <div class="upload-icon"></div>
                        <p>Analysis Complete!</p>
                        <small>Resume_Final_v2.pdf uploaded successfully</small>
                    `;
                }
                scoreValue.textContent = score;
            }, 100);
        });
    }

    // Animation Observer
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    function observeElements() {
        document.querySelectorAll('.prep-card, .job-card, .stat-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }

    observeElements();

    // Theme Toggling
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'light') {
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else {
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
    }

    // Auth Modal Logic
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const authCloseBtn = document.querySelector('.auth-close-modal');
    const authForm = document.getElementById('auth-form');
    
    const authModalTitle = document.getElementById('auth-modal-title');
    const nameGroup = document.getElementById('name-group');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleText = document.getElementById('auth-toggle-text');
    const authToggleLink = document.getElementById('auth-toggle-link');

    let isLoginMode = true;

    function openAuthModal(mode) {
        isLoginMode = mode === 'login';
        updateAuthUI();
        if (authModal) authModal.classList.add('active');
    }

    function updateAuthUI() {
        if (!authModalTitle) return;
        if (isLoginMode) {
            authModalTitle.textContent = 'Log In';
            nameGroup.style.display = 'none';
            document.getElementById('auth-name').removeAttribute('required');
            authSubmitBtn.textContent = 'Log In';
            authToggleText.textContent = "Don't have an account?";
            authToggleLink.textContent = 'Sign Up';
        } else {
            authModalTitle.textContent = 'Sign Up';
            nameGroup.style.display = 'block';
            document.getElementById('auth-name').setAttribute('required', 'true');
            authSubmitBtn.textContent = 'Sign Up';
            authToggleText.textContent = 'Already have an account?';
            authToggleLink.textContent = 'Log In';
        }
    }

    if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
    if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal('signup'));
    
    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }

    if (authToggleLink) {
        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateAuthUI();
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Just simulate a successful login/signup
            const originalText = authSubmitBtn.textContent;
            authSubmitBtn.textContent = 'Success!';
            authSubmitBtn.style.background = '#22c55e';
            setTimeout(() => {
                authModal.classList.remove('active');
                authSubmitBtn.textContent = originalText;
                authSubmitBtn.style.background = ''; // reset
                authForm.reset();
            }, 1000);
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });
});

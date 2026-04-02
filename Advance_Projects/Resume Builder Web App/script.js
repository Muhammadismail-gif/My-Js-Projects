// Resume Builder Application
class ResumeBuilder {
    constructor() {
        this.currentTemplate = 'modern';
        this.zoom = 1;
        this.data = {
            personal: {},
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: []
        };
        
        this.counters = {
            experience: 0,
            education: 0,
            projects: 0,
            certifications: 0
        };

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadExample(); // Load example data on start
        this.render();
    }

    cacheDOM() {
        // Template selector
        this.templateCards = document.querySelectorAll('.template-card');
        
        // Forms
        this.personalForm = document.getElementById('personalForm');
        this.fullName = document.getElementById('fullName');
        this.jobTitle = document.getElementById('jobTitle');
        this.email = document.getElementById('email');
        this.phone = document.getElementById('phone');
        this.location = document.getElementById('location');
        this.website = document.getElementById('website');
        this.summary = document.getElementById('summary');
        
        // Dynamic lists
        this.experienceList = document.getElementById('experienceList');
        this.educationList = document.getElementById('educationList');
        this.projectsList = document.getElementById('projectsList');
        this.certificationsList = document.getElementById('certificationsList');
        
        // Skills
        this.skillsInput = document.getElementById('skills');
        this.skillsPreview = document.getElementById('skillsPreview');
        
        // Buttons
        this.addExperienceBtn = document.getElementById('addExperience');
        this.addEducationBtn = document.getElementById('addEducation');
        this.addProjectBtn = document.getElementById('addProject');
        this.addCertificationBtn = document.getElementById('addCertification');
        this.downloadPdfBtn = document.getElementById('downloadPdf');
        this.loadExampleBtn = document.getElementById('loadExample');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Zoom
        this.zoomIn = document.getElementById('zoomIn');
        this.zoomOut = document.getElementById('zoomOut');
        this.zoomLevel = document.getElementById('zoomLevel');
        this.resumePreview = document.getElementById('resumePreview');
        
        // Templates for dynamic items
        this.expTemplate = document.getElementById('experienceFormTemplate');
        this.eduTemplate = document.getElementById('educationFormTemplate');
        this.projTemplate = document.getElementById('projectFormTemplate');
        this.certTemplate = document.getElementById('certificationFormTemplate');
    }

    bindEvents() {
        // Template selection
        this.templateCards.forEach(card => {
            card.addEventListener('click', () => {
                this.templateCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.currentTemplate = card.dataset.template;
                this.render();
            });
        });

        // Personal info changes
        this.personalForm.addEventListener('input', () => this.updatePersonal());
        
        // Add buttons
        this.addExperienceBtn.addEventListener('click', () => this.addExperience());
        this.addEducationBtn.addEventListener('click', () => this.addEducation());
        this.addProjectBtn.addEventListener('click', () => this.addProject());
        this.addCertificationBtn.addEventListener('click', () => this.addCertification());
        
        // Skills input
        this.skillsInput.addEventListener('input', () => this.updateSkills());
        
        // Download PDF
        this.downloadPdfBtn.addEventListener('click', () => this.downloadPDF());
        
        // Load example
        this.loadExampleBtn.addEventListener('click', () => this.loadExample());
        
        // Reset
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Zoom
        this.zoomIn.addEventListener('click', () => this.setZoom(this.zoom + 0.1));
        this.zoomOut.addEventListener('click', () => this.setZoom(this.zoom - 0.1));
        
        // Accordion
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                item.classList.toggle('active');
            });
        });
    }

    setZoom(value) {
        this.zoom = Math.max(0.5, Math.min(1.5, value));
        this.zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        this.resumePreview.style.transform = `scale(${this.zoom})`;
    }

    updatePersonal() {
        this.data.personal = {
            fullName: this.fullName.value,
            jobTitle: this.jobTitle.value,
            email: this.email.value,
            phone: this.phone.value,
            location: this.location.value,
            website: this.website.value,
            summary: this.summary.value
        };
        this.render();
    }

    updateSkills() {
        const value = this.skillsInput.value;
        this.data.skills = value.split(',').map(s => s.trim()).filter(s => s);
        this.renderSkillsPreview();
        this.render();
    }

    renderSkillsPreview() {
        this.skillsPreview.innerHTML = this.data.skills.map(skill => 
            `<span class="skill-tag">${this.escapeHtml(skill)}</span>`
        ).join('');
    }

    addExperience() {
        this.counters.experience++;
        const id = Date.now();
        const html = this.expTemplate.innerHTML
            .replace(/{id}/g, id)
            .replace(/{num}/g, this.counters.experience);
        
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstElementChild;
        this.experienceList.appendChild(element);
        
        // Bind inputs
        const inputs = element.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.collectExperience());
        });
        
        this.collectExperience();
    }

    addEducation() {
        this.counters.education++;
        const id = Date.now();
        const html = this.eduTemplate.innerHTML
            .replace(/{id}/g, id)
            .replace(/{num}/g, this.counters.education);
        
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstElementChild;
        this.educationList.appendChild(element);
        
        const inputs = element.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.collectEducation());
        });
        
        this.collectEducation();
    }

    addProject() {
        this.counters.projects++;
        const id = Date.now();
        const html = this.projTemplate.innerHTML
            .replace(/{id}/g, id)
            .replace(/{num}/g, this.counters.projects);
        
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstElementChild;
        this.projectsList.appendChild(element);
        
        const inputs = element.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.collectProjects());
        });
        
        this.collectProjects();
    }

    addCertification() {
        this.counters.certifications++;
        const id = Date.now();
        const html = this.certTemplate.innerHTML
            .replace(/{id}/g, id)
            .replace(/{num}/g, this.counters.certifications);
        
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstElementChild;
        this.certificationsList.appendChild(element);
        
        const inputs = element.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.collectCertifications());
        });
        
        this.collectCertifications();
    }

    removeItem(type, id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.remove();
            this[`collect${type.charAt(0).toUpperCase() + type.slice(1)}`]();
        }
    }

    collectExperience() {
        this.data.experience = [];
        this.experienceList.querySelectorAll('.dynamic-item').forEach(item => {
            this.data.experience.push({
                title: item.querySelector('.exp-title').value,
                company: item.querySelector('.exp-company').value,
                startDate: item.querySelector('.exp-start').value,
                endDate: item.querySelector('.exp-current').checked ? 'Present' : item.querySelector('.exp-end').value,
                description: item.querySelector('.exp-desc').value
            });
        });
        this.render();
    }

    collectEducation() {
        this.data.education = [];
        this.educationList.querySelectorAll('.dynamic-item').forEach(item => {
            this.data.education.push({
                degree: item.querySelector('.edu-degree').value,
                school: item.querySelector('.edu-school').value,
                date: item.querySelector('.edu-date').value,
                gpa: item.querySelector('.edu-gpa').value
            });
        });
        this.render();
    }

    collectProjects() {
        this.data.projects = [];
        this.projectsList.querySelectorAll('.dynamic-item').forEach(item => {
            this.data.projects.push({
                name: item.querySelector('.proj-name').value,
                tech: item.querySelector('.proj-tech').value,
                url: item.querySelector('.proj-url').value,
                description: item.querySelector('.proj-desc').value
            });
        });
        this.render();
    }

    collectCertifications() {
        this.data.certifications = [];
        this.certificationsList.querySelectorAll('.dynamic-item').forEach(item => {
            this.data.certifications.push({
                name: item.querySelector('.cert-name').value,
                org: item.querySelector('.cert-org').value,
                date: item.querySelector('.cert-date').value,
                id: item.querySelector('.cert-id').value
            });
        });
        this.render();
    }

    render() {
        const renderers = {
            modern: () => this.renderModern(),
            classic: () => this.renderClassic(),
            minimal: () => this.renderMinimal(),
            creative: () => this.renderCreative()
        };

        this.resumePreview.className = `resume-page template-${this.currentTemplate}`;
        this.resumePreview.innerHTML = renderers[this.currentTemplate]();
    }

    renderModern() {
        const p = this.data.personal;
        return `
            <div class="sidebar">
                <div class="name">${this.escapeHtml(p.fullName)}</div>
                <div class="title">${this.escapeHtml(p.jobTitle)}</div>
                <div class="contact-info">
                    ${p.email ? `<div class="contact-item">📧 ${this.escapeHtml(p.email)}</div>` : ''}
                    ${p.phone ? `<div class="contact-item">📱 ${this.escapeHtml(p.phone)}</div>` : ''}
                    ${p.location ? `<div class="contact-item">📍 ${this.escapeHtml(p.location)}</div>` : ''}
                    ${p.website ? `<div class="contact-item">🌐 ${this.escapeHtml(p.website)}</div>` : ''}
                </div>
                ${this.data.skills.length ? `
                    <div style="margin-top: 2rem;">
                        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem; text-transform: uppercase;">Skills</div>
                        <div class="skills-list">
                            ${this.data.skills.map(s => `<span class="skill-item">${this.escapeHtml(s)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="main-content">
                ${p.summary ? `
                    <div class="section-title">Professional Summary</div>
                    <div class="item-description">${this.formatText(p.summary)}</div>
                ` : ''}
                
                ${this.data.experience.length ? `
                    <div class="section-title">Work Experience</div>
                    ${this.data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-header-row">
                                <div>
                                    <div class="item-title">${this.escapeHtml(exp.title)}</div>
                                    <div class="item-subtitle">${this.escapeHtml(exp.company)}</div>
                                </div>
                                <div class="item-date">${this.formatDate(exp.startDate)} - ${this.formatDate(exp.endDate)}</div>
                            </div>
                            <div class="item-description">${this.formatText(exp.description)}</div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${this.data.education.length ? `
                    <div class="section-title">Education</div>
                    ${this.data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header-row">
                                <div>
                                    <div class="item-title">${this.escapeHtml(edu.degree)}</div>
                                    <div class="item-subtitle">${this.escapeHtml(edu.school)}</div>
                                </div>
                                <div class="item-date">${this.formatDate(edu.date)}</div>
                            </div>
                            ${edu.gpa ? `<div style="font-size: 0.875rem; color: #7f8c8d;">GPA: ${this.escapeHtml(edu.gpa)}</div>` : ''}
                        </div>
                    `).join('')}
                ` : ''}
                
                ${this.data.projects.length ? `
                    <div class="section-title">Projects</div>
                    ${this.data.projects.map(proj => `
                        <div class="experience-item">
                            <div class="item-title">${this.escapeHtml(proj.name)}</div>
                            <div class="item-subtitle">${this.escapeHtml(proj.tech)}</div>
                            ${proj.url ? `<div style="font-size: 0.875rem; color: #3498db;">${this.escapeHtml(proj.url)}</div>` : ''}
                            <div class="item-description" style="margin-top: 0.5rem;">${this.formatText(proj.description)}</div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${this.data.certifications.length ? `
                    <div class="section-title">Certifications</div>
                    ${this.data.certifications.map(cert => `
                        <div class="education-item">
                            <div class="item-title">${this.escapeHtml(cert.name)}</div>
                            <div class="item-subtitle">${this.escapeHtml(cert.org)} • ${this.formatDate(cert.date)}</div>
                            ${cert.id ? `<div style="font-size: 0.875rem; color: #7f8c8d;">ID: ${this.escapeHtml(cert.id)}</div>` : ''}
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;
    }

    renderClassic() {
        const p = this.data.personal;
        return `
            <div class="header">
                <div class="name">${this.escapeHtml(p.fullName)}</div>
                <div class="title">${this.escapeHtml(p.jobTitle)}</div>
                <div class="contact-row">
                    ${p.email ? this.escapeHtml(p.email) : ''}
                    ${p.phone ? ` • ${this.escapeHtml(p.phone)}` : ''}
                    ${p.location ? ` • ${this.escapeHtml(p.location)}` : ''}
                    ${p.website ? ` • ${this.escapeHtml(p.website)}` : ''}
                </div>
            </div>
            
            ${p.summary ? `
                <div class="section-title">Professional Summary</div>
                <div class="item-description">${this.formatText(p.summary)}</div>
            ` : ''}
            
            ${this.data.experience.length ? `
                <div class="section-title">Professional Experience</div>
                ${this.data.experience.map(exp => `
                    <div class="experience-item">
                        <div class="item-header-classic">
                            <div>
                                <div class="item-title">${this.escapeHtml(exp.title)}</div>
                                <div class="item-subtitle">${this.escapeHtml(exp.company)}</div>
                            </div>
                            <div class="item-date">${this.formatDate(exp.startDate)} - ${this.formatDate(exp.endDate)}</div>
                        </div>
                        <div class="item-description">${this.formatText(exp.description)}</div>
                    </div>
                `).join('')}
            ` : ''}
            
            ${this.data.education.length ? `
                <div class="section-title">Education</div>
                ${this.data.education.map(edu => `
                    <div class="education-item">
                        <div class="item-header-classic">
                            <div class="item-title">${this.escapeHtml(edu.degree)}</div>
                            <div class="item-date">${this.formatDate(edu.date)}</div>
                        </div>
                        <div class="item-subtitle">${this.escapeHtml(edu.school)}${edu.gpa ? `, GPA: ${this.escapeHtml(edu.gpa)}` : ''}</div>
                    </div>
                `).join('')}
            ` : ''}
            
            ${this.data.skills.length ? `
                <div class="section-title">Skills</div>
                <div class="item-description">${this.data.skills.join(', ')}</div>
            ` : ''}
            
            ${this.data.projects.length ? `
                <div class="section-title">Selected Projects</div>
                ${this.data.projects.map(proj => `
                    <div class="experience-item">
                        <div class="item-title">${this.escapeHtml(proj.name)} (${this.escapeHtml(proj.tech)})</div>
                        ${proj.url ? `<div style="font-style: italic; color: #666; margin-bottom: 0.5rem;">${this.escapeHtml(proj.url)}</div>` : ''}
                        <div class="item-description">${this.formatText(proj.description)}</div>
                    </div>
                `).join('')}
            ` : ''}
        `;
    }

    renderMinimal() {
        const p = this.data.personal;
        return `
            <div class="header">
                <div class="name">${this.escapeHtml(p.fullName)}</div>
                <div class="title">${this.escapeHtml(p.jobTitle)}</div>
                <div class="contact-grid">
                    ${p.email ? `<div>${this.escapeHtml(p.email)}</div>` : ''}
                    ${p.phone ? `<div>${this.escapeHtml(p.phone)}</div>` : ''}
                    ${p.location ? `<div>${this.escapeHtml(p.location)}</div>` : ''}
                    ${p.website ? `<div>${this.escapeHtml(p.website)}</div>` : ''}
                </div>
            </div>
            
            ${p.summary ? `
                <div class="section-title">About</div>
                <div class="item-description">${this.formatText(p.summary)}</div>
            ` : ''}
            
            ${this.data.experience.length ? `
                <div class="section-title">Experience</div>
                ${this.data.experience.map(exp => `
                    <div class="experience-item">
                        <div class="item-date-col">${this.formatDate(exp.startDate)}<br>${this.formatDate(exp.endDate)}</div>
                        <div class="item-content">
                            <h4>${this.escapeHtml(exp.title)}</h4>
                            <div class="subtitle">${this.escapeHtml(exp.company)}</div>
                            <div class="item-description">${this.formatText(exp.description)}</div>
                        </div>
                    </div>
                `).join('')}
            ` : ''}
            
            ${this.data.education.length ? `
                <div class="section-title">Education</div>
                ${this.data.education.map(edu => `
                    <div class="education-item">
                        <div class="item-date-col">${this.formatDate(edu.date)}</div>
                        <div class="item-content">
                            <h4>${this.escapeHtml(edu.degree)}</h4>
                            <div class="subtitle">${this.escapeHtml(edu.school)}${edu.gpa ? ` • GPA: ${this.escapeHtml(edu.gpa)}` : ''}</div>
                        </div>
                    </div>
                `).join('')}
            ` : ''}
            
            ${this.data.skills.length ? `
                <div class="section-title">Skills</div>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.9375rem;">
                    ${this.data.skills.map(s => `<span>${this.escapeHtml(s)}</span>`).join(' • ')}
                </div>
            ` : ''}
        `;
    }

    renderCreative() {
        const p = this.data.personal;
        return `
            <div class="accent-bar">
                <div class="profile-section">
                    <div class="avatar">👤</div>
                    <div class="name">${this.escapeHtml(p.fullName)}</div>
                    <div class="title">${this.escapeHtml(p.jobTitle)}</div>
                </div>
                <div class="contact-creative">
                    ${p.email ? `<div class="contact-item">✉️ ${this.escapeHtml(p.email)}</div>` : ''}
                    ${p.phone ? `<div class="contact-item">📞 ${this.escapeHtml(p.phone)}</div>` : ''}
                    ${p.location ? `<div class="contact-item">📍 ${this.escapeHtml(p.location)}</div>` : ''}
                    ${p.website ? `<div class="contact-item">🌐 ${this.escapeHtml(p.website)}</div>` : ''}
                </div>
                ${this.data.skills.length ? `
                    <div style="margin-top: 2rem;">
                        <div style="font-weight: 700; margin-bottom: 1rem; text-transform: uppercase; font-size: 0.875rem; opacity: 0.9;">Expertise</div>
                        <div class="skills-creative">
                            ${this.data.skills.map(s => `<span class="skill-tag">${this.escapeHtml(s)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="main-area">
                ${p.summary ? `
                    <div class="section-title">Profile</div>
                    <div class="item-description" style="line-height: 1.8; color: #555; margin-bottom: 2rem;">${this.formatText(p.summary)}</div>
                ` : ''}
                
                ${this.data.experience.length ? `
                    <div class="section-title">Experience</div>
                    ${this.data.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-title">${this.escapeHtml(exp.title)}</div>
                            <div class="item-subtitle">${this.escapeHtml(exp.company)}</div>
                            <div class="item-date">${this.formatDate(exp.startDate)} — ${this.formatDate(exp.endDate)}</div>
                            <div class="item-description" style="margin-top: 0.75rem; line-height: 1.7;">${this.formatText(exp.description)}</div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${this.data.education.length ? `
                    <div class="section-title">Education</div>
                    ${this.data.education.map(edu => `
                        <div class="education-item">
                            <div class="item-title">${this.escapeHtml(edu.degree)}</div>
                            <div class="item-subtitle">${this.escapeHtml(edu.school)}</div>
                            <div class="item-date">${this.formatDate(edu.date)}${edu.gpa ? ` • GPA: ${this.escapeHtml(edu.gpa)}` : ''}</div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${this.data.projects.length ? `
                    <div class="section-title">Projects</div>
                    ${this.data.projects.map(proj => `
                        <div class="experience-item">
                            <div class="item-title">${this.escapeHtml(proj.name)}</div>
                            <div class="item-subtitle">${this.escapeHtml(proj.tech)}</div>
                            ${proj.url ? `<div style="font-size: 0.875rem; color: #e74c3c; margin: 0.25rem 0;">${this.escapeHtml(proj.url)}</div>` : ''}
                            <div class="item-description" style="margin-top: 0.5rem;">${this.formatText(proj.description)}</div>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;
    }

    formatText(text) {
        if (!text) return '';
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    formatDate(dateStr) {
        if (!dateStr || dateStr === 'Present') return dateStr || '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadPDF() {
        const element = this.resumePreview;
        const opt = {
            margin: 0,
            filename: `${this.data.personal.fullName || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };

        // Show loading state
        this.downloadPdfBtn.innerHTML = '<span>⏳</span> Generating...';
        this.downloadPdfBtn.disabled = true;

        html2pdf().set(opt).from(element).save().then(() => {
            this.downloadPdfBtn.innerHTML = '<span>⬇️</span> Download PDF';
            this.downloadPdfBtn.disabled = false;
        });
    }

    loadExample() {
        // Example data
        this.fullName.value = 'Sarah Johnson';
        this.jobTitle.value = 'Senior Full Stack Developer';
        this.email.value = 'sarah.johnson@email.com';
        this.phone.value = '+1 (555) 123-4567';
        this.location.value = 'San Francisco, CA';
        this.website.value = 'https://sarahjohnson.dev';
        this.summary.value = 'Passionate full-stack developer with 6+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies. Proven track record of leading teams and delivering high-impact projects for Fortune 500 companies.';

        this.updatePersonal();

        // Add example experience
        this.addExperience();
        const exp1 = this.experienceList.lastElementChild;
        exp1.querySelector('.exp-title').value = 'Senior Full Stack Developer';
        exp1.querySelector('.exp-company').value = 'TechCorp Inc.';
        exp1.querySelector('.exp-start').value = '2021-03';
        exp1.querySelector('.exp-end').value = '';
        exp1.querySelector('.exp-current').checked = true;
        exp1.querySelector('.exp-desc').value = '• Lead development of microservices architecture serving 2M+ users\n• Reduced application load time by 40% through optimization initiatives\n• Mentored team of 5 junior developers and conducted code reviews';

        this.addExperience();
        const exp2 = this.experienceList.lastElementChild;
        exp2.querySelector('.exp-title').value = 'Full Stack Developer';
        exp2.querySelector('.exp-company').value = 'StartupXYZ';
        exp2.querySelector('.exp-start').value = '2018-06';
        exp2.querySelector('.exp-end').value = '2021-02';
        exp2.querySelector('.exp-desc').value = '• Built responsive React frontend and Node.js REST APIs\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Designed MongoDB database schemas handling 10M+ records';

        this.collectExperience();

        // Add example education
        this.addEducation();
        const edu1 = this.educationList.lastElementChild;
        edu1.querySelector('.edu-degree').value = 'B.S. in Computer Science';
        edu1.querySelector('.edu-school').value = 'University of California, Berkeley';
        edu1.querySelector('.edu-date').value = '2018-05';
        edu1.querySelector('.edu-gpa').value = '3.8/4.0';
        this.collectEducation();

        // Add skills
        this.skillsInput.value = 'JavaScript, React, Node.js, Python, AWS, Docker, MongoDB, PostgreSQL, GraphQL, TypeScript, Git, Agile/Scrum';
        this.updateSkills();

        // Add example project
        this.addProject();
        const proj1 = this.projectsList.lastElementChild;
        proj1.querySelector('.proj-name').value = 'E-Commerce Platform';
        proj1.querySelector('.proj-tech').value = 'React, Node.js, MongoDB, Stripe';
        proj1.querySelector('.proj-url').value = 'https://github.com/sarahj/ecommerce-platform';
        proj1.querySelector('.proj-desc').value = 'Full-featured online store with payment processing, inventory management, and real-time analytics dashboard. Handles 10K+ daily transactions.';
        this.collectProjects();

        // Add certification
        this.addCertification();
        const cert1 = this.certificationsList.lastElementChild;
        cert1.querySelector('.cert-name').value = 'AWS Solutions Architect Professional';
        cert1.querySelector('.cert-org').value = 'Amazon Web Services';
        cert1.querySelector('.cert-date').value = '2023-08';
        cert1.querySelector('.cert-id').value = 'AWS-SAP-12345';
        this.collectCertifications();

        // Open first accordion
        document.querySelector('.accordion-item').classList.add('active');
    }

    reset() {
        if (confirm('Are you sure you want to clear all data?')) {
            // Clear personal info
            this.personalForm.reset();
            this.data.personal = {};
            
            // Clear dynamic lists
            this.experienceList.innerHTML = '';
            this.educationList.innerHTML = '';
            this.projectsList.innerHTML = '';
            this.certificationsList.innerHTML = '';
            this.data.experience = [];
            this.data.education = [];
            this.data.projects = [];
            this.data.certifications = [];
            
            // Reset counters
            this.counters = { experience: 0, education: 0, projects: 0, certifications: 0 };
            
            // Clear skills
            this.skillsInput.value = '';
            this.data.skills = [];
            this.skillsPreview.innerHTML = '';
            
            this.render();
        }
    }
}

// Initialize
const app = new ResumeBuilder();
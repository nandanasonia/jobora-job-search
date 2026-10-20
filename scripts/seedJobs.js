// scripts/seedJobs.js
// Seeds the MongoDB database with 15 clearly labelled demo job listings.
// This script is IDEMPOTENT: it checks for existing demo listings before inserting,
// so running it multiple times will NOT create duplicate records.
//
// Run with:  npm run seed
//
// IMPORTANT: These are DEMO listings created for classroom demonstration purposes.
// They are NOT real job vacancies. Do not apply to these listings.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Job = require('../models/Job');

const DEMO_JOBS = [
  {
    title: 'Frontend Developer',
    company: 'TechNova Solutions',
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Fresher / Entry-level',
    description: 'Join TechNova Solutions as a Frontend Developer and help build modern, responsive web interfaces for our suite of SaaS products. You will collaborate with UI/UX designers and backend engineers to deliver excellent user experiences.',
    responsibilities: '- Build and maintain responsive web interfaces using HTML, CSS, and JavaScript.\n- Collaborate with designers to translate Figma mockups into working UI.\n- Write clean, maintainable, and well-documented code.\n- Participate in code reviews and team stand-ups.\n- Optimize frontend performance and accessibility.',
    qualifications: 'B.Tech/B.E. in Computer Science, IT, or related field. 0–2 years of experience. Familiarity with version control (Git) is a plus.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'REST APIs'],
    salaryMin: 400000,
    salaryMax: 700000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'TechNova Solutions is a fast-growing SaaS company headquartered in Bengaluru, building productivity tools for enterprises.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: 'Backend Developer Intern',
    company: 'CloudBridge Technologies',
    location: 'Hyderabad, Telangana',
    workMode: 'Remote',
    employmentType: 'Internship',
    experienceLevel: 'Internship',
    description: 'We are looking for a motivated Backend Developer Intern to join our engineering team. You will get hands-on experience with Node.js, Express, and MongoDB while working on real product features.',
    responsibilities: '- Develop and test RESTful API endpoints using Node.js and Express.\n- Work with MongoDB for data persistence.\n- Write unit tests for backend modules.\n- Attend weekly sync meetings and submit progress reports.',
    qualifications: 'Currently pursuing B.Tech (3rd or 4th year). Basic knowledge of JavaScript and databases required.',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    salaryMin: 15000,
    salaryMax: 25000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'CloudBridge Technologies builds cloud infrastructure solutions for mid-market businesses across India.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    title: 'Full Stack Developer',
    company: 'Innovatech Pvt. Ltd.',
    location: 'Pune, Maharashtra',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experienceLevel: 'Junior',
    description: 'Innovatech is hiring a Full Stack Developer to work on our flagship e-commerce platform. The role involves developing both frontend features (React) and backend services (Node.js/MongoDB).',
    responsibilities: '- Develop full-stack features end-to-end.\n- Maintain and improve the existing Node.js/MongoDB backend.\n- Integrate third-party payment and shipping APIs.\n- Participate in sprint planning and retrospectives.',
    qualifications: '1–3 years of experience with full-stack JavaScript development. Degree in CS/IT preferred.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Docker', 'AWS'],
    salaryMin: 600000,
    salaryMax: 1000000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'Innovatech Pvt. Ltd. powers e-commerce solutions for over 500 retailers across India.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Data Analyst',
    company: 'InsightEdge Analytics',
    location: 'Chennai, Tamil Nadu',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Fresher / Entry-level',
    description: 'InsightEdge Analytics is seeking a Data Analyst to help clients make data-driven decisions. You will work with large datasets, build dashboards, and communicate insights to non-technical stakeholders.',
    responsibilities: '- Collect, clean, and analyse large datasets.\n- Build dashboards and reports using Tableau or Power BI.\n- Present findings to business teams.\n- Identify trends and anomalies in data.',
    qualifications: 'Degree in Statistics, Mathematics, CS, or IT. Strong analytical thinking and attention to detail.',
    skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
    salaryMin: 350000,
    salaryMax: 600000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'InsightEdge Analytics is a data consultancy firm serving clients in BFSI, healthcare, and retail sectors.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'UI/UX Design Intern',
    company: 'PixelCraft Studios',
    location: 'Mumbai, Maharashtra',
    workMode: 'Remote',
    employmentType: 'Internship',
    experienceLevel: 'Internship',
    description: 'PixelCraft Studios is looking for a creative UI/UX Design Intern to assist in designing intuitive, beautiful digital products. You will work directly with senior designers on live client projects.',
    responsibilities: '- Create wireframes, prototypes, and high-fidelity mockups in Figma.\n- Conduct user research and usability testing.\n- Collaborate with developers during handoff.\n- Iterate designs based on feedback.',
    qualifications: 'Currently pursuing a degree in Design, IT, or CS. A portfolio of design work is preferred.',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping'],
    salaryMin: 10000,
    salaryMax: 18000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'PixelCraft Studios is a boutique digital design agency working with startups and mid-size companies.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'DevOps Engineer',
    company: 'Scalepath Infrastructure',
    location: 'Bengaluru, Karnataka',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    description: 'We are seeking a DevOps Engineer to streamline our CI/CD pipelines, manage cloud infrastructure on AWS, and improve system reliability and deployment automation.',
    responsibilities: '- Design and maintain CI/CD pipelines using Jenkins and GitHub Actions.\n- Manage AWS infrastructure (EC2, RDS, S3, EKS).\n- Monitor system health and respond to incidents.\n- Automate infrastructure provisioning with Terraform.',
    qualifications: '2–4 years of DevOps/SRE experience. AWS certification is a plus.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'CI/CD'],
    salaryMin: 900000,
    salaryMax: 1400000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'Scalepath Infrastructure provides managed cloud services and DevOps consulting to technology companies.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Android Developer',
    company: 'MobiCore Apps',
    location: 'Delhi NCR',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Junior',
    description: 'MobiCore Apps is hiring an Android Developer to build and maintain native Android applications for millions of users. You will work in an agile team and contribute to the entire app lifecycle.',
    responsibilities: '- Develop and ship features for our Android applications.\n- Write clean, testable Kotlin/Java code.\n- Collaborate with the backend team to integrate REST APIs.\n- Publish updates to the Google Play Store.',
    qualifications: '1–2 years of Android development experience. Knowledge of Kotlin preferred.',
    skills: ['Kotlin', 'Java', 'Android SDK', 'REST APIs', 'Git', 'Firebase'],
    salaryMin: 500000,
    salaryMax: 900000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'MobiCore Apps develops consumer-facing mobile applications with over 2 million downloads on the Play Store.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Machine Learning Engineer',
    company: 'AISprint Labs',
    location: 'Bengaluru, Karnataka',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    description: 'AISprint Labs is looking for an ML Engineer to build, train, and deploy production machine learning models. You will work on NLP and computer vision problems for our enterprise clients.',
    responsibilities: '- Design and implement ML models for real-world problems.\n- Preprocess and manage large training datasets.\n- Deploy models to production using FastAPI and Docker.\n- Monitor model performance and retrain as needed.',
    qualifications: '2–5 years of ML engineering experience. Strong Python and maths background required.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLOps', 'Docker', 'NLP'],
    salaryMin: 1200000,
    salaryMax: 2000000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'AISprint Labs builds applied AI solutions for industries including healthcare, finance, and logistics.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'QA Engineer – Manual & Automation',
    company: 'QualityFirst Software',
    location: 'Hyderabad, Telangana',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experienceLevel: 'Fresher / Entry-level',
    description: 'QualityFirst Software is hiring a QA Engineer to test web and mobile applications manually and through automation. You will work closely with developers to ensure product quality.',
    responsibilities: '- Write and execute manual test cases.\n- Develop automated test scripts using Selenium or Cypress.\n- Report and track bugs in JIRA.\n- Participate in sprint reviews and demos.',
    qualifications: 'Degree in CS/IT. Exposure to Selenium or any automation framework is a plus.',
    skills: ['Manual Testing', 'Selenium', 'Cypress', 'JIRA', 'SQL', 'API Testing'],
    salaryMin: 300000,
    salaryMax: 500000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'QualityFirst Software specializes in software testing services for web and mobile product companies.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Cybersecurity Analyst',
    company: 'SecureNet India',
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Junior',
    description: 'SecureNet India is looking for a Cybersecurity Analyst to monitor networks, investigate threats, and improve our clients' security posture. This is a great role for someone passionate about ethical hacking and threat intelligence.',
    responsibilities: '- Monitor SIEM dashboards for security incidents.\n- Perform vulnerability assessments and penetration testing.\n- Create and maintain security documentation.\n- Respond to and investigate security alerts.',
    qualifications: 'B.Tech in CS/IT/Cybersecurity. CEH or CompTIA Security+ certification is a plus.',
    skills: ['Network Security', 'SIEM', 'Penetration Testing', 'Linux', 'Python', 'Wireshark'],
    salaryMin: 500000,
    salaryMax: 850000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'SecureNet India provides managed security operations, compliance consulting, and penetration testing services.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Cloud Solutions Architect',
    company: 'NimbusCloud Pvt. Ltd.',
    location: 'Pune, Maharashtra',
    workMode: 'Remote',
    employmentType: 'Contract',
    experienceLevel: 'Senior',
    description: 'NimbusCloud is seeking a Cloud Solutions Architect on a 6-month contract basis to design cloud-native architectures for large enterprise clients migrating to AWS and Azure.',
    responsibilities: '- Design scalable, fault-tolerant cloud architectures.\n- Advise clients on cloud migration strategy.\n- Review and audit existing infrastructure.\n- Create architecture documentation and cost estimates.',
    qualifications: '5+ years of cloud architecture experience. AWS Solutions Architect or Azure certifications strongly preferred.',
    skills: ['AWS', 'Azure', 'Kubernetes', 'Microservices', 'Terraform', 'Security', 'Networking'],
    salaryMin: 1800000,
    salaryMax: 2800000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'NimbusCloud Pvt. Ltd. is a cloud consulting firm helping enterprises modernize their IT infrastructure.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Product Manager – EdTech',
    company: 'LearnSphere Technologies',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    description: 'LearnSphere Technologies is hiring a Product Manager to lead the development of our online learning platform. You will define the product roadmap, gather requirements, and work with engineering and design teams.',
    responsibilities: '- Define and prioritize the product backlog.\n- Conduct user interviews and usability studies.\n- Write detailed user stories and acceptance criteria.\n- Coordinate releases with engineering and QA teams.',
    qualifications: '3–5 years of product management experience, ideally in EdTech or SaaS. MBA is a plus.',
    skills: ['Product Roadmap', 'User Research', 'JIRA', 'Agile', 'Analytics', 'Stakeholder Management'],
    salaryMin: 1000000,
    salaryMax: 1600000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'LearnSphere Technologies is an EdTech company offering skill-based online courses to over 1 million learners.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Technical Content Writer',
    company: 'DocuFlow Media',
    location: 'Chennai, Tamil Nadu',
    workMode: 'Remote',
    employmentType: 'Part-time',
    experienceLevel: 'Fresher / Entry-level',
    description: 'DocuFlow Media is looking for a Technical Content Writer to create developer-facing documentation, blog posts, and tutorials. Prior exposure to programming or IT is essential.',
    responsibilities: '- Write clear, accurate technical documentation and API guides.\n- Create beginner-friendly tutorials on web development topics.\n- Edit and proofread existing documentation.\n- Work with the engineering team to understand product features.',
    qualifications: 'Degree in CS/IT/English. Excellent written English. Ability to explain technical concepts clearly.',
    skills: ['Technical Writing', 'Markdown', 'REST APIs', 'Git', 'Documentation'],
    salaryMin: null,
    salaryMax: null,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'DocuFlow Media produces technical content for developer tools, SaaS products, and open-source projects.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'React Native Developer',
    company: 'FusionApps Studio',
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Junior',
    description: 'FusionApps Studio is hiring a React Native Developer to build cross-platform mobile applications for iOS and Android. You will work on exciting consumer apps used by thousands of users daily.',
    responsibilities: '- Build and maintain React Native applications for iOS and Android.\n- Integrate REST APIs and third-party SDKs.\n- Collaborate with UI/UX designers.\n- Optimize app performance and troubleshoot issues.',
    qualifications: '1–3 years of React Native or mobile development experience.',
    skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Redux', 'REST APIs', 'Firebase'],
    salaryMin: 600000,
    salaryMax: 1000000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'FusionApps Studio is a mobile-first product company with apps across fitness, finance, and lifestyle domains.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Database Administrator',
    company: 'DataVault Systems',
    location: 'Mumbai, Maharashtra',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    description: 'DataVault Systems is looking for an experienced Database Administrator to manage, optimize, and secure our PostgreSQL and MongoDB databases that support mission-critical financial applications.',
    responsibilities: '- Administer and monitor PostgreSQL and MongoDB databases.\n- Design backup, recovery, and high-availability strategies.\n- Optimize slow queries and improve database performance.\n- Implement security policies and access controls.',
    qualifications: '3–5 years of DBA experience. Knowledge of both SQL and NoSQL databases is required.',
    skills: ['PostgreSQL', 'MongoDB', 'MySQL', 'Database Design', 'Performance Tuning', 'Linux', 'Backup & Recovery'],
    salaryMin: 800000,
    salaryMax: 1300000,
    currency: 'INR',
    applicationUrl: null,
    companyInfo: 'DataVault Systems provides data management and analytics infrastructure for financial institutions.',
    source: 'Demo',
    isDemo: true,
    isActive: true,
    postedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  }
];

async function seedJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const jobData of DEMO_JOBS) {
      // Check if a demo job with this title and company already exists
      const existing = await Job.findOne({
        title: jobData.title,
        company: jobData.company,
        isDemo: true
      });

      if (existing) {
        console.log(`⏭  Skipping (already exists): ${jobData.title} @ ${jobData.company}`);
        skippedCount++;
      } else {
        await Job.create(jobData);
        console.log(`✅ Inserted: ${jobData.title} @ ${jobData.company}`);
        insertedCount++;
      }
    }

    console.log('\n─────────────────────────────────────');
    console.log(`📋 Seed complete: ${insertedCount} inserted, ${skippedCount} skipped.`);
    console.log('⚠️  All inserted listings are DEMO data — not real job vacancies.');
    console.log('─────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedJobs();

## SkillSense: AI-Powered Skill Discovery Platform

**[➡️ View Live Demo](https://latent-glow.lovable.app/)**


SkillSense is an AI-powered application designed to revolutionize how professionals discover, validate, and articulate their skills. Our mission is to empower you to translate your entire career history into a clear, evidence-based skill profile, helping you navigate your career path with confidence.

In a world shifting from credential-based hiring to skills-based talent management, SkillSense addresses a critical gap: many valuable skills acquired through projects, mentorship, and informal learning go unnoticed. Our platform aggregates data from multiple sources to uncover both explicit and implicit expertise, providing actionable insights for career growth.

# ✨ Core Features

🧠 Multi-Source Data Aggregation: Connect your CV, GitHub profile, and internal documents (like performance reviews and goals) to build a single, unified view of your professional identity.

🤖 AI-Powered Skill Extraction: Our NLP engine uses semantic analysis to identify not just the skills you list, but also the skills you demonstrate through your work and contributions.

📊 Dynamic Skill Profiles: Explore your capabilities through an interactive dashboard, complete with confidence scores, evidence trails, and skill categorization.

🎯 Skill Gap Analysis: Paste any job description to instantly compare your profile, identify matching skills, discover gaps, and see what makes you a unique candidate.

✍️ AI-Powered Resume Enhancement: Generate a professional summary and tailored resume bullet points optimized for specific job applications, all based on your validated skill profile.

📈 Skills Development Timeline: Visualize your skill acquisition and growth over time, with milestones automatically generated from the evidence in your data.

✅ Hallucination Removal & Validation: Manually review, edit, confirm, or reject AI-identified skills to ensure your profile is 100% accurate and reflects your true expertise.

## 🏗️ System Architecture

![SkillSense System Architecture & Data Flow]## 🏗️ System Architecture

![SkillSense System Architecture & Data Flow](https://raw.githubusercontent.com/Pakeeza1508/Hack-NationAI-Skill-Sense-/main/assets/image.png)
# 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites

Node.js & npm: (v18 or higher recommended). You can use nvm to manage Node versions.

Supabase Account: You will need a free account at supabase.com to create a database and get your API keys.
```
1. Clone the Repository

git clone https://github.com/Pakeeza1508/Hack-NationAI-Skill-Sense-.git
cd Hack-NationAI-Skill-Sense-
```

2. Install Dependencies
```
npm install
```
3. Set Up Environment Variables
```
Create a new file named .env in the root of the project.
```


# .env.example
```
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_ANON_KEY"

VITE_SUPABASE_URL is your Project URL.

VITE_SUPABASE_PUBLISHABLE_KEY is your anon public key.
```
4. Set Up Supabase Backend
```
npx supabase db push
```
5. Run the Development Server
```
You are now ready to start the application!

npm run dev

Open http://localhost:8080 to view the application in your browser.
```
# 🛠️ Technology Stack
```
Frontend:

Framework: React 18 with Vite

Language: TypeScript

Styling: Tailwind CSS

UI Components: shadcn/ui

Routing: React Router

State Management: React Query for server state
```
```
Backend:

Platform: Supabase

Database: PostgreSQL

Serverless Functions: Supabase Edge Functions (Deno runtime)

Authentication: Supabase Auth
```
```
AI & NLP:

Provider: Google Gemini via Lovable AI Gateway

External APIs: GitHub API, Firecrawl API (for LinkedIn scraping)
```
# 🗺️ Roadmap & Future Work

While the core MVP is functional, here are some features planned for future development:

Implement AI Feedback Loop: Use the validated_skills data to refine future AI analyses.

Personalized Learning Recommendations: Suggest courses or projects based on identified skill gaps.

Team & Organization Features: Allow users to form teams, find internal experts, and analyze collective skill gaps.

Public Profile Sharing: Implement privacy controls to allow users to share a public, read-only version of their skill profile.

SFIA Framework Visualization: Display the SFIA proficiency levels and categories for each skill in the UI.

# 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
```
Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request
```
# 📄 License

Distributed under the MIT License. See LICENSE for more information.
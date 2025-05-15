# **FAMUnite**

## 🚀 About the Project

FAMUnite is a two-semester Software Design & Development capstone built at Florida A&M University. It centralizes campus events, club announcements, and partner programs into one intuitive, mobile-friendly platform.

### Key Contributions (Jan ’25 – May ’25)
- **Frontend Architecture:** Led React.js development with a focus on clean, reusable components, mobile responsiveness, and WCAG-aligned accessibility.  
- **Role-Based Dashboards:** Built dynamic views that adapt to user roles (student, organizer, moderator), using conditional rendering for personalized content.  
- **Search & Filter:** Engineered robust search and multi-criteria filtering (by date, category, organization) to surface relevant events quickly and streamline user workflows.  
- **Real-Time Data Sync:** Integrated Firebase Firestore for secure user authentication and live updates of events, registrations, and announcements.  

### System Design & Project Management (Aug ’24 – Dec ’24)
- **Team Leadership:** Served as project manager for Phase I—coordinated a 5-person team, managed sprints, delegated tasks, and tracked progress.  
- **UX/UI Prototyping:** Created low- and high-fidelity wireframes in Figma, conducted competitor analyses, and defined core user journeys to inform our design roadmap.  
- **Data Modeling:** Developed Firestore collection relationship diagrams and an Entity–Relationship Diagram (ERD) to organize data schemas

## 🛠️ Features
- 📅 **Event Calendar**: View all upcoming campus events in one place.
- 🔔 **Announcements**: Receive announcements for registered or saved events.
- 📌 **Event Management & Registration**: Easily manage & register for events with a single click.
- 💾 **Save Events**: Bookmark events to view later.



## 📷 Screenshots

### Presentation Version 05/01
- Completed over 80% of design specification features (See documentation/FAMUnite Specification.pdf for full list)
![FAMUnite Presentation Version](documentation/FAMUnitePresentationVersion.gif)

### Updated Version 05/15
- **Refactored & Consolidated**: Moved event logic into unified components (EventCard) and merged similar cards to reduce redundancy and improve maintainability, created global stylesheets
- **Enhanced UI/UX & Styling**: Introduced neumorphic design across the login/signup flow, polished event review pages, and fixed layout overlaps for a smoother experience.
- **Expanded Data Integration**: Cleaned up Firebase data for more reliable event sourcing.
- **Advanced Filtering & Analytics**: Implemented date sorting, category/organization filters, and enhanced registration analytics for deeper insights into user engagement.
![FAMUnite Updated Version](documentation/FAMUniteUpdate0515.gif)

### Next Steps
- Clean up files and remove redundant/unused code
- Full mobile responsiveness and WCAG compliance
- Move the backend code to separate Java files
- Upgrade Event and Event Feedback Moderation Experience
- Upgrade Admin Dashboard (user management)
- Upgrade Event Analytics 
- Upgrade Event Page (saved event page, all event page for organization liaison, upgrade filter UI)
- Upgrade Profile (allow students to change interests
- Migrate and Fix Message components onto the message page

## 🧰 Tech Stack
- **IDE & Frameworks**: IntelliJ, Vite, React
- **Backen & Database**: Firebase Authentication / Firestore
- **Design**: Figma
- **Languages**: HTML, CSS, JavaScript
- **API Platform**: Postman

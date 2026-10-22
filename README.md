# InternHub — Responsive Internship Board

A LinkedIn-inspired, three-column internship discovery interface built for the EdVyro Full Stack Development assignment using plain HTML, CSS and JavaScript.

## Features
- Responsive three-column desktop layout with profile, feed and career-tip sidebars
- Search by internship title, domain, mode, location, ID or skills
- Domain and work-mode filters, quick domain chips and reset button
- Dynamically rendered cards from `internships.json`
- Save/bookmark internships with browser `localStorage`
- Empty states and JSON loading/validation error handling
- Semantic HTML, labelled form controls, keyboard focus styles and live result announcements
- No frontend framework or build step

## Project files
- `index.html` — semantic page structure
- `style.css` — responsive LinkedIn-inspired visual design
- `script.js` — data loading, filtering, rendering and bookmarks
- `internships.json` — fictional sample records

## Run locally
Because the app loads JSON with `fetch()`, run it through a local server rather than opening `index.html` directly.

### VS Code Live Server
1. Open this folder in VS Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

## Test checklist
- Search for `Frontend`, `Linux`, and `Python`
- Select each domain and work mode
- Combine search and filters
- Click **Reset**
- Save and unsave a role; refresh to verify saved items persist
- Temporarily rename `internships.json` to test the error state, then restore it
- Test at 360px, 768px, and a desktop width
- Navigate with Tab and Shift+Tab; use Enter/Space on controls

## Deploy with GitHub Pages
1. Create a public GitHub repository.
2. Upload all project files to the repository root.
3. Open **Settings → Pages**.
4. Under build/deployment, choose **Deploy from a branch**.
5. Choose `main` and `/ (root)`, then save.
6. Wait for the published site URL to appear in the Pages settings.
7. Add screenshots and the deployed URL to this README before submission.

## Data note
The sample internships are fictional demonstration records. This project is not affiliated with LinkedIn and does not submit real applications.

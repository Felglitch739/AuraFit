# 🧠 **Aurafit — Development Checklist**

## 👥 **Team**

- 🧩 **Backend:** Eduardo Lorenzo
- 🎨 **Frontend:** Felix Martinez

---

# 🔴 **PHASE 1 — PROJECT SETUP**

## ⚙️ Environment & Base Setup

- [x] ## Initialize Laravel + Inertia + React (TypeScript)

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Create the base project with modern stack ready to build on.
    **📝 Tasks:**
    - Create new Laravel project
    - Install Inertia.js (React adapter)
    - Configure React with TypeScript (TSX)
    - Ensure Vite is running correctly
      **✅ Done When:**
    - App runs in browser
    - Default Inertia page renders without errors

---

- [x] ## Install TailwindCSS + Enable Dark Mode

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Establish UI foundation with dark theme by default
    **📝 Tasks:**
    - Install TailwindCSS
    - Enable dark mode using `class`
    - Configure base styles (background, text, spacing)
      **✅ Done When:**
    - Dark UI is active globally
    - Styles apply correctly across pages

---

- [x] ## Setup Authentication (Laravel Breeze)

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Enable user login and registration
    **📝 Tasks:**
    - Install Laravel Breeze (Inertia React)
    - Configure auth routes
    - Test login/register flow
      **✅ Done When:**
    - Users can register and log in
    - Session persists after refresh

---

- [ ] ## Create Base Layout Component

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Build reusable UI structure
    **📝 Tasks:**
    - Create layout wrapper
    - Add navigation/header
    - Add container spacing system
      **✅ Done When:**
    - All pages use consistent layout
    - UI looks clean and centered

---

# 🟠 **PHASE 2 — DATABASE & MODELS**

## 🗄️ Data Structure

- [x] ## Create Weekly Plans Migration

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Store weekly workout structure
    **📝 Fields:**
    - user_id
    - plan_json (JSON)
      **✅ Done When:**
    - Migration runs successfully
    - Table exists and accepts JSON

---

- [x] ## Create Daily Logs Migration

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Store daily check-in data
    **📝 Fields:**
    - sleep_hours (float)
    - stress_level (int)
    - soreness (int)
      **✅ Done When:**
    - Data can be inserted without errors

---

- [x] ## Create Recommendations Migration

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Store AI-generated responses
    **📝 Fields:**
    - readiness_score
    - planned
    - adjusted
    - workout_json (JSON)
    - nutrition_tip
      **✅ Done When:**
    - Data structure supports full AI response

---

- [ ] ## Add Goal Field to Users Table

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Define user fitness objective
    **📝 Values:**
    - bulk
    - cut
    - maintain
      **✅ Done When:**
    - Goal is saved and retrievable per user

---

- [ ] ## Define Eloquent Relationships

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Connect models logically
    **📝 Relations:**
    - User → weeklyPlan
    - User → dailyLogs
    - DailyLog → recommendation
      **✅ Done When:**
    - Relations work without errors in queries

---

# 🟡 **PHASE 3 — WEEKLY PLAN SYSTEM**

## 🗓️ Plan Generation

- [ ] ## Create Weekly Plan Endpoint (Mock)

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Return test weekly plan
    **📝 Route:**
    - `POST /api/weekly-plan`
      **✅ Done When:**
    - Returns static JSON plan

---

- [ ] ## Integrate AI for Weekly Plan

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Generate plan dynamically
    **📝 Tasks:**
    - Connect to LLM API
    - Send structured prompt
    - Parse JSON response
      **✅ Done When:**
    - Valid plan generated from AI

---

- [ ] ## Store Weekly Plan in Database

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Persist generated plan
    **📝 Tasks:**
    - Save plan per user
    - Overwrite if exists
      **✅ Done When:**
    - Plan retrieved correctly later

---

- [ ] ## Build Weekly Plan UI

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Visualize weekly structure
    **📝 Tasks:**
    - Display 7-day layout
    - Highlight current day
      **✅ Done When:**
    - UI is clean and readable

---

- [ ] ## Connect Weekly Plan to Frontend

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Show real data
    **📝 Tasks:**
    - Fetch via Inertia props
    - Render dynamic plan
      **✅ Done When:**
    - Plan loads from backend

---

# 🟢 **PHASE 4 — DAILY CHECK-IN**

## 📋 User Input Flow

- [ ] ## Build Check-in Form UI

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Collect user condition
    **📝 Inputs:**
    - Sleep hours
    - Stress level
    - Muscle soreness
      **✅ Done When:**
    - Form works smoothly

---

- [ ] ## Create Check-in Endpoint (Mock)

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Receive and store data
    **📝 Route:**
    - `POST /api/checkin`
      **✅ Done When:**
    - Saves log + returns mock response

---

- [ ] ## Connect Check-in Form to Backend

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Send real data
    **📝 Tasks:**
    - Handle request
    - Manage loading state
      **✅ Done When:**
    - Response received and usable

---

# 🧠 **PHASE 5 — AI DAILY ADAPTATION**

## ⚡ Smart Adjustment

- [ ] ## Integrate AI for Daily Recommendation

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Adapt workout dynamically
    **📝 Tasks:**
    - Send check-in + planned day
    - Parse structured response
      **✅ Done When:**
    - AI returns readiness + workout

---

- [ ] ## Store Recommendation in Database

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Persist results
    **📝 Tasks:**
    - Link to daily log
      **✅ Done When:**
    - Data saved and retrievable

---

# 🔵 **PHASE 6 — DASHBOARD**

## 📊 User Experience

- [ ] ## Build Dashboard Layout

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Main user screen
    **📝 Sections:**
    - Score
    - Message
    - Workout
      **✅ Done When:**
    - Layout is structured and clean

---

- [ ] ## Display Readiness Score

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Highlight main metric
    **✅ Done When:**
    - Score is large and visible

---

- [ ] ## Display Planned vs Adjusted Training

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Show AI impact
    **✅ Done When:**
    - Difference is clear to user

---

- [ ] ## Render Workout Exercises List

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Show routine details
    **✅ Done When:**
    - Exercises render dynamically

---

- [ ] ## Display Nutrition Tip

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Add value insight
    **✅ Done When:**
    - Tip is visible and styled

---

# 🟣 **FINAL PHASE**

## 🚀 Integration & Polish

- [ ] ## End-to-End Flow Testing

    **👨‍💻 Dev:** Eduardo Lorenzo
    **🎯 Goal:** Ensure full system works
    **✅ Done When:**
    - Weekly → Check-in → Dashboard works

---

- [ ] ## Improve UX (Loading & Feedback)

    **👨‍💻 Dev:** Felix Martinez
    **🎯 Goal:** Smooth experience
    **📝 Tasks:**
    - Loading spinner
    - Disabled buttons
    - Transitions
      **✅ Done When:**
    - UI feels responsive

---

# ⚡ **OPTIONAL (IF TIME LEFT)**

- [ ] ## Add History View

    **👨‍💻 Dev:** Felix Martinez

- [ ] ## Add Streak Counter

    **👨‍💻 Dev:** Eduardo Lorenzo

- [ ] ## Extend Nutrition with AI
    **👨‍💻 Dev:** Eduardo Lorenzo

# Match Management Feature - Implementation Guide

## 🚀 Getting Started

This branch implements the match management system for the tennis league. Follow this guide to implement the feature step by step.

## 📋 Task Checklist

### Week 1: Core Match Management ✅ COMPLETED

#### Day 1-2: Database Setup ✅
- [x] Create `lib/models/Match.js` with the schema
- [x] Update `lib/models/Player.js` to add matchHistory field
- [x] Create database migration script if needed
- [x] Test models with sample data

#### Day 3-4: Admin Match List UI ✅
- [x] Create `app/admin/matches/page.js` 
- [x] Create league management page `app/admin/leagues/page.js`
- [x] Implement search and filtering functionality
- [x] Add league context to match management

#### Day 5: API Endpoints ✅
- [x] Create `app/api/admin/leagues/route.js` (GET)
- [x] Create `app/api/admin/matches/route.js` (GET, POST)
- [x] Create `app/api/admin/matches/[id]/route.js` (GET, PATCH, DELETE)
- [x] Add authentication middleware
- [x] Test all endpoints
- [x] Fix import path errors

### Additional Completed Features ✅
- [x] Create match creation page `app/admin/matches/create/page.js`
- [x] Create match detail page `app/admin/matches/[id]/page.js`
- [x] Implement result entry functionality
- [x] Add ELO calculation on match completion
- [x] Update player stats after matches
- [x] Update admin dashboard with league links
- [x] Update all documentation

### Admin Panel UI Improvements ✅ 
- [x] Create admin layout with sidebar navigation
- [x] Improve dashboard UI with better cards and stats
- [x] Update all admin pages with consistent styling
- [x] Add responsive design for mobile
- [x] Fix layout issues with content containment

### Player Management Features ✅ 
- [x] Redesign player management interface
- [x] Add player deletion functionality
- [x] Create DELETE endpoint with match history check
- [x] Add confirmation modal for deletions
- [x] Improve player filtering and search

### Week 2: Swiss Pairing System ✅ COMPLETED!

#### Day 1-2: Swiss Algorithm ✅
- [x] Create `lib/utils/swissPairing.js`
- [x] Implement pairing logic with tests
- [x] Handle edge cases (byes, odd players)

#### Day 3-4: Round Generation UI ✅
- [x] Create round generation component
- [x] Add preview functionality
- [x] Create `app/api/admin/matches/generate-round/route.js`
- [x] Create `app/admin/matches/generate-round/page.js`

### Week 3: Results & ELO ✅ COMPLETED

#### Day 1-2: Result Entry ✅
- [x] Create match detail page
- [x] Build result entry form
- [x] Add validation

#### Day 3-4: ELO System ✅
- [x] Implement ELO calculation in API
- [x] Update rating after results
- [x] Create result entry endpoint (integrated into PATCH)

## 🆕 User Management System 🔄 IN PROGRESS!

### Phase 1: Core User Authentication Infrastructure
#### ✅ COMPLETED TODAY!
- [x] Create `lib/models/User.js` with comprehensive schema
- [x] Install bcryptjs and jsonwebtoken dependencies
- [x] Create JWT utilities (`lib/utils/jwt.js`)
- [x] Create player login endpoint (`/api/auth/login`)
- [x] Create logout endpoint (`/api/auth/logout`)
- [x] Implement account locking after failed attempts
- [x] Add refresh token support
- [x] Convert admin auth from session-based to JWT
- [x] Update `/api/admin/auth/login` to use User model
- [x] Create middleware for JWT verification (`lib/utils/authMiddleware.js`)
- [x] Update all admin auth endpoints to use JWT
- [x] Update admin login page to use email/password

#### 📅 TODO - Authentication Features
- [ ] Password reset flow
  - [ ] Create `/api/auth/forgot-password` endpoint
  - [ ] Create `/api/auth/reset-password` endpoint
  - [ ] Create password reset UI pages
  - [ ] Email templates for reset links
- [ ] Email verification
  - [ ] Create `/api/auth/verify-email` endpoint
  - [ ] Email verification page
  - [ ] Resend verification email

### Phase 2: User Management Admin Interface
#### ✅ COMPLETED TODAY!
- [x] Create `app/admin/users/page.js` - User management page
- [x] Create `app/api/admin/users/route.js` - List and create users
- [x] Create `app/api/admin/users/[id]/route.js` - User CRUD
- [x] Create `app/api/admin/users/invite/route.js` - Send invitations
- [x] Add Users link to admin sidebar navigation
- [x] Update Player model to include userId field
- [x] Create script to create initial admin user (`scripts/createAdminUser.js`)
- [x] Add create-admin command to package.json

#### 📅 TODO - User Management Features
- [ ] Email integration for invitations
- [ ] Invitation tracking and management
- [ ] Bulk operations UI

### Phase 3: Player Onboarding System 📅 TODO
- [ ] Player activation flow
  - [ ] Create `/signup/activate` page
  - [ ] Token validation
  - [ ] Password creation for invited players
- [ ] Email templates
  - [ ] Invitation email
  - [ ] Welcome email
  - [ ] Account activated email

### Phase 4: Player Portal 📅 TODO
- [ ] Player authentication pages
  - [ ] Create `/login` page for players
  - [ ] Create `/forgot-password` page
- [ ] Player dashboard (`/player/dashboard`)
  - [ ] View upcoming matches
  - [ ] Check current ranking/ELO
  - [ ] View match history
  - [ ] Update contact information
- [ ] Match features for players
  - [ ] Confirm match availability
  - [ ] Suggest alternative dates (wild cards)
  - [ ] View opponent stats
  - [ ] Submit match results (requires both players)
- [ ] Profile management (`/player/profile`)
  - [ ] Update WhatsApp number
  - [ ] Change password
  - [ ] Notification preferences
  - [ ] Language preferences

### Phase 5: Public Pages 📅 TODO
- [ ] Public match schedule (`/matches`)
- [ ] League standings (`/standings`)
- [ ] Player profiles (`/player/[id]`)
- [ ] Tournament brackets

## 🛠️ Development Commands

```bash
# Switch to feature branch
git checkout feature/match-management

# Install dependencies
npm install

# Run development server
npm run dev

# Create initial admin user
npm run create-admin

# Seed leagues
npm run seed:leagues
```

## 📁 File Structure

### ✅ Completed Files
```
✅ app/
├── ✅ admin/
│   ├── ✅ layout.js                # Admin layout with sidebar
│   ├── ✅ page.js                  # Admin login page (JWT auth)
│   ├── ✅ dashboard/
│   │   └── ✅ page.js              # Admin dashboard
│   ├── ✅ leagues/
│   │   └── ✅ page.js              # League management
│   ├── ✅ players/
│   │   └── ✅ page.js              # Player management
│   ├── ✅ users/                   # NEW! User management
│   │   └── ✅ page.js
│   └── ✅ matches/
│       ├── ✅ page.js              # Match list
│       ├── ✅ create/
│       │   └── ✅ page.js          # Create match
│       ├── ✅ [id]/
│       │   └── ✅ page.js          # Match detail
│       └── ✅ generate-round/
│           └── ✅ page.js          # Swiss round generation
├── ✅ api/
│   ├── ✅ auth/                    # Player authentication
│   │   ├── ✅ login/
│   │   │   └── ✅ route.js         # Player login
│   │   └── ✅ logout/
│   │       └── ✅ route.js         # Player logout
│   └── ✅ admin/
│       ├── ✅ auth/                # Admin auth (JWT)
│       │   ├── ✅ login/           # JWT login
│       │   ├── ✅ logout/          # JWT logout
│       │   └── ✅ check/           # JWT verification
│       ├── ✅ users/               # NEW! User management
│       │   ├── ✅ route.js
│       │   ├── ✅ [id]/
│       │   │   └── ✅ route.js
│       │   └── ✅ invite/
│       │       └── ✅ route.js
│       ├── ✅ leagues/
│       ├── ✅ players/
│       └── ✅ matches/

✅ lib/
├── ✅ models/
│   ├── ✅ Match.js
│   ├── ✅ Player.js (with userId)
│   └── ✅ User.js
└── ✅ utils/
    ├── ✅ swissPairing.js
    ├── ✅ jwt.js
    └── ✅ authMiddleware.js

✅ scripts/
└── ✅ createAdminUser.js
```

### 📅 TODO Files
```
❌ app/
├── ❌ login/                       # Player login page
├── ❌ signup/
│   └── ❌ activate/                # Player activation
├── ❌ forgot-password/
├── ❌ reset-password/
├── ❌ player/                      # Player portal
│   ├── ❌ dashboard/
│   ├── ❌ profile/
│   └── ❌ [id]/                    # Public player profile
├── ❌ matches/                     # Public matches
└── ❌ standings/                   # Public standings

❌ api/
└── ❌ auth/                        # Auth endpoints
    ├── ❌ verify-email/
    ├── ❌ forgot-password/
    └── ❌ reset-password/
```

## 🔗 Integration Points

1. **Player Management** ✅ - Complete CRUD operations
2. **League System** ✅ - Filter by league/season
3. **Swiss Pairing** ✅ - Automatic round generation
4. **Admin Auth** ✅ - JWT authentication
5. **Player Auth** ✅ - Basic login/logout done
6. **User Management** ✅ - Admin interface complete
7. **Email System** ❌ - TODO
8. **Player Portal** ❌ - TODO

## 📝 Current Status Summary

### ✅ Today's Accomplishments
- Converted admin authentication to JWT
- Created comprehensive user management system
- Built admin interface for managing users
- Added player invitation system
- Created script for initial admin user
- Linked Player and User models
- Set up JWT middleware for route protection

### 🔄 Next Priority: Complete Authentication Features
1. Password reset functionality
2. Email verification system
3. Player activation flow
4. Email integration

### 📅 Then: Player Portal
1. Player login/dashboard
2. Match management for players
3. Profile management

## 🧪 Testing Instructions

### Create Admin User
```bash
npm run create-admin
# Follow prompts to create admin user
```

### Test User Management
1. Login to admin panel with created user
2. Navigate to Users section
3. Create new admin users
4. Send invitations to players
5. Test user enable/disable

### Test JWT Authentication
1. Login expires after 1 day
2. Refresh token lasts 30 days
3. Account locks after 5 failed attempts

## 🚢 Deployment Checklist

- [x] Add JWT_SECRET to env vars
- [ ] Add email configuration (SMTP)
- [x] Create initial admin user
- [ ] Test invitation flow
- [ ] Update production auth
- [ ] Security audit

## 💡 Important Notes

### Authentication System
- **Unified JWT**: Both admin and players use JWT
- **Token Expiry**: Access token 1 day, refresh token 30 days
- **Account Locking**: 5 failed attempts = 2 hour lock
- **Password Requirements**: Minimum 8 characters

### User Management
- **Admin Creation**: Only admins can create other admins
- **Player Invitations**: Bulk invite system for registered players
- **Auto-linking**: Players automatically linked to users by email
- **Activation Tokens**: 7-day expiry for invitations

Great progress today! The user management system is now functional with JWT authentication throughout. 🎾

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
#### ✅ Completed
- [x] Create `lib/models/User.js` with comprehensive schema
- [x] Install bcryptjs and jsonwebtoken dependencies
- [x] Create JWT utilities (`lib/utils/jwt.js`)
- [x] Create player login endpoint (`/api/auth/login`)
- [x] Create logout endpoint (`/api/auth/logout`)
- [x] Implement account locking after failed attempts
- [x] Add refresh token support

#### 📅 TODO - Unified Auth System
- [ ] Convert admin auth from session-based to JWT
- [ ] Update `/api/admin/auth/login` to use User model
- [ ] Create middleware for JWT verification
- [ ] Update all admin API routes to use JWT auth
- [ ] Remove old session-based authentication

### Phase 2: User Management Admin Interface 📅 TODO
- [ ] Create `app/admin/users/page.js` - User management page
- [ ] Create `app/api/admin/users/route.js` - List and create users
- [ ] Create `app/api/admin/users/[id]/route.js` - User CRUD
- [ ] Add Users link to admin sidebar navigation
- [ ] Features for Users page:
  - [ ] List all users (admins and players)
  - [ ] Create new admin users
  - [ ] Send invitations to players
  - [ ] Enable/disable users
  - [ ] Reset user passwords
  - [ ] View user activity logs

### Phase 3: Authentication Features 📅 TODO
- [ ] Password reset flow
  - [ ] Create `/api/auth/forgot-password` endpoint
  - [ ] Create `/api/auth/reset-password` endpoint
  - [ ] Create password reset UI pages
  - [ ] Email templates for reset links
- [ ] Email verification
  - [ ] Create `/api/auth/verify-email` endpoint
  - [ ] Email verification page
  - [ ] Resend verification email
- [ ] Create initial admin user script
  - [ ] `scripts/createAdminUser.js`

### Phase 4: Player Onboarding System 📅 TODO
- [ ] Invitation management
  - [ ] Create `/api/admin/users/invite` endpoint
  - [ ] Bulk invitation system
  - [ ] Track invitation status
  - [ ] Resend invitations
- [ ] Player activation flow
  - [ ] Create `/signup/activate` page
  - [ ] Token validation
  - [ ] Password creation for invited players
  - [ ] Auto-link User to Player record
- [ ] Email templates
  - [ ] Invitation email
  - [ ] Welcome email
  - [ ] Account activated email

### Phase 5: Player Portal 📅 TODO
- [ ] Player authentication pages
  - [ ] Create `/login` page for players
  - [ ] Create `/signup` page (if self-registration allowed)
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

### Phase 6: Public Pages 📅 TODO
- [ ] Public match schedule (`/matches`)
- [ ] League standings (`/standings`)
- [ ] Player profiles (`/player/[id]`)
- [ ] Tournament brackets

## 🛠️ Development Commands

```bash
# Switch to feature branch
git checkout feature/match-management

# Install dependencies (if any new ones)
npm install

# Run development server
npm run dev

# Create initial admin user (once script is created)
npm run create-admin

# Run tests (when implemented)
npm test
```

## 📁 File Structure

### ✅ Completed Files
```
✅ app/
├── ✅ admin/
│   ├── ✅ layout.js                # Admin layout with sidebar
│   ├── ✅ page.js                  # Admin login page
│   ├── ✅ dashboard/
│   │   └── ✅ page.js              # Admin dashboard
│   ├── ✅ leagues/
│   │   └── ✅ page.js              # League management
│   ├── ✅ players/
│   │   └── ✅ page.js              # Player management
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
│       ├── ✅ auth/                # Admin auth (needs conversion to JWT)
│       ├── ✅ leagues/
│       ├── ✅ players/
│       └── ✅ matches/

✅ lib/
├── ✅ models/
│   ├── ✅ Match.js
│   ├── ✅ Player.js
│   └── ✅ User.js
└── ✅ utils/
    ├── ✅ swissPairing.js
    └── ✅ jwt.js
```

### 📅 TODO Files
```
❌ app/
├── ❌ admin/
│   └── ❌ users/                   # User management
│       └── ❌ page.js
├── ❌ login/                       # Player login page
│   └── ❌ page.js
├── ❌ signup/
│   └── ❌ activate/                # Player activation
│       └── ❌ page.js
├── ❌ forgot-password/
│   └── ❌ page.js
├── ❌ reset-password/
│   └── ❌ page.js
├── ❌ player/                      # Player portal
│   ├── ❌ dashboard/
│   │   └── ❌ page.js
│   ├── ❌ profile/
│   │   └── ❌ page.js
│   └── ❌ [id]/                    # Public player profile
│       └── ❌ page.js
├── ❌ matches/                     # Public matches
│   └── ❌ page.js
└── ❌ standings/                   # Public standings
    └── ❌ page.js

❌ api/
├── ❌ admin/
│   └── ❌ users/                   # User management API
│       ├── ❌ route.js
│       ├── ❌ [id]/
│       │   └── ❌ route.js
│       └── ❌ invite/
│           └── ❌ route.js
└── ❌ auth/                        # Auth endpoints
    ├── ❌ verify-email/
    │   └── ❌ route.js
    ├── ❌ forgot-password/
    │   └── ❌ route.js
    └── ❌ reset-password/
        └── ❌ route.js

❌ scripts/
└── ❌ createAdminUser.js           # Create initial admin
```

## 🔗 Integration Points

1. **Player Management** ✅ - Complete CRUD operations
2. **League System** ✅ - Filter by league/season
3. **Swiss Pairing** ✅ - Automatic round generation
4. **Admin Auth** 🔄 - Needs conversion to JWT
5. **Player Auth** 🔄 - Basic login/logout done
6. **User Management** ❌ - TODO
7. **Email System** ❌ - TODO
8. **Player Portal** ❌ - TODO

## 📝 Current Focus: User Management System

### Immediate Tasks (This Week)
1. **Unify Authentication** - Convert admin to JWT
2. **User Management Page** - Admin interface for users
3. **Password Reset** - Email-based reset flow
4. **Email Verification** - Verify user emails
5. **Initial Admin Script** - Create first admin user

### Next Week
1. **Player Invitations** - Bulk invite system
2. **Player Activation** - Onboarding flow
3. **Player Dashboard** - Basic player portal

## 🧪 Testing Checklist

### ✅ Completed Tests
- [x] Swiss pairing generates valid matchups
- [x] ELO updates correctly
- [x] Match status transitions
- [x] Player stats update
- [x] API error handling
- [x] Admin UI responsive
- [x] Player login/logout

### 📅 TODO Tests
- [ ] JWT token validation
- [ ] Password reset flow
- [ ] Email verification
- [ ] User management CRUD
- [ ] Player invitation flow
- [ ] Player portal features

## 🚢 Deployment Checklist

- [x] Add JWT_SECRET to env vars
- [ ] Add email configuration (SMTP)
- [ ] Create initial admin user
- [ ] Test invitation flow
- [ ] Update production auth
- [ ] Security audit

## 💡 Important Notes

### Current Auth Status
- **Admin Auth**: Still using session-based (needs conversion)
- **Player Auth**: Using JWT (partially implemented)
- **Need**: Unified JWT system for both

### User Types
1. **Admin Users**: Full system access
2. **Player Users**: Limited to their own data
3. **Future**: Referee users (for match validation)

### Security Considerations
- Password requirements (min 8 chars)
- Account locking after 5 failed attempts
- Email verification required
- JWT tokens expire after 1 day
- Refresh tokens last 30 days

Great! Now we have a complete plan. Ready to start implementation! 🎾

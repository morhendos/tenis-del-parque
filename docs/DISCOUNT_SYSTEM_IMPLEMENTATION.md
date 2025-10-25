# Discount Code System Implementation Plan

## Overview
Implement a simple discount code system that shows €29 price with 100% discount for the summer 2025 season. Support both manual code entry and automatic application via URL parameters.

## Phase 1: Database Schema Updates

### ✅ Task 1.1: Update League Model
**File:** `/lib/models/League.js`

Add discount codes array to the League schema:

```javascript
// Add this to LeagueSchema after the seasonConfig field
discountCodes: [{
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  description: {
    type: String,
    default: 'Promotional discount'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days default
  },
  maxUses: {
    type: Number,
    default: null // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    email: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}]
```

### ✅ Task 1.2: Add Player Model Fields
**File:** `/lib/models/Player.js`

Add fields to track discount usage:

```javascript
// Add to PlayerSchema
registration: {
  // ... existing fields ...
  discountCode: {
    type: String,
    default: null
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'waived'],
    default: 'pending'
  }
}
```

## Phase 2: API Endpoints

### ✅ Task 2.1: Create Discount Validation Endpoint
**File:** `/app/api/leagues/[league]/discount/validate/route.js`

```javascript
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    await dbConnect()
    
    const { code } = await request.json()
    const { league: leagueSlug } = params
    
    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Discount code is required' 
      }, { status: 400 })
    }
    
    const league = await League.findOne({ slug: leagueSlug })
    
    if (!league) {
      return NextResponse.json({ 
        valid: false, 
        error: 'League not found' 
      }, { status: 404 })
    }
    
    // Check if discount code exists and is valid
    const discount = league.discountCodes?.find(d => {
      return d.code === code.toUpperCase() &&
             d.isActive &&
             new Date() >= new Date(d.validFrom) &&
             new Date() <= new Date(d.validUntil) &&
             (d.maxUses === null || d.usedCount < d.maxUses)
    })
    
    if (!discount) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired discount code' 
      })
    }
    
    // Calculate discounted price
    const originalPrice = league.seasonConfig?.price?.amount || 0
    const discountAmount = (originalPrice * discount.discountPercentage) / 100
    const finalPrice = originalPrice - discountAmount
    
    return NextResponse.json({
      valid: true,
      code: discount.code,
      discountPercentage: discount.discountPercentage,
      originalPrice,
      discountAmount,
      finalPrice,
      description: discount.description
    })
    
  } catch (error) {
    console.error('Discount validation error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to validate discount code' 
    }, { status: 500 })
  }
}
```

### ✅ Task 2.2: Update Player Registration Endpoint
**File:** `/app/api/players/register/route.js`

Add discount code handling to the existing registration:

```javascript
// Add to the registration handler
export async function POST(request) {
  try {
    await dbConnect()
    
    const { 
      name, 
      email, 
      whatsapp, 
      level, 
      leagueId, 
      language,
      discountCode  // Add this
    } = await request.json()
    
    // ... existing validation ...
    
    const league = await League.findById(leagueId)
    
    // Process discount if provided
    let discountApplied = 0
    let finalPrice = league.seasonConfig?.price?.amount || 0
    let originalPrice = finalPrice
    
    if (discountCode) {
      const discount = league.discountCodes?.find(d => {
        return d.code === discountCode.toUpperCase() &&
               d.isActive &&
               new Date() >= new Date(d.validFrom) &&
               new Date() <= new Date(d.validUntil) &&
               (d.maxUses === null || d.usedCount < d.maxUses)
      })
      
      if (discount) {
        discountApplied = discount.discountPercentage
        const discountAmount = (originalPrice * discount.discountPercentage) / 100
        finalPrice = originalPrice - discountAmount
        
        // Track usage
        discount.usedCount += 1
        discount.usedBy.push({
          playerId: player._id,
          email: email,
          usedAt: new Date()
        })
        await league.save()
      }
    }
    
    // Create player with discount info
    const player = new Player({
      name,
      email,
      whatsapp,
      level,
      league: leagueId,
      registration: {
        discountCode: discountCode?.toUpperCase(),
        discountApplied,
        originalPrice,
        finalPrice,
        paymentStatus: finalPrice === 0 ? 'waived' : 'pending'
      }
      // ... other fields ...
    })
    
    await player.save()
    
    // ... rest of the registration logic ...
  }
}
```

## Phase 3: Admin Panel Updates

### ✅ Task 3.1: Create Discount Code Management Page
**File:** `/app/admin/leagues/[id]/discounts/page.js`

```javascript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function DiscountManagementPage() {
  const { id } = useParams()
  const router = useRouter()
  const [league, setLeague] = useState(null)
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    discountPercentage: 100,
    description: 'Summer 2025 Launch Promotion',
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: null,
    isActive: true
  })

  // Fetch league and discounts
  useEffect(() => {
    fetchLeagueData()
  }, [id])

  const fetchLeagueData = async () => {
    try {
      const res = await fetch(`/api/admin/leagues/${id}`)
      const data = await res.json()
      setLeague(data)
      setDiscounts(data.discountCodes || [])
    } catch (error) {
      console.error('Error fetching league:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDiscount = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/leagues/${id}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDiscount)
      })
      
      if (res.ok) {
        await fetchLeagueData()
        setShowAddForm(false)
        setNewDiscount({
          code: '',
          discountPercentage: 100,
          description: 'Summer 2025 Launch Promotion',
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxUses: null,
          isActive: true
        })
      }
    } catch (error) {
      console.error('Error adding discount:', error)
    }
  }

  const toggleDiscountStatus = async (discountCode) => {
    try {
      await fetch(`/api/admin/leagues/${id}/discounts/${discountCode}/toggle`, {
        method: 'PATCH'
      })
      await fetchLeagueData()
    } catch (error) {
      console.error('Error toggling discount:', error)
    }
  }

  const getShareableLink = (code) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    return `${baseUrl}/signup/${league.slug}?discount=${code}`
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
        <p className="text-gray-600 mt-2">{league?.name}</p>
      </div>

      {/* Add Discount Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Add Discount Code
        </button>
      </div>

      {/* Add Discount Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Discount Code</h2>
          <form onSubmit={handleAddDiscount} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code</label>
                <input
                  type="text"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded"
                  placeholder="SUMMER2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount %</label>
                <input
                  type="number"
                  value={newDiscount.discountPercentage}
                  onChange={(e) => setNewDiscount({...newDiscount, discountPercentage: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until</label>
                <input
                  type="date"
                  value={newDiscount.validUntil}
                  onChange={(e) => setNewDiscount({...newDiscount, validUntil: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discount Codes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Discount Codes</h2>
          
          {discounts.length === 0 ? (
            <p className="text-gray-500">No discount codes created yet</p>
          ) : (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div key={discount.code} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold font-mono">{discount.code}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{discount.description}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Discount: <span className="font-semibold">{discount.discountPercentage}%</span></p>
                        <p>Valid until: <span className="font-semibold">{new Date(discount.validUntil).toLocaleDateString()}</span></p>
                        <p>Used: <span className="font-semibold">{discount.usedCount || 0}</span> times</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleDiscountStatus(discount.code)}
                        className={`px-3 py-1 text-sm rounded ${
                          discount.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Shareable Link */}
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Shareable Link:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={getShareableLink(discount.code)}
                        readOnly
                        className="flex-1 p-2 bg-white border rounded text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(getShareableLink(discount.code))}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### ✅ Task 3.2: Create Discount Management API
**File:** `/app/api/admin/leagues/[id]/discounts/route.js`

```javascript
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const discountData = await request.json()
    
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Check if code already exists
    if (league.discountCodes?.some(d => d.code === discountData.code.toUpperCase())) {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 })
    }
    
    // Add new discount code
    if (!league.discountCodes) {
      league.discountCodes = []
    }
    
    league.discountCodes.push({
      ...discountData,
      code: discountData.code.toUpperCase(),
      createdAt: new Date(),
      usedCount: 0,
      usedBy: []
    })
    
    await league.save()
    
    return NextResponse.json({ success: true, league })
  } catch (error) {
    console.error('Error adding discount:', error)
    return NextResponse.json({ error: 'Failed to add discount' }, { status: 500 })
  }
}
```

## Phase 4: Frontend Registration Updates

### ✅ Task 4.1: Update Registration Form Component
**File:** `/components/leagues/ModernRegistrationForm.js`

Add discount code handling to the registration form:

```javascript
// Add to the component state
const [discountCode, setDiscountCode] = useState('')
const [discountValidation, setDiscountValidation] = useState(null)
const [isValidating, setIsValidating] = useState(false)

// Add useEffect to check URL params for discount
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const urlDiscount = urlParams.get('discount')
  if (urlDiscount) {
    setDiscountCode(urlDiscount)
    validateDiscount(urlDiscount)
  }
}, [])

// Add discount validation function
const validateDiscount = async (code) => {
  if (!code) {
    setDiscountValidation(null)
    return
  }
  
  setIsValidating(true)
  try {
    const res = await fetch(`/api/leagues/${leagueSlug}/discount/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    const data = await res.json()
    setDiscountValidation(data)
  } catch (error) {
    console.error('Error validating discount:', error)
    setDiscountValidation({ valid: false, error: 'Failed to validate code' })
  } finally {
    setIsValidating(false)
  }
}

// Add to the form JSX (after the level selection)
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    {language === 'es' ? 'Código de Descuento' : 'Discount Code'}
  </label>
  <div className="flex space-x-2">
    <input
      type="text"
      value={discountCode}
      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
      placeholder={language === 'es' ? 'Ingrese código' : 'Enter code'}
      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-parque-purple"
    />
    <button
      type="button"
      onClick={() => validateDiscount(discountCode)}
      disabled={!discountCode || isValidating}
      className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
    >
      {isValidating ? '...' : language === 'es' ? 'Aplicar' : 'Apply'}
    </button>
  </div>
  
  {/* Show validation result */}
  {discountValidation && (
    <div className={`mt-2 p-3 rounded-lg ${
      discountValidation.valid 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      {discountValidation.valid ? (
        <div>
          <p className="text-green-800 font-medium">
            ✓ {discountValidation.description || 'Discount applied'}
          </p>
          <div className="mt-2 text-green-700">
            <span className="line-through text-gray-500">€{discountValidation.originalPrice}</span>
            <span className="ml-2 text-xl font-bold">
              €{discountValidation.finalPrice}
            </span>
            <span className="ml-1 text-sm">
              ({discountValidation.discountPercentage}% off)
            </span>
          </div>
        </div>
      ) : (
        <p className="text-red-700">
          {discountValidation.error || 'Invalid code'}
        </p>
      )}
    </div>
  )}
</div>

// Update the price display section
<div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="font-semibold mb-2">
    {language === 'es' ? 'Resumen' : 'Summary'}
  </h3>
  <div className="space-y-1 text-sm">
    <div className="flex justify-between">
      <span>{language === 'es' ? 'Precio de temporada' : 'Season Price'}:</span>
      <span className={discountValidation?.valid ? 'line-through text-gray-500' : ''}>
        €{league?.seasonConfig?.price?.amount || 29}
      </span>
    </div>
    {discountValidation?.valid && (
      <>
        <div className="flex justify-between text-green-700">
          <span>{language === 'es' ? 'Descuento' : 'Discount'}:</span>
          <span>-€{discountValidation.discountAmount}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>{language === 'es' ? 'Total' : 'Total'}:</span>
          <span>€{discountValidation.finalPrice}</span>
        </div>
      </>
    )}
  </div>
</div>

// Update the submit handler to include discount code
const handleSubmit = async (e) => {
  e.preventDefault()
  // ... existing validation ...
  
  const registrationData = {
    name,
    email,
    whatsapp,
    level,
    leagueId: league._id,
    language,
    discountCode: discountValidation?.valid ? discountCode : null
  }
  
  // ... rest of submit logic
}
```

## Phase 5: Testing & Deployment

### ✅ Task 5.1: Create Test Script
**File:** `/scripts/createDiscountCodes.js`

```javascript
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const createDiscountCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    const League = require('../lib/models/League')
    
    // Update all summer 2025 leagues
    const leagues = await League.find({
      'season.year': 2025,
      'season.type': 'summer'
    })
    
    for (const league of leagues) {
      // Add launch discount code
      if (!league.discountCodes) {
        league.discountCodes = []
      }
      
      // Check if code already exists
      const codeExists = league.discountCodes.some(d => d.code === 'VERANO2025')
      
      if (!codeExists) {
        league.discountCodes.push({
          code: 'VERANO2025',
          discountPercentage: 100,
          description: 'Summer 2025 Launch - 100% Discount',
          validFrom: new Date(),
          validUntil: new Date('2025-08-31'),
          maxUses: null, // Unlimited
          usedCount: 0,
          usedBy: [],
          isActive: true
        })
        
        // Also add a special early bird code
        league.discountCodes.push({
          code: 'EARLYBIRD',
          discountPercentage: 100,
          description: 'Early Bird Special - First 50 Players',
          validFrom: new Date(),
          validUntil: new Date('2025-06-30'),
          maxUses: 50,
          usedCount: 0,
          usedBy: [],
          isActive: true
        })
        
        await league.save()
        console.log(`Added discount codes to ${league.name}`)
      }
    }
    
    console.log('Discount codes created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createDiscountCodes()
```

### ✅ Task 5.2: Testing Checklist

1. **Database Tests**
   - [ ] Run migration script to add discount codes
   - [ ] Verify codes appear in database
   - [ ] Check indexes are created

2. **API Tests**
   - [ ] Test discount validation endpoint with valid code
   - [ ] Test with invalid code
   - [ ] Test with expired code
   - [ ] Test usage counting

3. **Frontend Tests**
   - [ ] Test registration with discount code
   - [ ] Test URL parameter auto-application
   - [ ] Test price display updates
   - [ ] Test error messages

4. **Admin Panel Tests**
   - [ ] Create new discount code
   - [ ] View usage statistics
   - [ ] Toggle code active/inactive
   - [ ] Copy shareable link

## Phase 6: Marketing Implementation

### ✅ Task 6.1: Create Promotional Materials

**WhatsApp Message Template:**
```
🎾 ¡Liga de Tenis Sotogrande Verano 2025! 

🎁 OFERTA ESPECIAL: Primera temporada GRATIS
Precio normal: €29
Tu precio: €0 (100% descuento)

Usa el código: VERANO2025
O registrate directamente: 
[your-domain]/signup/sotogrande?discount=VERANO2025

⏰ Oferta válida hasta el 31 de agosto
📱 Plazas limitadas

¡Únete ahora!
```

**Social Media Template:**
```
🎾 Launch Special: Join Sotogrande Tennis League FREE! 

Regular price: €29
Your price: €0 with code VERANO2025

Limited time offer for our founding members.
Register now: [link]

#TenisDelParque #Sotogrande #Tennis
```

## Deployment Checklist

### Pre-Deployment
- [ ] Backup database
- [ ] Test on staging environment
- [ ] Update environment variables
- [ ] Create discount codes in production

### Deployment Steps
1. [ ] Deploy database schema changes
2. [ ] Deploy API endpoints
3. [ ] Deploy admin panel updates
4. [ ] Deploy frontend updates
5. [ ] Run discount code creation script
6. [ ] Test live registration with discount

### Post-Deployment
- [ ] Monitor registration metrics
- [ ] Check discount usage stats
- [ ] Verify email notifications
- [ ] Test shareable links

## Monitoring & Analytics

### Key Metrics to Track
- Discount code usage rate
- Conversion rate with/without discount
- Registration completion rate
- Most used discount codes
- Revenue impact analysis

### Database Queries for Reports
```javascript
// Get discount usage stats
db.leagues.aggregate([
  { $match: { 'season.year': 2025 } },
  { $unwind: '$discountCodes' },
  { $project: {
    leagueName: '$name',
    code: '$discountCodes.code',
    usage: '$discountCodes.usedCount',
    percentage: '$discountCodes.discountPercentage'
  }}
])
```

## Support & Troubleshooting

### Common Issues

**Issue: Discount code not applying**
- Check code is uppercase
- Verify valid date range
- Check max uses not exceeded

**Issue: URL parameter not working**
- Ensure proper URL encoding
- Check component mounting lifecycle

**Issue: Price not updating**
- Clear browser cache
- Check API response format
- Verify frontend state management

## Future Enhancements (Phase 2)

- [ ] Referral codes system
- [ ] Bulk code generation
- [ ] Code usage analytics dashboard
- [ ] Email integration for code distribution
- [ ] A/B testing different discount amounts
- [ ] Automatic seasonal promotions

---

## Quick Start Commands

```bash
# Create discount codes
node scripts/createDiscountCodes.js

# Test discount validation
curl -X POST http://localhost:3000/api/leagues/sotogrande/discount/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"VERANO2025"}'

# Generate shareable link
echo "https://yourdomain.com/signup/sotogrande?discount=VERANO2025"
```

## Notes
- All discount codes are automatically converted to uppercase
- URL parameters override manual code entry
- Discount validation happens in real-time
- Usage tracking is automatic on successful registration

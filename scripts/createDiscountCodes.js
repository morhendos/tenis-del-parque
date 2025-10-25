const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Define the League schema inline (CommonJS style for scripts)
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  season: {
    year: Number,
    type: String
  },
  seasonConfig: {
    price: {
      amount: Number,
      currency: String,
      isFree: Boolean
    }
  },
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
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    },
    maxUses: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    usedBy: [{
      playerId: mongoose.Schema.Types.ObjectId,
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
}, { timestamps: true })

const createDiscountCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get or create League model
    const League = mongoose.models.League || mongoose.model('League', LeagueSchema)
    
    // Find all summer 2025 leagues
    const leagues = await League.find({
      'season.year': 2025,
      'season.type': 'summer'
    })
    
    console.log(`Found ${leagues.length} Summer 2025 leagues`)
    
    // Define the discount codes to create
    const discountCodes = [
      {
        code: 'VERANO2025',
        discountPercentage: 100,
        description: 'Summer 2025 Launch - 100% FREE for founding members',
        validFrom: new Date(),
        validUntil: new Date('2025-08-31'),
        maxUses: null, // Unlimited
        isActive: true
      },
      {
        code: 'SOTOGRANDE2025',
        discountPercentage: 100,
        description: 'Sotogrande Community Special - First Season FREE',
        validFrom: new Date(),
        validUntil: new Date('2025-07-31'),
        maxUses: null, // Unlimited  
        isActive: true
      },
      {
        code: 'EARLYBIRD',
        discountPercentage: 100,
        description: 'Early Bird Special - First 50 Players FREE',
        validFrom: new Date(),
        validUntil: new Date('2025-06-30'),
        maxUses: 50, // Limited to first 50
        isActive: true
      }
    ]
    
    // Process each league
    for (const league of leagues) {
      console.log(`\nProcessing: ${league.name}`)
      
      // Initialize discountCodes array if it doesn't exist
      if (!league.discountCodes) {
        league.discountCodes = []
      }
      
      let codesAdded = 0
      
      // Add each discount code if it doesn't exist
      for (const discountCode of discountCodes) {
        const codeExists = league.discountCodes.some(
          d => d.code === discountCode.code
        )
        
        if (!codeExists) {
          league.discountCodes.push({
            ...discountCode,
            usedCount: 0,
            usedBy: [],
            createdAt: new Date()
          })
          codesAdded++
          console.log(`  ✓ Added code: ${discountCode.code}`)
        } else {
          console.log(`  - Code ${discountCode.code} already exists`)
        }
      }
      
      // Update price to show €29 (but free with discount)
      if (!league.seasonConfig) {
        league.seasonConfig = {}
      }
      if (!league.seasonConfig.price) {
        league.seasonConfig.price = {}
      }
      
      // Set the price to €29 so it shows value
      league.seasonConfig.price.amount = 29
      league.seasonConfig.price.currency = 'EUR'
      league.seasonConfig.price.isFree = false // Not free without discount
      
      if (codesAdded > 0 || league.seasonConfig.price.amount !== 29) {
        await league.save()
        console.log(`  ✅ Saved ${codesAdded} new discount codes`)
      } else {
        console.log(`  ℹ️  No changes needed`)
      }
      
      // Display shareable links
      console.log('\n  📎 Shareable Links:')
      for (const code of league.discountCodes) {
        if (code.isActive) {
          const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
          console.log(`     ${code.code}: ${baseUrl}/signup/${league.slug}?discount=${code.code}`)
        }
      }
    }
    
    console.log('\n✅ Discount codes setup complete!')
    console.log('\n📊 Summary:')
    console.log('- VERANO2025: General summer launch code (100% off)')
    console.log('- SOTOGRANDE2025: Community-specific code (100% off)')
    console.log('- EARLYBIRD: Limited to first 50 players (100% off)')
    console.log('\n💡 Next steps:')
    console.log('1. Update your registration form to show discount fields')
    console.log('2. Test with: http://localhost:3000/signup/[league-slug]?discount=VERANO2025')
    console.log('3. Share the codes with your players!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
createDiscountCodes()

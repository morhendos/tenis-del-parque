# Script Creation Rules and Best Practices

This document outlines the rules and best practices for creating Node.js scripts in this project to avoid common ES module import issues and ensure scripts work correctly from the start.

## Problem Summary

The main issue encountered was **ES module import errors** when scripts tried to import project modules that use ES6 `import` statements. Node.js treats files as CommonJS by default unless explicitly configured otherwise, causing `SyntaxError: Cannot use import statement outside a module` errors.

## Root Cause Analysis

1. **Package.json Configuration**: The project doesn't have `"type": "module"` in package.json, so Node.js treats `.js` files as CommonJS
2. **Mixed Module Systems**: Project files use ES6 imports, but Node.js scripts run in CommonJS context
3. **Import Chain Issues**: When a script imports a project module, that module's imports also need to be resolved in the correct context

## ✅ RULES TO FOLLOW

### 1. File Extension Rules

**ALWAYS use `.mjs` extension for standalone scripts**
```bash
# ✅ CORRECT
scripts/myScript.mjs

# ❌ WRONG
scripts/myScript.js
```

### 2. Import Strategy Rules

**Option A: Inline Schema Definitions (RECOMMENDED)**
```javascript
// ✅ CORRECT - Define schemas inline
import mongoose from 'mongoose'

const clubSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: {
    main: String,
    gallery: [String]
  },
  googleData: {
    photos: [Object],
    imagesFixed: Boolean,
    imagesFixedAt: Date
  }
}, { collection: 'clubs' })

const Club = mongoose.model('Club', clubSchema)
```

**Option B: Inline Service Classes (RECOMMENDED)**
```javascript
// ✅ CORRECT - Define service classes inline
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

class ImageStorageService {
  constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'uploads', 'clubs')
    this.publicPath = '/uploads/clubs'
  }
  
  // ... methods here
}

const imageStorage = new ImageStorageService()
```

**❌ AVOID: Direct Project Module Imports**
```javascript
// ❌ WRONG - This will cause ES module errors
import Club from '../lib/models/Club.js'
import imageStorage from '../lib/services/imageStorage.js'
```

### 3. Environment Setup Rules

**ALWAYS include proper environment setup**
```javascript
// ✅ CORRECT - Standard environment setup
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
```

### 4. Error Handling Rules

**ALWAYS include proper error handling and cleanup**
```javascript
// ✅ CORRECT - Proper error handling
async function runScript() {
  try {
    console.log('Script Name')
    console.log('=' .repeat(50))
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
    
    // ... script logic here
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Done')
  }
}

runScript()
```

### 5. Schema Definition Rules

**Keep schemas minimal and focused**
```javascript
// ✅ CORRECT - Only include fields you actually use
const clubSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: {
    main: String,
    gallery: [String]
  },
  googleData: {
    photos: [Object]
  }
}, { collection: 'clubs' })
```

### 6. Dependency Rules

**Only import what you need**
```javascript
// ✅ CORRECT - Import only necessary modules
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

// ❌ WRONG - Don't import project modules
import Club from '../lib/models/Club.js'
```

## 📋 SCRIPT TEMPLATE

Use this template for new scripts:

```javascript
// scripts/yourScript.mjs
// Description of what this script does
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Define schemas inline (only fields you need)
const yourSchema = new mongoose.Schema({
  // ... minimal schema definition
}, { collection: 'your_collection' })

const YourModel = mongoose.model('YourModel', yourSchema)

// Define service classes inline if needed
class YourService {
  // ... methods
}

const yourService = new YourService()

async function runScript() {
  try {
    console.log('Your Script Name')
    console.log('=' .repeat(50))
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local')
      process.exit(1)
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
    
    // Your script logic here
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Done')
  }
}

runScript()
```

## 🚫 COMMON MISTAKES TO AVOID

### 1. Wrong File Extension
```bash
# ❌ WRONG
node scripts/myScript.js  # Will cause ES module errors

# ✅ CORRECT
node scripts/myScript.mjs
```

### 2. Importing Project Modules
```javascript
// ❌ WRONG - Will cause import errors
import Club from '../lib/models/Club.js'
import { someFunction } from '../lib/utils/helpers.js'

// ✅ CORRECT - Define inline or copy needed code
const clubSchema = new mongoose.Schema({ /* ... */ })
const Club = mongoose.model('Club', clubSchema)
```

### 3. Missing Environment Setup
```javascript
// ❌ WRONG - Missing __dirname setup for .mjs files
dotenv.config({ path: '../.env.local' })

// ✅ CORRECT - Proper __dirname for .mjs files
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
```

### 4. No Error Handling
```javascript
// ❌ WRONG - No error handling
await mongoose.connect(process.env.MONGODB_URI)
const clubs = await Club.find({})
console.log(clubs)

// ✅ CORRECT - Proper error handling
try {
  await mongoose.connect(process.env.MONGODB_URI)
  const clubs = await Club.find({})
  console.log(clubs)
} catch (error) {
  console.error('❌ Error:', error.message)
} finally {
  await mongoose.disconnect()
}
```

## 🔧 ALTERNATIVE SOLUTIONS (Advanced)

If you absolutely need to import project modules, consider these alternatives:

### Option 1: Dynamic Imports
```javascript
// Use dynamic imports (but this is more complex)
const { default: Club } = await import('../lib/models/Club.js')
```

### Option 2: Package.json Type Module
```javascript
// Add to package.json (affects entire project)
{
  "type": "module"
}
```

### Option 3: Separate Scripts Package
```javascript
// Create scripts/package.json with type: module
{
  "type": "module"
}
```

## ✅ TESTING YOUR SCRIPT

Before committing, always test your script:

```bash
# Test the script runs without errors
node scripts/yourScript.mjs

# Check for common issues:
# 1. ✅ No "Cannot use import statement" errors
# 2. ✅ Connects to MongoDB successfully  
# 3. ✅ Proper error handling and cleanup
# 4. ✅ Clear console output with status messages
```

## 📚 EXAMPLES

### Working Script Examples
- `scripts/checkGoogleImages.mjs` - ✅ Good example of inline schema
- `scripts/fixOneClub.mjs` - ✅ Fixed version with inline definitions
- `scripts/fixBrokenImages.mjs` - ✅ Fixed version with inline service class

### Key Takeaways
1. **Always use `.mjs` extension**
2. **Define schemas and services inline**
3. **Never import project ES modules directly**
4. **Include proper environment setup**
5. **Add comprehensive error handling**
6. **Test before committing**

Following these rules will ensure your scripts work correctly from the start and avoid the ES module import issues that caused the original problems.

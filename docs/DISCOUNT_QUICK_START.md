# 🎾 Discount System Quick Start Guide

## Overview
This discount system allows you to show the €29 price but offer 100% discount for your Summer 2025 launch season.

## 🚀 Quick Setup (5 minutes)

### Step 1: Run the Discount Creation Script
```bash
# From your project root
node scripts/createDiscountCodes.js
```

This creates three codes:
- **VERANO2025** - General summer launch (100% off, unlimited)
- **SOTOGRANDE2025** - Community specific (100% off, unlimited)  
- **EARLYBIRD** - First 50 players (100% off, limited)

The script also automatically:
- Sets your league price to €29 (to show value)
- Marks it as not free (requires discount code)
- Generates shareable links for each code

### Step 2: Test the System
Visit your registration page with a discount code:
```
http://localhost:3000/signup/sotogrande-summer-2025?discount=VERANO2025
```

You should see:
- Original price: ~~€29~~
- Your price: €0 (100% discount applied!)

### Step 3: Share with Players

#### Option 1: Direct Link (Auto-applies discount)
```
https://yourdomain.com/signup/sotogrande-summer-2025?discount=VERANO2025
```

#### Option 2: Give them the code
Tell players to use code **VERANO2025** during registration

## 📱 WhatsApp Message Templates

### Spanish Version
```
🎾 ¡Liga de Tenis Sotogrande Verano 2025! 

🎁 OFERTA ESPECIAL: Primera temporada GRATIS
Precio normal: €29
Tu precio: €0 con código VERANO2025

Regístrate aquí:
https://yourdomain.com/signup/sotogrande-summer-2025?discount=VERANO2025

⏰ Plazas limitadas - Empieza Julio 2025
```

### English Version
```
🎾 Sotogrande Tennis League Summer 2025!

🎁 SPECIAL OFFER: First season FREE
Regular price: €29
Your price: €0 with code VERANO2025

Register here:
https://yourdomain.com/signup/sotogrande-summer-2025?discount=VERANO2025

⏰ Limited spots - Starts July 2025
```

## 🎯 What Players See

### On the registration page:
- Price section shows: ~~€29~~ **€0** 
- Green message: "Summer 2025 Launch - 100% FREE for founding members"
- They feel they're getting €29 value for free

### In their confirmation email:
- "You saved €29 as a founding member!"
- "Regular price of €29 applies from Autumn 2025 season"

## 📊 Track Usage (Admin Panel)

1. Go to Admin Panel → Leagues
2. Click on your league
3. Navigate to "Discounts" tab (or add `/discounts` to the URL)
4. You'll see:
   - How many times each code was used
   - Who used it (email/player)
   - When they registered

## ⚡ Quick Implementation Checklist

### Backend (if not already done):
- [ ] Add `discountCodes` field to League model
- [ ] Create `/api/leagues/[league]/discount/validate` endpoint
- [ ] Update registration endpoint to handle discounts

### Frontend:
- [ ] Add discount code input to registration form
- [ ] Check URL params for `?discount=CODE`
- [ ] Show price strikethrough when discount applied
- [ ] Include discount code in registration submission

### Testing:
- [ ] Run `node scripts/createDiscountCodes.js`
- [ ] Test registration with code
- [ ] Verify price shows as ~~€29~~ €0
- [ ] Check discount usage in database

## 🎉 Launch Strategy

### Week 1: Soft Launch
- Share **EARLYBIRD** code with your core tennis group
- Limited to first 50 players
- Creates urgency and exclusivity

### Week 2-4: Main Promotion
- Use **VERANO2025** for general promotion
- Share in WhatsApp groups, social media
- Track which channels work best

### Local Tennis Clubs
- Give them **SOTOGRANDE2025** code
- Track conversions from club partnerships
- Consider creating club-specific codes later

## 🆘 Common Issues & Solutions

### Discount code not working?
1. Make sure you ran `createDiscountCodes.js`
2. Check the league slug matches your URL
3. Verify code is typed in UPPERCASE
4. Check valid dates haven't expired

### Price not showing €29?
- The script sets this automatically
- Check `league.seasonConfig.price.amount` in database
- Should be 29, not 0

### URL parameter not applying?
- Make sure URL format is: `?discount=CODE`
- Check browser console for errors
- Verify frontend is checking URL params on mount

## 📈 Success Metrics

Track these in your admin panel:
- **Conversion Rate**: Registrations with code vs without
- **Code Performance**: Which code drives most signups
- **Channel Attribution**: Which promotion method works best

## 🔄 Next Season Transition

For Autumn 2025 (paid season):
1. Create new season/league
2. Set price to €29 with NO discount codes
3. Message previous players: "As a founding member, you enjoyed our free launch season. Join us again for just €29!"

---

**Need help?** Check the full implementation in `/docs/DISCOUNT_SYSTEM_IMPLEMENTATION.md`

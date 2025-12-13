# Tenis del Parque - Business Plan & Financial Calculations

> Document created: December 2024
> Purpose: Reference document for business model, costs, revenue projections, and expansion strategy

---

## Table of Contents

1. [Legal Structure & Payment Systems](#1-legal-structure--payment-systems)
2. [Autónomo Costs Breakdown](#2-autónomo-costs-breakdown)
3. [IVA (VAT) Explained](#3-iva-vat-explained)
4. [Revenue Per Player](#4-revenue-per-player)
5. [Spain Tennis Market Size](#5-spain-tennis-market-size)
6. [Income Targets & Players Needed](#6-income-targets--players-needed)
7. [Break-Even Analysis](#7-break-even-analysis)
8. [Expansion Plan (Ads-Focused)](#8-expansion-plan-ads-focused)
9. [Quarterly Tax Filings](#9-quarterly-tax-filings)

---

## 1. Legal Structure & Payment Systems

### Recommended: Autónomo with Pluriactividad

Since you're employed full-time in Spain, you can register as autónomo while keeping your job. This is called **pluriactividad**.

**Benefits of pluriactividad:**
- You already have Social Security through your employer
- Significant discounts on autónomo quota
- Can choose between tarifa plana (€80/month) or pluriactividad discount (50% off)
- Automatic refund if combined contributions exceed €16,672.66/year

**Why NOT other options:**

| Option | Why Not |
|--------|---------|
| No registration (informal) | Risk of penalties, can't use Stripe properly |
| Cooperativa de facturación | Legal gray area, being shut down, doesn't work with Stripe |
| Wyoming LLC (USA) | Spain taxes worldwide income anyway, adds complexity, no IVA benefit |
| Spanish SL (company) | Overkill for current stage, higher setup/maintenance costs |

### Registration Steps

1. Register with Hacienda (modelo 036/037) - choose your IAE (epígrafe)
2. Register with RETA (autónomos Social Security) via Importass
3. Connect Stripe to your Spanish bank account
4. Start collecting payments legally

---

## 2. Autónomo Costs Breakdown

### Year 1 (Tarifa Plana)

| Cost | Monthly | Annual | Notes |
|------|---------|--------|-------|
| Autónomo quota | €80 | €960 | Tarifa plana first 12 months |
| Gestor (accountant) | €50-80 | €600-960 | Optional but recommended |
| Stripe fees | Variable | ~3.4% | Per transaction |
| Hosting/domain | ~€20 | €240 | Infrastructure |
| Misc tools | ~€10 | €120 | Email service, etc. |
| **Total (with gestor)** | ~€160-190 | **€1,920-2,280** | |
| **Total (DIY)** | ~€110 | **€1,320** | |

### Year 2+ (Income-Based Quota)

After year 1, autónomo quota depends on your income:

| Monthly Net Income | Monthly Quota (2025) |
|-------------------|---------------------|
| ≤€670 | €200 |
| €670-900 | €220 |
| €900-1,166 | €260 |
| €1,166-1,300 | €291 |
| €1,300-1,500 | ~€320 |
| €1,500-1,700 | ~€350 |
| €1,700-1,850 | ~€370 |
| €1,850-2,030 | ~€380 |
| €2,030-2,330 | ~€400 |
| €2,330-2,760 | ~€450 |
| €2,760-3,190 | ~€490 |
| €3,190-3,620 | ~€530 |
| €3,620+ | ~€550-590 |

---

## 3. IVA (VAT) Explained

### How IVA Works

IVA is **not your money** - you collect it from players and pass it to Hacienda.

```
Player pays:        €29.00 (registration price)
├── Your revenue:   €23.97 (€29 ÷ 1.21)
└── IVA (21%):      €5.03  → Goes to Hacienda quarterly
```

### IVA You Can Deduct

You subtract IVA paid on business expenses from IVA collected:

| Business Expense | Cost | IVA Paid |
|-----------------|------|----------|
| Hosting (annual) | €200 | €42 |
| Domain | €15 | €3 |
| Software tools | €100 | €21 |
| Marketing | €500 | €105 |
| **Total deductible** | | **€171** |

**Note:** Stripe fees do NOT include IVA (Stripe is Irish company, reverse charge applies).

### Pricing Strategy

**Recommended: Price includes IVA** (cleaner for B2C)

| Display Price | Player Pays | You Keep | IVA to Hacienda |
|--------------|-------------|----------|-----------------|
| €25 | €25 | €20.66 | €4.34 |
| €29 | €29 | €23.97 | €5.03 |
| €35 | €35 | €28.93 | €6.07 |
| €39 | €39 | €32.23 | €6.77 |
| €45 | €45 | €37.19 | €7.81 |
| €49 | €49 | €40.50 | €8.50 |

---

## 4. Revenue Per Player

### At €29 Registration (IVA Included)

```
Player pays:                    €29.00
- IVA (21%):                   -€5.03
= Net after IVA:                €23.97
- Stripe fee (2.9% + €0.25):   -€1.09
= YOU KEEP:                     €22.88
```

### Revenue Per Player at Different Prices

| Price (IVA incl.) | After IVA | After Stripe | You Keep |
|-------------------|-----------|--------------|----------|
| €25 | €20.66 | -€0.98 | **€19.68** |
| €29 | €23.97 | -€1.09 | **€22.88** |
| €35 | €28.93 | -€1.27 | **€27.66** |
| €39 | €32.23 | -€1.38 | **€30.85** |
| €45 | €37.19 | -€1.56 | **€35.63** |
| €49 | €40.50 | -€1.67 | **€38.83** |

---

## 5. Spain Tennis Market Size

### The Opportunity

| Metric | Number |
|--------|--------|
| **Total tennis players in Spain** | **~3,000,000** |
| Federated players (with license) | ~91,000 |
| Casual/recreational players | ~2,900,000 |
| % of Spanish population | ~7% |

**Source:** Real Federación Española de Tenis (RFET), ITF Global Tennis Report

### Key Insight

The vast majority (97%) of Spanish tennis players are **NOT federated** - they play casually at clubs, with friends, without official rankings. **This is your target market.**

### Tennis Cities in Spain

Spain has 50+ cities with active tennis communities:

| Region | Major Tennis Cities |
|--------|---------------------|
| Andalucía | Málaga, Sevilla, Granada, Marbella, Córdoba, Cádiz, Almería, Jerez, Estepona, Mijas, Fuengirola |
| Cataluña | Barcelona, Tarragona, Girona, Lleida, Sabadell, Terrassa |
| Madrid | Madrid, Alcalá, Pozuelo, Las Rozas, Majadahonda |
| Valencia | Valencia, Alicante, Castellón, Elche, Benidorm |
| País Vasco | Bilbao, San Sebastián, Vitoria |
| Baleares | Palma de Mallorca, Ibiza |
| Canarias | Las Palmas, Tenerife |
| Others | Zaragoza, Murcia, Valladolid, Santander, A Coruña, Vigo |

**Finding 25-40 tennis cities is NOT a problem.**

---

## 6. Income Targets & Players Needed

### Assumptions

- Price: €29 per registration (IVA included)
- Net per player: €22.88
- Seasons per year: 4
- IRPF marginal rate: 35% (assuming you're in higher brackets due to salary)

### The Formula

```
Players needed = (Target Net Income ÷ 0.65 + Annual Costs) ÷ €22.88 per player
```

### Calculations by Income Target

#### Target: €3,000/month net (€36,000/year)

```
Pre-tax profit needed:     €36,000 ÷ 0.65 = €55,385
Annual costs (at scale):   €6,360
Total gross profit needed: €61,745
Players per year:          €61,745 ÷ €22.88 = 2,699
Players per season:        2,699 ÷ 4 = 675
```

#### Target: €10,000/month net (€120,000/year)

```
Pre-tax profit needed:     €120,000 ÷ 0.60 = €200,000 (higher tax bracket)
Annual costs (at scale):   €12,600
Total gross profit needed: €212,600
Players per year:          €212,600 ÷ €22.88 = 9,293
Players per season:        9,293 ÷ 4 = 2,324
```

### Summary Table: Players Needed per Season

| Monthly Net Goal | Annual Net | Pre-tax Needed | Players/Year | Players/Season |
|------------------|------------|----------------|--------------|----------------|
| €500 | €6,000 | €10,500 | 680 | **170** |
| €1,000 | €12,000 | €20,100 | 1,085 | **271** |
| €1,500 | €18,000 | €29,700 | 1,490 | **373** |
| €2,000 | €24,000 | €39,300 | 1,890 | **473** |
| €2,500 | €30,000 | €48,900 | 2,295 | **574** |
| €3,000 | €36,000 | €61,745 | 2,699 | **675** |
| €5,000 | €60,000 | €107,600 | 4,951 | **1,238** |
| €7,500 | €90,000 | €162,600 | 7,456 | **1,864** |
| €10,000 | €120,000 | €212,600 | 9,293 | **2,324** |

### Market Penetration Required

| Target | Players/Season | % of Spain's 3M Tennis Players |
|--------|----------------|-------------------------------|
| €3,000/month | 675 | 0.023% |
| €10,000/month | 2,324 | **0.077%** |

**You need less than 0.1% of Spanish tennis players to hit €10k/month.**

---

## 7. Break-Even Analysis

### When Does It Make Sense to Register as Autónomo?

**Fixed costs (Year 1):** €1,320-2,280/year

| Price | Net per Player | Break-even Players/Year |
|-------|---------------|------------------------|
| €29 | €22.88 | 58-100 |
| €39 | €30.85 | 43-74 |
| €49 | €38.83 | 34-59 |

**Recommendation:** Register when you're confident of 50+ paid registrations per year.

### Profit Scenarios (Year 1)

| Players/Year | Gross Revenue | Net Revenue | Costs | Profit Before IRPF | After IRPF (~30%) |
|--------------|---------------|-------------|-------|-------------------|-------------------|
| 100 | €2,900 | €2,288 | €1,800 | €488 | €342 |
| 200 | €5,800 | €4,576 | €1,900 | €2,676 | €1,873 |
| 300 | €8,700 | €6,864 | €2,000 | €4,864 | €3,405 |
| 500 | €14,500 | €11,440 | €2,200 | €9,240 | €6,468 |

---

## 8. Expansion Plan (Ads-Focused)

### Strategy: Solo Expansion via Paid Ads & Social Media

No ambassadors, no club partnerships - pure digital acquisition.

### Advertising Channels

| Channel | Best For | Cost Model |
|---------|----------|------------|
| **Facebook/Instagram Ads** | Broad reach, targeting by location + interests | CPC/CPM |
| **Google Ads** | Capturing search intent ("liga tenis Madrid") | CPC |
| **Instagram Organic** | Brand building, community | Free (time) |
| **TikTok** | Younger players, viral potential | CPC/CPM |

### Target Audience (Facebook/Instagram)

```
Location: [Target City] + 25km radius
Age: 25-55
Interests: Tennis, Racket sports, ATP Tour, Roland Garros, Sports
Behaviors: Sports enthusiasts, Active lifestyle
Language: Spanish
```

### Estimated Acquisition Costs

| Metric | Conservative | Moderate | Optimistic |
|--------|--------------|----------|------------|
| Cost per click (CPC) | €0.50 | €0.30 | €0.15 |
| Landing page conversion | 5% | 8% | 12% |
| Cost per registration | €10.00 | €3.75 | €1.25 |

**At €29/registration and €22.88 net:**
- Conservative: €10 CAC → €12.88 profit per player
- Moderate: €3.75 CAC → €19.13 profit per player
- Optimistic: €1.25 CAC → €21.63 profit per player

### Monthly Ad Budget by Phase

| Phase | Monthly Budget | Expected Registrations | Cities Active |
|-------|----------------|----------------------|---------------|
| Testing | €100-200 | 25-50 | 1-2 |
| Growth | €500-1,000 | 130-260 | 5-10 |
| Scale | €2,000-3,000 | 500-800 | 15-25 |
| Mature | €3,000-5,000 | 800-1,300 | 25-35 |

### 5-Year Expansion Timeline

#### Year 1: Foundation & Testing (4 cities)

| Quarter | Focus | Cities | Ad Budget | Target Players |
|---------|-------|--------|-----------|----------------|
| Q1 | Launch Sotogrande paid | 1 | €0 (organic) | 30-50 |
| Q2 | Test ads Costa del Sol | 2-3 | €300 | 50-80 |
| Q3 | Optimize campaigns | 3-4 | €400 | 80-120 |
| Q4 | Refine, prepare Year 2 | 4 | €300 | 100-150 |

**Year 1 Totals:** 4 cities, ~€1,000 ad spend, 150-200 players/season, **€300-500/month net**

#### Year 2: Regional Growth (12 cities)

| Quarter | Focus | Cities | Ad Budget | Target Players |
|---------|-------|--------|-----------|----------------|
| Q1 | Expand Andalucía | 6 | €600 | 200-250 |
| Q2 | Add Madrid test | 8 | €800 | 300-350 |
| Q3 | Scale winning cities | 10 | €1,000 | 400-450 |
| Q4 | Consolidate | 12 | €800 | 500-550 |

**Year 2 Totals:** 12 cities, ~€3,200 ad spend, 500-600 players/season, **€1,500-2,000/month net**

#### Year 3: Multi-Region (22 cities)

| Quarter | Focus | Cities | Ad Budget | Target Players |
|---------|-------|--------|-----------|----------------|
| Q1 | Barcelona + Valencia | 15 | €1,500 | 700-800 |
| Q2 | País Vasco test | 18 | €1,800 | 900-1,000 |
| Q3 | Fill gaps | 20 | €2,000 | 1,000-1,100 |
| Q4 | Optimize all | 22 | €1,800 | 1,100-1,200 |

**Year 3 Totals:** 22 cities, ~€7,100 ad spend, 1,100-1,200 players/season, **€4,000-5,000/month net**

#### Year 4: National Coverage (32 cities)

| Quarter | Focus | Cities | Ad Budget | Target Players |
|---------|-------|--------|-----------|----------------|
| Q1 | Secondary cities | 25 | €2,500 | 1,400-1,500 |
| Q2 | Islands (Mallorca, Canarias) | 28 | €2,800 | 1,600-1,700 |
| Q3 | Fill remaining gaps | 30 | €3,000 | 1,800-1,900 |
| Q4 | Maximize retention | 32 | €2,800 | 1,900-2,000 |

**Year 4 Totals:** 32 cities, ~€11,100 ad spend, 1,900-2,000 players/season, **€7,000-8,000/month net**

#### Year 5: Scale & Optimize (38+ cities)

| Quarter | Focus | Cities | Ad Budget | Target Players |
|---------|-------|--------|-----------|----------------|
| Q1 | Final expansion | 35 | €3,500 | 2,100-2,200 |
| Q2 | Brand campaigns | 36 | €3,500 | 2,200-2,300 |
| Q3 | Retention focus | 37 | €3,200 | 2,300-2,400 |
| Q4 | Optimize CAC | 38 | €3,000 | 2,400-2,500 |

**Year 5 Totals:** 38 cities, ~€13,200 ad spend, 2,400-2,500 players/season, **€10,000+/month net**

### City Launch Sequence (Ads Strategy)

#### Phase 1: Costa del Sol (Year 1)
1. Sotogrande ✓
2. Marbella
3. Estepona
4. Málaga

#### Phase 2: Andalucía (Year 2)
5. Fuengirola
6. Benalmádena
7. Sevilla
8. Granada
9. Córdoba
10. Cádiz
11. Jerez
12. Almería

#### Phase 3: Major Markets (Year 3)
13. Madrid
14. Barcelona
15. Valencia
16. Alicante
17. Bilbao
18. San Sebastián
19. Zaragoza
20. Murcia
21. Palma de Mallorca
22. Tarragona

#### Phase 4: Secondary Markets (Year 4)
23. Castellón
24. Santander
25. Valladolid
26. A Coruña
27. Vigo
28. Girona
29. Las Palmas
30. Tenerife
31. Pamplona
32. Vitoria

#### Phase 5: Fill Gaps (Year 5)
33-38. Remaining cities based on demand signals

### Ad Creative Strategy

#### Types of Ads to Test

| Ad Type | Purpose | When to Use |
|---------|---------|-------------|
| **Awareness** | Introduce the concept | New city launch |
| **Social proof** | Show active players, testimonials | Growing cities |
| **Urgency** | "Season starts in X days" | Registration deadlines |
| **Retargeting** | Re-engage visitors | Ongoing |

#### Key Messages to Test

1. "¿Buscas rival de tenis en [Ciudad]? Únete a nuestra liga amateur"
2. "Liga de tenis con rankings ELO - Encuentra rivales de tu nivel"
3. "Temporada de verano 2025 - Inscripciones abiertas"
4. "Sin federarte. Sin complicaciones. Solo tenis."
5. "Partidos flexibles, rankings reales, comunidad local"

#### Landing Page per City

Each city should have dedicated landing page:
```
tenisdelparque.com/ciudades/malaga
tenisdelparque.com/ciudades/madrid
tenisdelparque.com/ciudades/barcelona
```

Optimized for:
- Local SEO ("liga tenis Málaga")
- Conversion (clear CTA, social proof)
- Mobile (most traffic will be mobile)

### Campaign Structure (Facebook/Instagram)

```
Campaign: Tenis del Parque - [City]
├── Ad Set: Broad Tennis Interest
│   ├── Ad: Awareness Video
│   ├── Ad: Testimonial Carousel
│   └── Ad: Registration CTA
├── Ad Set: Competitor Interest (padel players, other sports)
│   ├── Ad: "¿Juegas al tenis?"
│   └── Ad: Cross-sport appeal
└── Ad Set: Retargeting (website visitors)
    ├── Ad: "Completa tu inscripción"
    └── Ad: Season deadline urgency
```

### Success Metrics to Track

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| CPC | <€0.40 | Improve ad creative |
| CTR | >1.5% | Test new headlines/images |
| Landing conversion | >8% | Optimize page |
| CAC | <€5 | Scale budget |
| CAC | >€8 | Pause, analyze, optimize |

### Organic Social Strategy (Free)

In parallel with paid ads:

| Platform | Frequency | Content Type |
|----------|-----------|--------------|
| Instagram | 3-4x/week | Match highlights, rankings, player stories |
| Facebook | 2-3x/week | Event announcements, results, community |
| TikTok | 2x/week | Fun tennis content, behind-the-scenes |

**Goal:** Build organic following that reduces dependence on paid ads over time.

---

## 9. Quarterly Tax Filings

### What You File as Autónomo

| Form | Frequency | Deadline | What It Is |
|------|-----------|----------|------------|
| **Modelo 303** | Quarterly | Apr 20, Jul 20, Oct 20, Jan 20 | IVA declaration (collected - paid) |
| **Modelo 130** | Quarterly | Same as above | IRPF prepayment (20% of profit) |
| **Modelo 390** | Annual | January 30 | IVA annual summary |
| **Renta (IRPF)** | Annual | April-June | Income tax return |

### Example Quarterly Filing (Modelo 303)

```
IVA collected from players:     €1,500 (60 players × €25 IVA each... wait)
Let me recalculate:             60 players × €29 = €1,740 gross
                                IVA portion: €1,740 - (€1,740/1.21) = €302

IVA paid on expenses:           -€50 (hosting, tools, etc.)
IVA to pay Hacienda:            €252
```

### Example Quarterly Filing (Modelo 130)

```
Gross income:                   €1,437.60 (€1,740 - IVA)
Deductible expenses:            -€400 (autónomo quota, hosting, ads, etc.)
Net profit:                     €1,037.60
IRPF prepayment (20%):          €207.52
```

---

## Summary: The Path to €10,000/month

| Year | Cities | Players/Season | Ad Spend/Year | Monthly Net |
|------|--------|----------------|---------------|-------------|
| 1 | 4 | 150-200 | €1,000 | €300-500 |
| 2 | 12 | 500-600 | €3,200 | €1,500-2,000 |
| 3 | 22 | 1,100-1,200 | €7,100 | €4,000-5,000 |
| 4 | 32 | 1,900-2,000 | €11,100 | €7,000-8,000 |
| 5 | 38 | 2,400-2,500 | €13,200 | **€10,000+** |

### Key Numbers to Remember

- **Price:** €29/registration (IVA included)
- **You keep:** €22.88 per player (after IVA + Stripe)
- **Target for €10k/month:** 2,324 players/season
- **Market size:** 3 million tennis players in Spain
- **Market share needed:** 0.077% (less than 0.1%)

### The Bottom Line

The math works. Spain has the market. The question is execution.

---

*Last updated: December 2024*

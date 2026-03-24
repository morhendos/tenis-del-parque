# Tenis del Parque — Test Campaign Plan
## Málaga City · Meta Ads · €150 Budget · Real Season

---

## Goal

Get real-world data to calibrate the business model. Specifically:

| Metric | What it tells us | How we measure |
|--------|-----------------|----------------|
| **CAC** | Cost per registered player | Total spend ÷ paid registrations |
| **Half-point** | Where diminishing returns kick in | Compare CPA across 3 budget levels |
| **k (steepness)** | How fast returns diminish | CPA ratio between budget levels |
| **Organic %** | Free signups from word-of-mouth | Registrations with no ad attribution |
| **Conversion funnel** | Where people drop off | Impressions → clicks → visits → registrations |

---

## Campaign Structure: 3 Weeks × Escalating Spend

The trick: **vary your weekly budget** so you get 3 data points on the diminishing returns curve, not just one.

| Week | Daily Budget | Weekly Spend | Purpose |
|------|-------------|-------------|---------|
| **Week 1** | €5/day | ~€35 | Baseline — cheap reach, find your floor CPA |
| **Week 2** | €10/day | ~€70 | Middle — does doubling spend double signups? |
| **Week 3** | €7/day | ~€45 | Control — back down to confirm Week 1 wasn't a fluke |

**Total: ~€150**

### Why this structure works

If Week 1 gets 8 signups (CPA = €4.40) and Week 2 gets 11 signups (CPA = €6.40), you know:
- Doubling spend only gave 37% more signups → **k is high (~1.5-2.0)**, the market saturates fast
- Your half-point is probably around €35-40/week (~€150/month)

If Week 2 gets 15 signups (CPA = €4.70), then:
- Doubling spend nearly doubled signups → **k is low (~0.5-0.8)**, the market is deep
- Your half-point is much higher, maybe €100+/week

---

## Ad Setup

### Audience Targeting (Málaga)

```
Location:     Málaga city + 15km radius
Age:          25-55
Interests:    Tennis, Padel (catches crossover players), 
              Racquet sports, ATP Tour, Roland Garros
Behaviors:    Sports & outdoors enthusiasts
Language:     Spanish + English (catches expats)
```

### Creative — Run 2 Variants (A/B)

**Variant A: Competition angle**
> 🎾 ¿Buscas partidos de tenis competitivos en Málaga?
> 
> Liga local con ranking ELO, emparejamientos justos y temporadas de 10 semanas.
> Todos los niveles. Inscripción €30.
> 
> → Inscríbete para la próxima temporada

**Variant B: Community angle**
> 🎾 Únete a la liga de tenis de Málaga
> 
> Deja de buscar rivales. Partidos semanales contra jugadores de tu nivel,
> ranking en vivo, y una comunidad de tenistas locales.
> 
> → Plazas limitadas — Apúntate ya

### Ad Format
- **Placement**: Instagram Feed + Stories + Facebook Feed
- **Format**: Single image (action shot of amateur players on court, NOT pro players)
- **CTA button**: "Sign Up" / "Registrarse"
- **Landing page**: Direct to Málaga league registration page

---

## Tracking Setup (Critical)

### UTM Parameters

Tag every ad link so you can separate paid vs organic:

```
https://tenisdelparque.com/malaga/register?utm_source=meta&utm_medium=paid&utm_campaign=malaga_test&utm_content=competition_v1
```

```
https://tenisdelparque.com/malaga/register?utm_source=meta&utm_medium=paid&utm_campaign=malaga_test&utm_content=community_v1
```

### What to Track Daily

Create a simple spreadsheet:

| Day | Spend | Impressions | Clicks | CTR | Visits (GA) | Registrations | CPA | Notes |
|-----|-------|-------------|--------|-----|-------------|---------------|-----|-------|
| Mon W1 | €5 | | | | | | | |
| Tue W1 | €5 | | | | | | | |
| ... | | | | | | | | |

### Organic Tracking

Any registration WITHOUT utm_source=meta is organic. Track these separately.
Also note: if someone sees your ad, tells a friend, and the friend registers — that's organic but ad-influenced. You can't track this perfectly, but it's real.

---

## Data Collection Template

After 3 weeks, fill in:

### Raw Numbers

```
Week 1 (€5/day):
  Spend:          €___
  Impressions:    ___
  Clicks:         ___
  Registrations:  ___ (paid) + ___ (organic)
  CPA:            €___

Week 2 (€10/day):
  Spend:          €___
  Impressions:    ___
  Clicks:         ___
  Registrations:  ___ (paid) + ___ (organic)
  CPA:            €___

Week 3 (€7/day):
  Spend:          €___
  Impressions:    ___
  Clicks:         ___
  Registrations:  ___ (paid) + ___ (organic)
  CPA:            €___
```

### Derived Metrics (for the business model)

```
Overall CAC:              Total spend ÷ total paid registrations = €___
Organic %:                Organic regs ÷ total regs × 100 = ___%

CPA at €5/day:            €___
CPA at €10/day:           €___
CPA ratio (W2÷W1):        ___x

If ratio ≈ 1.0 → k is low (0.5-0.8), half-point is high
If ratio ≈ 1.5 → k is moderate (1.0-1.2), half-point is near your W2 spend
If ratio ≈ 2.0+ → k is high (1.5+), half-point is below your W1 spend

Estimated monthly half-point: Weekly spend where CPA starts climbing × 4.3 = €___/mo
Estimated k:                  See chart in business plan Growth tab for calibration
```

### Conversion Funnel

```
Impressions → Clicks:     ___% CTR (good: >1.5% for sports/local)
Clicks → Page visit:      ___% (should be >90%, if low = slow page)
Visit → Registration:     ___% (good: >5% for direct response)
```

---

## How to Apply Results to the Business Model

Once you have the data, update these sliders:

| Data point | Slider to update |
|-----------|-----------------|
| CPA | **CAC per Player** (Acquisition section) |
| Organic % | **Organic %** (Acquisition section) |
| CPA ratio between weeks | **Response Steepness k** (Marketing Response section) |
| Monthly half-point estimate | **Mktg Half-Point** (Marketing Response section) |
| Funnel conversion rate | Informs **Max Fill Rate** ceiling |

### Example

Say you get:
- 25 total registrations over 3 weeks (18 paid, 7 organic)
- Overall CPA: €8.33
- Organic: 28%
- CPA at €5/day: €6, CPA at €10/day: €9 → ratio 1.5x
- Half-point estimate: ~€35/week → €150/month

You'd set:
- CAC per Player → €8
- Organic % → 28%
- Response Steepness k → 1.2
- Mktg Half-Point → €150
- Max Fill Rate → maybe lower it if conversion was poor

Then re-check your SOM and Penetration — they'll now be based on real data, not guesses.

---

## Timeline

```
Week 0 (prep):     Set up Meta Business Manager, create ads, 
                    set up UTM tracking, prepare landing page
Week 1-3:          Run campaign with escalating budgets  
Week 4:            Analyze results, update business model
```

## Minimum Success Criteria

The test is "worth it" if you get at least **15 total registrations**. Below that, the data is too noisy to draw conclusions. If you're getting <2 registrations per week, consider:
- The creative isn't resonating → test different messaging
- The audience is wrong → broaden or narrow targeting
- The landing page isn't converting → check mobile experience

Even 0 registrations is valuable data — it tells you the market needs a different approach.

---

## Budget Fallback

If €150 feels like too much for a test:

**Minimum viable test: €70**
- Week 1: €5/day × 7 days = €35
- Week 2: €5/day × 7 days = €35
- You get baseline CPA but NOT the diminishing returns data (no budget variation)
- Still useful for CAC and organic % estimates

# Season 3 Launch Plan (Sep 2026)

Goal: launch Season 3 in Sotogrande/La Línea, PAID entry, done properly.
Reference doc for the gestor calls: ALTA_ONEPAGER.md (same folder).

## Track 1 - Legal / money setup (Tom)
- [x] Sign up at Xolo (xolo.io) - DONE Sep 6, Global plan, alta scheduled ~Sep 15
- [ ] AFTER alta: open Cuenta Online Sabadell Autonomos (400 EUR back year 1 for domiciling RETA there + ~1% on balance; VERIFY promo applies to existing clients - if not, check BBVA/Unicaja ~450 EUR) - note the IBAN
- [ ] Give the new IBAN to Xolo/TGSS for the RETA debit (first charge ~Sep 30)
- [ ] Standing order 50-100 EUR personal -> business account, end of month (payday)
- [ ] Switch payout IBANs to business account: Stripe, App Store Connect, Play Console
- [ ] (after 12 months) Apply for Andalucía cuota cero refund (~1,000 EUR, if program renewed)

## Track 2 - Payments on tenisdp.es (Claude)
- [x] Review current season registration flow (paymentStatus/finalPrice/discounts already in place)
- [ ] Stripe Checkout integration - pay to complete registration (test mode)
- [ ] Webhook marks player as paid; no payment = no spot
- [ ] Decide season fee (21% IVA baked into public price, round number)
- [ ] Go LIVE the day the alta is filed
- [ ] App = free perk for paid players

## Track 3 - Marketing (after payments live)
- [ ] AI video: 15-20s vertical 9:16, ES + EN versions (Kling / Veo)
- [ ] Meta campaign: radius Sotogrande + La Línea + San Roque, tennis interests, ~3 EUR/day
- [ ] Review after 1 week: cost per signup -> kill or scale

## Numbers to remember
- RETA: ~89 EUR/month (tarifa plana), auto-debited last working day of month, first charge ~Sep 30 (half month). NEVER let this debit bounce.
- Tarifa plana year 2: only if net autónomo income < 17,094 EUR/year (SMI)
- Set aside: ~30% of app payouts (IRPF), ~45% of tennis fees (IVA 21% + IRPF)
- Quarterly: Xolo files modelo 303 (IVA) + 130 (IRPF advance), auto-debited
- Escape hatch: baja = one filing, costs stop that month

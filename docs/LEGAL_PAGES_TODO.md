# Legal Pages - Pending Updates

## Placeholders to update before accepting payments

Once registered as autónomo, update these fields in:

**File:** `lib/content/legalContent.js`

### 1. NIF (Tax ID)
- **Spanish** (`es.avisoLegal`, section `titular`): Replace `[Se actualizará tras el registro como autónomo]`
- **English** (`en.avisoLegal`, section `owner`): Replace `[To be updated upon autónomo registration]`

### 2. Business Address (Domicilio)
- **Spanish** (`es.avisoLegal`, section `titular`): Replace `[Se actualizará tras el registro como autónomo]`
- **English** (`en.avisoLegal`, section `owner`): Replace `[To be updated upon autónomo registration]`

## Pages overview

All content lives in `lib/content/legalContent.js` (bilingual ES/EN):

| Page | ES route | EN route |
|------|----------|----------|
| Aviso Legal | `/es/aviso-legal` | `/en/legal-notice` |
| Política de Privacidad | `/es/politica-privacidad` | `/en/privacy-policy` |
| Política de Cookies | `/es/politica-cookies` | `/en/cookie-policy` |
| Términos y Condiciones | `/es/terminos-condiciones` | `/en/terms-conditions` |

## Notes
- Comments were removed from the content file (Feb 2026) to keep source clean since pages are live
- Reusable component: `components/legal/LegalPageContent.js`
- All pages linked from the site Footer

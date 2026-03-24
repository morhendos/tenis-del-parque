'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, ReferenceLine, Cell
} from 'recharts'

// ============================================================
// CONSTANTS
// ============================================================
const TABS = ['Market', 'Overview', 'Growth', 'Unit Economics', 'P&L', 'Cash Flow', 'Sensitivity']
const MONTHS_LABEL = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const COLORS = {
  emerald: '#10b981', red: '#ef4444', amber: '#f59e0b',
  purple: '#8b5cf6', cyan: '#06b6d4', pink: '#ec4899',
  blue: '#3b82f6', lime: '#84cc16', orange: '#f97316'
}

// ============================================================
// MARKET SIZE DATA
// Sources: RFET (Real Federacion Espanola de Tenis) 2024, INE, Municipal Sports Councils
// ============================================================
const MARKET = {
  spain: {
    licensedPlayers: 96_000,
    recreationalPlayers: 580_000,
    totalPlayers: 676_000,
    clubs: 1_850,
    courts: 12_000,
    population: 48_000_000,
    label: 'Spain'
  },
  andalucia: {
    licensedPlayers: 12_500,
    recreationalPlayers: 75_000,
    totalPlayers: 87_500,
    clubs: 280,
    courts: 1_800,
    population: 8_500_000,
    label: 'Andalucia'
  },
  // City data for expansion modeling
  cities: [
    // ── Phase 1: Costa del Sol ──
    { name: 'Sotogrande', population: 35_000, tennisPlayers: 1_200, clubs: 4, courts: 15, targetPlayers: 40, phase: 1, notes: 'Ultra-affluent enclave. Strong expat tennis culture. Club El Faisan partnership.' },
    { name: 'Marbella', population: 150_000, tennisPlayers: 5_000, clubs: 10, courts: 60, targetPlayers: 80, phase: 1, notes: 'Affluent international community. Year-round play. Major tournament venue.' },
    { name: 'Estepona', population: 75_000, tennisPlayers: 2_000, clubs: 4, courts: 25, targetPlayers: 50, phase: 1, notes: 'Fast-growing coastal town. Good club infrastructure. Growing expat base.' },
    { name: 'Fuengirola', population: 85_000, tennisPlayers: 2_500, clubs: 5, courts: 30, targetPlayers: 50, phase: 1, notes: 'Large Nordic/British expat community. Active sports culture.' },
    { name: 'Benalmadena', population: 75_000, tennisPlayers: 2_000, clubs: 4, courts: 20, targetPlayers: 40, phase: 1, notes: 'Tourist hub with year-round resident base. Good court availability.' },
    { name: 'Mijas', population: 90_000, tennisPlayers: 1_800, clubs: 3, courts: 18, targetPlayers: 35, phase: 1, notes: 'Residential area. Mix of expats and locals.' },
    { name: 'Malaga City', population: 580_000, tennisPlayers: 12_000, clubs: 15, courts: 120, targetPlayers: 120, phase: 1, notes: 'Capital city. Tech hub. Largest player pool on Costa del Sol.' },
    { name: 'Nerja / Velez-Malaga', population: 120_000, tennisPlayers: 2_500, clubs: 5, courts: 30, targetPlayers: 50, phase: 1, notes: 'Eastern Costa del Sol. Less competitive market.' },
    { name: 'Torremolinos', population: 70_000, tennisPlayers: 1_500, clubs: 3, courts: 15, targetPlayers: 35, phase: 1, notes: 'Dense tourist/residential area near Malaga airport.' },
    { name: 'Manilva / Casares', population: 25_000, tennisPlayers: 800, clubs: 2, courts: 8, targetPlayers: 25, phase: 1, notes: 'Western Costa del Sol near Sotogrande.' },
    // ── Phase 2: Rest of Andalucia ──
    { name: 'Sevilla', population: 690_000, tennisPlayers: 15_000, clubs: 20, courts: 150, targetPlayers: 100, phase: 2, notes: 'Largest city in Andalucia. Strong club culture. Hot summers limit outdoor play.' },
    { name: 'Granada', population: 230_000, tennisPlayers: 5_000, clubs: 8, courts: 50, targetPlayers: 60, phase: 2, notes: 'University city. Seasonal weather (cold winters). Growing tennis scene.' },
    { name: 'Cordoba', population: 325_000, tennisPlayers: 4_000, clubs: 6, courts: 40, targetPlayers: 50, phase: 2, notes: 'Inland city. Extreme summer heat. Strong club scene.' },
    { name: 'Cadiz / Jerez', population: 350_000, tennisPlayers: 5_000, clubs: 8, courts: 45, targetPlayers: 60, phase: 2, notes: 'Coastal cities. Year-round play possible. Growing sports culture.' },
    { name: 'Almeria', population: 200_000, tennisPlayers: 2_500, clubs: 4, courts: 25, targetPlayers: 40, phase: 2, notes: 'Sunny climate. Smaller market but less competition.' },
    { name: 'Jaen', population: 115_000, tennisPlayers: 1_500, clubs: 3, courts: 15, targetPlayers: 25, phase: 2, notes: 'Inland. Smaller market.' },
    { name: 'Huelva', population: 150_000, tennisPlayers: 2_000, clubs: 4, courts: 20, targetPlayers: 35, phase: 2, notes: 'Western Andalucia. Near Portugal border.' },
    // ── Phase 3: Spain National ──
    { name: 'Madrid', population: 3_300_000, tennisPlayers: 80_000, clubs: 120, courts: 800, targetPlayers: 200, phase: 3, notes: '19K+ licensed. Club de Campo alone has 10K members. Massive market.' },
    { name: 'Barcelona', population: 1_600_000, tennisPlayers: 45_000, clubs: 80, courts: 500, targetPlayers: 180, phase: 3, notes: 'Most licensed players per region. Strong padel competition.' },
    { name: 'Valencia', population: 800_000, tennisPlayers: 20_000, clubs: 30, courts: 200, targetPlayers: 100, phase: 3, notes: 'Third-largest city. Good climate. Growing tennis infrastructure.' },
    { name: 'Bilbao / Pais Vasco', population: 950_000, tennisPlayers: 12_000, clubs: 20, courts: 100, targetPlayers: 80, phase: 3, notes: 'Affluent region. Strong sports culture. Weather limits outdoor play.' },
    { name: 'Zaragoza', population: 680_000, tennisPlayers: 8_000, clubs: 12, courts: 80, targetPlayers: 60, phase: 3, notes: 'Fifth-largest city. Central location.' },
    { name: 'Mallorca / Canarias', population: 1_200_000, tennisPlayers: 15_000, clubs: 25, courts: 150, targetPlayers: 80, phase: 3, notes: 'Island markets. Year-round play. Nadal Academy effect in Mallorca.' },
    { name: 'Alicante / Murcia', population: 1_500_000, tennisPlayers: 18_000, clubs: 25, courts: 160, targetPlayers: 80, phase: 3, notes: 'Southeastern coast. Good climate. Expat communities.' },
  ],
}

// ============================================================
// TIPS DICTIONARY
// ============================================================
const TIPS = {
  // Header
  'Break-even': 'The month when cumulative cash turns positive, meaning total revenue has exceeded total costs including initial investment.',
  'Y3 Revenue': 'Total revenue in Year 3 from all league registration fees across all cities.',
  'Y3 Net': 'Year 3 net profit: registration revenue minus ALL operating costs.',
  'Monthly Net @36': 'Net profit in Month 36. This is your monthly take-home at the end of the 3-year model.',
  // Overview
  'Active Cities': 'Number of cities with at least one running league at end of period.',
  'Total Leagues': 'Total number of active leagues across all cities. Cities can have multiple leagues (different skill levels).',
  'Active Players': 'Total unique registered players across all active leagues at end of period.',
  'Rev / Player / Season': 'Average revenue generated per player per season after accounting for free/discount registrations.',
  'Monthly Revenue': 'Total monthly revenue from all league registrations across all cities.',
  'Monthly Costs': 'Total monthly operating costs: hosting, marketing, court fees, admin.',
  // Growth
  'Cities Y1': 'Number of active cities by end of Year 1.',
  'Players Y1': 'Total active players by end of Year 1.',
  'Retention': 'Percentage of players who re-register for the next season. Higher retention = lower acquisition costs.',
  'Fill Rate': 'Average percentage of max capacity filled per league. Computed from marketing spend × city maturity curve.',
  'Mktg Response': 'Fill rate follows a saturation curve: organic baseline + marketing lift × city maturity. Diminishing returns on ad spend.',
  'Organic Fill': 'Baseline fill rate with zero marketing spend. Driven by WhatsApp sharing, word-of-mouth, organic search.',
  'Max Fill': 'Theoretical ceiling fill rate even with unlimited spend. Limited by market size, competition, and seasonal factors.',
  'Half-Point': 'Monthly ad spend per city that achieves 50% of the maximum marketing lift. Lower = market responds more to ads.',
  'Steepness': 'How sharply returns diminish. Low (0.5) = gradual curve, more linear. High (2.0+) = steep initial gains then flat. Standard: 0.7-1.5.',
  'Maturity': 'Months for a newly launched city to reach ~95% of its fill potential. Reflects brand awareness, local network effects.',
  // Unit Economics
  'Rev / City / Mo': 'Average monthly revenue per active city. Key driver for expansion decisions.',
  'Cost / City / Mo': 'Average monthly cost per active city including proportional share of fixed costs.',
  'Profit / City / Mo': 'Net profit per active city per month. Must be positive for sustainable expansion.',
  'CAC': 'Cost to acquire one new player. Includes marketing spend and any promotional discounts.',
  'LTV': 'Lifetime value of a player. Total revenue expected from one player across all seasons they participate.',
  'LTV:CAC': 'Lifetime Value to Acquisition Cost ratio. Above 3x is healthy. Above 5x is excellent.',
  'Payback': 'Months to recoup the cost of launching a new city from that city&apos;s revenue.',
  // P&L
  'Registration Revenue': 'Total revenue from player registration fees. Main revenue stream.',
  'Hosting Costs': 'Server hosting (Vercel, MongoDB Atlas) and infrastructure costs.',
  'Marketing': 'Social media advertising (Meta/Google Ads) for player acquisition.',
  'Court Costs': 'Any court booking subsidies or facility partnerships.',
  'Admin Costs': 'Platform administration, customer support, league management time.',
  // Cash Flow
  'Initial Investment': 'Upfront costs: platform development time, domain, initial marketing, tools setup.',
  'Cumulative B/E': 'Month when cumulative net cash turns positive. All initial investment has been recovered.',
  'Y1 End Cash': 'Cash position at end of Year 1. Negative = still recouping investment.',
  'Y3 End Cash': 'Cash position at end of Year 3. Total accumulated profit minus initial investment.',
  // Market
  'TAM': 'Total Addressable Market: all recreational tennis players in Spain who could join a local league.',
  'SAM': 'Serviceable Addressable Market: tennis players in the 24 cities you plan to expand into.',
  'SOM': 'Serviceable Obtainable Market: your model\'s projected active players at Month 36. This is an OUTPUT of your assumptions (expansion pace, marketing, pricing, retention) — not a fixed target. Every slider in the dashboard affects this number.',
  'Penetration': 'M36 active players ÷ Target Segment. What share of the league-joinable market your model projects you\'ll capture by Year 3. Target Segment = SAM × Target Capture %.',
  'Target Segment': 'The slice of SAM (tennis players in your 24 cities) who could realistically join a structured league. Computed as SAM × Target Capture %. This is the denominator for Penetration.',
  'Target Capture': 'What percentage of tennis players in each city you think could realistically join a structured league. This is a market-sizing assumption — it scales the \"Target\" column in the city tables and sets the theoretical ceiling per city. The actual capture depends on your model\'s fill rates, expansion speed, and marketing.',
}

// ============================================================
// UI COMPONENTS
// ============================================================
function Slider({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '', tooltip }) {
  const display = step < 1 ? value.toFixed(2) : value.toLocaleString()
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-gray-600">
          {label} {tooltip && <span className="text-gray-400 cursor-help" title={tooltip}>ⓘ</span>}
        </label>
        <span className="text-sm font-bold text-gray-900 tabular-nums">{prefix}{display}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg cursor-pointer accent-purple-600"
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{prefix}{step < 1 ? min.toFixed(2) : min.toLocaleString()}{suffix}</span>
        <span>{prefix}{step < 1 ? max.toFixed(2) : max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  )
}

function InfoTip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Info"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 12.412H7.07V7.177h1.86v5.235zM8 6.176a1.016 1.016 0 110-2.033 1.016 1.016 0 010 2.033z"/>
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-200 leading-relaxed whitespace-normal">
          {text}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800" />
        </div>
      )}
    </span>
  )
}

function KPI({ label, value, sub, color = 'emerald' }) {
  const c = {
    emerald: 'text-emerald-600', red: 'text-red-600', amber: 'text-amber-600',
    purple: 'text-purple-600', cyan: 'text-cyan-600', blue: 'text-blue-600',
    orange: 'text-orange-600'
  }
  const tip = TIPS[label]
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm relative">
      <div className="flex items-center mb-1">
        <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
        {tip && <InfoTip text={tip} />}
      </div>
      <div className={`text-lg font-bold ${c[color] || 'text-emerald-600'}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${className}`}>
      <h3 className="text-sm font-bold text-gray-700 mb-3">{icon && <span className="mr-1.5">{icon}</span>}{title}</h3>
      {children}
    </div>
  )
}

function MktgExplainer() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
        <span className="font-medium">How does this model work?</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 text-[10px] leading-relaxed text-gray-500">
          <div>
            <div className="text-gray-700 font-medium mb-1">The Formula</div>
            <div className="bg-gray-100 rounded px-2 py-1.5 font-mono text-[9px] text-emerald-600 mb-1">fillRate = organic + (max - organic) &times; mktgEffect &times; maturity</div>
            <p>Marketing doesn&apos;t grow leagues linearly. Doubling your ad spend doesn&apos;t double signups. This uses a standard <span className="text-gray-700 font-medium">exponential saturation curve</span> from digital marketing theory.</p>
          </div>
          <div>
            <div className="text-purple-600 font-medium mb-1">Half-Point (&euro;)</div>
            <p>The monthly ad spend per city where you&apos;ve captured roughly <span className="text-gray-700 font-medium">63%</span> of the maximum marketing benefit. Think of it as &quot;how expensive is this market to advertise in?&quot;</p>
            <div className="mt-1 space-y-0.5">
              <div><span className="text-amber-600">&bull;</span> <span className="text-gray-700">Low (&euro;20)</span> = responsive market. A small budget goes far.</div>
              <div><span className="text-amber-600">&bull;</span> <span className="text-gray-700">High (&euro;150)</span> = tough market. You need serious spend before ads move the needle.</div>
            </div>
            <p className="mt-1">At <span className="text-gray-700">1&times;</span> half-point spend you get ~63% of max lift. At <span className="text-gray-700">2&times;</span> you get ~86%. At <span className="text-gray-700">3&times;</span> you get ~95%. After that you&apos;re burning money.</p>
          </div>
          <div>
            <div className="text-cyan-600 font-medium mb-1">Steepness (k)</div>
            <p>Controls the <span className="text-gray-700">shape</span> of the diminishing returns curve. It&apos;s a multiplier on how fast you hit the wall.</p>
            <div className="mt-1 space-y-0.5">
              <div><span className="text-amber-600">&bull;</span> <span className="text-gray-700">k = 0.5</span> &mdash; Very gradual. Each euro gives roughly similar returns.</div>
              <div><span className="text-amber-600">&bull;</span> <span className="text-gray-700">k = 1.0</span> &mdash; Standard S-curve. Good initial bang, then clear diminishing returns.</div>
              <div><span className="text-amber-600">&bull;</span> <span className="text-gray-700">k = 2.0+</span> &mdash; Steep. First &euro;20-30 does almost all the work.</div>
            </div>
          </div>
          <div>
            <div className="text-emerald-600 font-medium mb-1">City Maturity</div>
            <p>New cities can&apos;t fill leagues instantly regardless of ad spend. This slider controls how many months until a city reaches <span className="text-gray-700">~95% of its potential</span>.</p>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="text-amber-600 font-medium mb-1">Calibrating with Real Data</div>
            <p>Once you run campaigns in Sotogrande and Marbella, measure CPA at different budget levels. If CPA stays flat as you increase budget, <span className="text-gray-700">k is low</span>. If CPA spikes after a certain spend level, <span className="text-gray-700">k is high</span>.</p>
          </div>
        </div>
      )}
    </div>
  )
}

const fmt = (n) => {
  if (n === undefined || n === null || isNaN(n)) return '€0'
  if (Math.abs(n) >= 1000000) return `€${(n / 1000000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `€${(n / 1000).toFixed(1)}K`
  return `€${Math.round(n)}`
}

const pct = (n) => `${Math.round(n)}%`

const tooltipStyle = { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px', color: '#374151', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }

// ============================================================
// PRESETS SYSTEM
// ============================================================
const STORAGE_KEY = 'tdp-bp-presets'

const DEFAULT_VALUES = {
  registrationFee: 30, freeMonths: 3, discountPct: 50, discountMonths: 3,
  playersPerLeague: 14, maxPlayersPerLeague: 20, seasonsPerYear: 4, seasonLengthWeeks: 10,
  startingCities: 1, newCitiesPerQuarter: 2, leaguesPerCityY1: 1.2, leaguesPerCityY3: 2.5,
  organicFillRate: 25, maxFillRate: 90, mktgHalfPoint: 50, mktgResponseK: 1.0, cityMaturityMonths: 8,
  retention: 70, organicGrowthPct: 30,
  hostingBase: 50, hostingPerKPlayers: 15,
  marketingPerCityLaunch: 150, marketingPerCityMonthly: 60,
  courtCostPerLeagueSeason: 0,
  adminHoursPerLeagueWeek: 1, adminHourlyRate: 0,
  founderSalary: 0,
  initialInvestment: 500,
  cacPerPlayer: 3, organicPct: 40,
  targetCapturePct: 3,
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BusinessPlan() {
  const [tab, setTab] = useState('Overview')

  // =====================
  // REGISTRATION & PRICING
  // =====================
  const [registrationFee, setRegistrationFee] = useState(30)
  const [freeMonths, setFreeMonths] = useState(3)
  const [discountPct, setDiscountPct] = useState(50)
  const [discountMonths, setDiscountMonths] = useState(3)

  // =====================
  // LEAGUE CONFIG
  // =====================
  const [playersPerLeague, setPlayersPerLeague] = useState(14)
  const [maxPlayersPerLeague, setMaxPlayersPerLeague] = useState(20)
  const [seasonsPerYear, setSeasonsPerYear] = useState(4)
  const [seasonLengthWeeks, setSeasonLengthWeeks] = useState(10)

  // =====================
  // GROWTH
  // =====================
  const [startingCities, setStartingCities] = useState(1)
  const [newCitiesPerQuarter, setNewCitiesPerQuarter] = useState(2)
  const [leaguesPerCityY1, setLeaguesPerCityY1] = useState(1.2)
  const [leaguesPerCityY3, setLeaguesPerCityY3] = useState(2.5)
  const [organicFillRate, setOrganicFillRate] = useState(25)
  const [maxFillRate, setMaxFillRate] = useState(90)
  const [mktgHalfPoint, setMktgHalfPoint] = useState(50)
  const [mktgResponseK, setMktgResponseK] = useState(1.0)
  const [cityMaturityMonths, setCityMaturityMonths] = useState(8)
  const [retention, setRetention] = useState(70)
  const [organicGrowthPct, setOrganicGrowthPct] = useState(30)

  // =====================
  // COSTS
  // =====================
  const [hostingBase, setHostingBase] = useState(50)
  const [hostingPerKPlayers, setHostingPerKPlayers] = useState(15)
  const [marketingPerCityLaunch, setMarketingPerCityLaunch] = useState(150)
  const [marketingPerCityMonthly, setMarketingPerCityMonthly] = useState(60)
  const [courtCostPerLeagueSeason, setCourtCostPerLeagueSeason] = useState(0)
  const [adminHoursPerLeagueWeek, setAdminHoursPerLeagueWeek] = useState(1)
  const [adminHourlyRate, setAdminHourlyRate] = useState(0)
  const [founderSalary, setFounderSalary] = useState(0)
  const [initialInvestment, setInitialInvestment] = useState(500)

  // =====================
  // ACQUISITION
  // =====================
  const [cacPerPlayer, setCacPerPlayer] = useState(3)
  const [organicPct, setOrganicPct] = useState(40)
  const [targetCapturePct, setTargetCapturePct] = useState(3)

  // =====================
  // PRESETS
  // =====================
  const [savedPresets, setSavedPresets] = useState([])
  const [activePresetName, setActivePresetName] = useState(null)
  const [showPresetSave, setShowPresetSave] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setSavedPresets(JSON.parse(s)) } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPresets)) } catch {}
  }, [savedPresets])

  const getCurrentValues = useCallback(() => ({
    registrationFee, freeMonths, discountPct, discountMonths,
    playersPerLeague, maxPlayersPerLeague, seasonsPerYear, seasonLengthWeeks,
    startingCities, newCitiesPerQuarter, leaguesPerCityY1, leaguesPerCityY3,
    organicFillRate, maxFillRate, mktgHalfPoint, mktgResponseK, cityMaturityMonths, retention, organicGrowthPct,
    hostingBase, hostingPerKPlayers,
    marketingPerCityLaunch, marketingPerCityMonthly,
    courtCostPerLeagueSeason, adminHoursPerLeagueWeek, adminHourlyRate,
    founderSalary, initialInvestment, cacPerPlayer, organicPct, targetCapturePct,
  }), [registrationFee, freeMonths, discountPct, discountMonths, playersPerLeague, maxPlayersPerLeague, seasonsPerYear, seasonLengthWeeks, startingCities, newCitiesPerQuarter, leaguesPerCityY1, leaguesPerCityY3, organicFillRate, maxFillRate, mktgHalfPoint, mktgResponseK, cityMaturityMonths, retention, organicGrowthPct, hostingBase, hostingPerKPlayers, marketingPerCityLaunch, marketingPerCityMonthly, courtCostPerLeagueSeason, adminHoursPerLeagueWeek, adminHourlyRate, founderSalary, initialInvestment, cacPerPlayer, organicPct, targetCapturePct])

  const applyValues = useCallback((v) => {
    setRegistrationFee(v.registrationFee); setFreeMonths(v.freeMonths); setDiscountPct(v.discountPct); setDiscountMonths(v.discountMonths)
    setPlayersPerLeague(v.playersPerLeague); setMaxPlayersPerLeague(v.maxPlayersPerLeague); setSeasonsPerYear(v.seasonsPerYear); setSeasonLengthWeeks(v.seasonLengthWeeks)
    setStartingCities(v.startingCities); setNewCitiesPerQuarter(v.newCitiesPerQuarter); setLeaguesPerCityY1(v.leaguesPerCityY1); setLeaguesPerCityY3(v.leaguesPerCityY3)
    setOrganicFillRate(v.organicFillRate); setMaxFillRate(v.maxFillRate); setMktgHalfPoint(v.mktgHalfPoint); setMktgResponseK(v.mktgResponseK); setCityMaturityMonths(v.cityMaturityMonths)
    setRetention(v.retention); setOrganicGrowthPct(v.organicGrowthPct)
    setHostingBase(v.hostingBase); setHostingPerKPlayers(v.hostingPerKPlayers)
    setMarketingPerCityLaunch(v.marketingPerCityLaunch); setMarketingPerCityMonthly(v.marketingPerCityMonthly)
    setCourtCostPerLeagueSeason(v.courtCostPerLeagueSeason); setAdminHoursPerLeagueWeek(v.adminHoursPerLeagueWeek); setAdminHourlyRate(v.adminHourlyRate)
    setFounderSalary(v.founderSalary); setInitialInvestment(v.initialInvestment)
    setCacPerPlayer(v.cacPerPlayer); setOrganicPct(v.organicPct)
    setTargetCapturePct(v.targetCapturePct)
  }, [])

  const savePreset = (name) => {
    const preset = { name, values: getCurrentValues(), savedAt: new Date().toISOString() }
    setSavedPresets(prev => { const f = prev.filter(p => p.name !== name); return [...f, preset] })
    setActivePresetName(name); setShowPresetSave(false); setNewPresetName('')
  }
  const loadPreset = (name) => { const p = savedPresets.find(x => x.name === name); if (p) { applyValues(p.values); setActivePresetName(name) } }
  const deletePreset = (name) => { setSavedPresets(prev => prev.filter(p => p.name !== name)); if (activePresetName === name) setActivePresetName(null) }
  const exportPresets = () => { const d = JSON.stringify({ presets: savedPresets, exportedAt: new Date().toISOString() }, null, 2); const b = new Blob([d], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'tdp-bp-presets.json'; a.click(); URL.revokeObjectURL(u) }
  const importPresets = () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => { try { const data = JSON.parse(ev.target?.result); const imp = data.presets || []; if (!imp.length) return alert('No presets found.'); setSavedPresets(prev => { const m = [...prev]; imp.forEach(i => { const idx = m.findIndex(p => p.name === i.name); if (idx >= 0) m[idx] = i; else m.push(i) }); return m }) } catch { alert('Invalid file.') } }; r.readAsText(file) }; input.click() }
  const resetToDefaults = () => { applyValues(DEFAULT_VALUES); setActivePresetName(null) }

  // ============================================================
  // FINANCIAL MODEL (36-month simulation)
  // ============================================================
  const model = useMemo(() => {
    const months = []
    let cumulativeCash = -initialInvestment
    let breakEvenMonth = null
    let monthlyProfitMonth = null

    const cityLaunchMonths = []
    for (let i = 0; i < startingCities; i++) cityLaunchMonths.push(0)

    for (let m = 0; m < 36; m++) {
      const year = Math.floor(m / 12) + 1
      const monthInYear = m % 12

      if (m > 0 && m % 3 === 0) {
        for (let i = 0; i < newCitiesPerQuarter; i++) {
          if (cityLaunchMonths.length < MARKET.cities.length) {
            cityLaunchMonths.push(m)
          }
        }
      }

      const activeCities = cityLaunchMonths.length
      const newCitiesThisMonth = cityLaunchMonths.filter(lm => lm === m).length

      let effectiveFee = registrationFee
      if (m < freeMonths) effectiveFee = 0
      else if (m < freeMonths + discountMonths) effectiveFee = registrationFee * (1 - discountPct / 100)

      const leaguesPerCity = leaguesPerCityY1 + (leaguesPerCityY3 - leaguesPerCityY1) * (m / 35)
      const totalLeagues = Math.round(activeCities * leaguesPerCity)

      const maturityTau = cityMaturityMonths / 3
      let weightedFillSum = 0
      for (let ci = 0; ci < cityLaunchMonths.length; ci++) {
        const cityAge = m - cityLaunchMonths[ci]
        const maturity = 1 - Math.exp(-cityAge / Math.max(0.1, maturityTau))
        const mktgEffect = mktgHalfPoint > 0 ? 1 - Math.exp(-mktgResponseK * marketingPerCityMonthly / mktgHalfPoint) : 0
        const cityFill = organicFillRate + (maxFillRate - organicFillRate) * mktgEffect * maturity
        weightedFillSum += cityFill
      }
      const fillRate = activeCities > 0 ? weightedFillSum / activeCities : organicFillRate

      const avgPlayersPerLeague = Math.round(maxPlayersPerLeague * fillRate / 100)
      const totalActivePlayers = totalLeagues * avgPlayersPerLeague

      const prevPlayers = m > 0 ? months[m - 1].totalActivePlayers : 0
      const playerGrowth = Math.max(0, totalActivePlayers - Math.round(prevPlayers * retention / 100))
      const newPlayers = Math.max(0, playerGrowth)
      const returningPlayers = totalActivePlayers - newPlayers

      const annualRevenuePerPlayer = effectiveFee * seasonsPerYear
      const monthlyRevenue = totalActivePlayers * annualRevenuePerPlayer / 12

      const hosting = hostingBase + Math.ceil(totalActivePlayers / 1000) * hostingPerKPlayers

      const launchMarketing = newCitiesThisMonth * marketingPerCityLaunch
      const ongoingMarketing = activeCities * marketingPerCityMonthly
      const paidNewPlayers = Math.round(newPlayers * (100 - organicPct) / 100)
      const acquisitionMarketing = paidNewPlayers * cacPerPlayer
      const totalMarketing = launchMarketing + ongoingMarketing + acquisitionMarketing

      const courtCosts = totalLeagues * courtCostPerLeagueSeason * seasonsPerYear / 12

      const weeklyAdminHours = totalLeagues * adminHoursPerLeagueWeek
      const monthlyAdminHours = weeklyAdminHours * 4.33
      const adminCosts = monthlyAdminHours * adminHourlyRate

      const personnel = founderSalary

      const totalCosts = hosting + totalMarketing + courtCosts + adminCosts + personnel

      const netProfit = monthlyRevenue - totalCosts
      const netMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue * 100) : 0

      cumulativeCash += netProfit
      if (breakEvenMonth === null && cumulativeCash > 0 && m > 0) breakEvenMonth = m + 1
      if (monthlyProfitMonth === null && netProfit > 0 && m > 0) monthlyProfitMonth = m + 1

      months.push({
        month: m + 1,
        label: `${MONTHS_LABEL[monthInYear]} Y${year}`,
        shortLabel: `M${m + 1}`,
        year,
        activeCities, newCitiesThisMonth, totalLeagues, leaguesPerCity: Math.round(leaguesPerCity * 10) / 10,
        avgPlayersPerLeague, totalActivePlayers, newPlayers, returningPlayers,
        fillRate: Math.round(fillRate),
        effectiveFee: Math.round(effectiveFee * 100) / 100,
        monthlyRevenue, totalMarketing, launchMarketing, ongoingMarketing, acquisitionMarketing,
        hosting, courtCosts, adminCosts, personnel, totalCosts,
        netProfit, netMargin: Math.round(netMargin), cumulativeCash,
        monthlyAdminHours: Math.round(monthlyAdminHours),
      })
    }

    const yearly = [1, 2, 3].map(y => {
      const yMonths = months.filter(m => m.year === y)
      const sum = (key) => yMonths.reduce((s, m) => s + (m[key] || 0), 0)
      const last = yMonths[yMonths.length - 1]
      const avg = (key) => sum(key) / yMonths.length
      return {
        year: y,
        totalRevenue: sum('monthlyRevenue'),
        totalCosts: sum('totalCosts'),
        netProfit: sum('netProfit'),
        totalMarketing: sum('totalMarketing'),
        hosting: sum('hosting'),
        courtCosts: sum('courtCosts'),
        adminCosts: sum('adminCosts'),
        personnel: sum('personnel'),
        endCities: last.activeCities,
        endLeagues: last.totalLeagues,
        endPlayers: last.totalActivePlayers,
        endCash: last.cumulativeCash,
        avgRevPerCity: last.activeCities > 0 ? sum('monthlyRevenue') / 12 / last.activeCities : 0,
        avgPlayers: Math.round(avg('totalActivePlayers')),
        newPlayers: sum('newPlayers'),
      }
    })

    const y1 = yearly[0]
    const avgSeasonsBeforeChurn = 1 / (1 - retention / 100)
    const ltv = registrationFee * avgSeasonsBeforeChurn
    const effectiveCac = y1.totalMarketing / Math.max(1, y1.newPlayers)
    const ltvCacRatio = ltv / Math.max(0.01, effectiveCac)

    const m36 = months[35]
    const profitPerCity = m36.activeCities > 0 ? m36.netProfit / m36.activeCities : 0

    return { months, yearly, breakEvenMonth, monthlyProfitMonth, ltv, effectiveCac, ltvCacRatio, avgSeasonsBeforeChurn, profitPerCity }
  }, [
    registrationFee, freeMonths, discountPct, discountMonths,
    playersPerLeague, maxPlayersPerLeague, seasonsPerYear, seasonLengthWeeks,
    startingCities, newCitiesPerQuarter, leaguesPerCityY1, leaguesPerCityY3,
    organicFillRate, maxFillRate, mktgHalfPoint, mktgResponseK, cityMaturityMonths, retention, organicGrowthPct,
    hostingBase, hostingPerKPlayers, marketingPerCityLaunch, marketingPerCityMonthly,
    courtCostPerLeagueSeason, adminHoursPerLeagueWeek, adminHourlyRate,
    founderSalary, initialInvestment, cacPerPlayer, organicPct
  ])

  const m36 = model.months[35]

  // ============================================================
  // SENSITIVITY ANALYSIS
  // ============================================================
  const sensitivity = useMemo(() => {
    const drivers = [
      { name: 'Registration Fee', key: 'fee', base: registrationFee, range: [15, 50], step: 5, prefix: '€' },
      { name: 'Retention Rate', key: 'retention', base: retention, range: [50, 95], step: 5, suffix: '%' },
      { name: 'New Cities / Quarter', key: 'cities', base: newCitiesPerQuarter, range: [1, 5], step: 1 },
      { name: 'Marketing / City / Mo', key: 'mktg', base: marketingPerCityMonthly, range: [0, 200], step: 20, prefix: '€' },
      { name: 'Mktg Half-Point', key: 'halfpt', base: mktgHalfPoint, range: [20, 200], step: 10, prefix: '€' },
      { name: 'Leagues per City Y3', key: 'leagues', base: leaguesPerCityY3, range: [1, 4], step: 0.5 },
    ]
    return drivers
  }, [registrationFee, retention, newCitiesPerQuarter, marketingPerCityMonthly, mktgHalfPoint, leaguesPerCityY3])

  // ============================================================
  // SIDEBAR CONTROLS
  // ============================================================
  const sidebar = (
    <div className="lg:w-72 shrink-0 space-y-4">
      <Card title="Registration & Pricing" icon="💰">
        <Slider label="Registration Fee" value={registrationFee} onChange={setRegistrationFee} min={10} max={60} prefix="€" />
        <Slider label="Free Launch Months" value={freeMonths} onChange={setFreeMonths} min={0} max={12} suffix=" mo" />
        <Slider label="Discount After Free" value={discountPct} onChange={setDiscountPct} min={0} max={100} suffix="%" />
        <Slider label="Discount Duration" value={discountMonths} onChange={setDiscountMonths} min={0} max={12} suffix=" mo" />
      </Card>
      <Card title="League Config" icon="🎾">
        <Slider label="Avg Players / League" value={playersPerLeague} onChange={setPlayersPerLeague} min={6} max={20} />
        <Slider label="Max Players / League" value={maxPlayersPerLeague} onChange={setMaxPlayersPerLeague} min={10} max={30} />
        <Slider label="Seasons / Year" value={seasonsPerYear} onChange={setSeasonsPerYear} min={2} max={6} />
        <Slider label="Season Length" value={seasonLengthWeeks} onChange={setSeasonLengthWeeks} min={6} max={16} suffix=" wk" />
      </Card>
      <Card title="Growth" icon="📈">
        <Slider label="Starting Cities" value={startingCities} onChange={setStartingCities} min={1} max={5} />
        <Slider label="New Cities / Quarter" value={newCitiesPerQuarter} onChange={setNewCitiesPerQuarter} min={0} max={6} />
        <Slider label="Leagues / City (Y1)" value={leaguesPerCityY1} onChange={setLeaguesPerCityY1} min={1} max={3} step={0.1} />
        <Slider label="Leagues / City (Y3)" value={leaguesPerCityY3} onChange={setLeaguesPerCityY3} min={1} max={5} step={0.1} />
        <Slider label="Season Retention" value={retention} onChange={setRetention} min={40} max={95} suffix="%" />
        <Slider label="Organic Growth" value={organicGrowthPct} onChange={setOrganicGrowthPct} min={0} max={80} suffix="%" />
      </Card>
      <Card title="Marketing Response" icon="📣">
        <div className="text-[10px] text-gray-500 mb-2">Fill rate = organic + (max - organic) × mktg_effect × maturity</div>
        <Slider label="Organic Fill Rate" value={organicFillRate} onChange={setOrganicFillRate} min={10} max={50} suffix="%" tooltip="Fill rate with zero ad spend." />
        <Slider label="Max Fill Rate" value={maxFillRate} onChange={setMaxFillRate} min={60} max={100} suffix="%" tooltip="Theoretical ceiling regardless of spend." />
        <Slider label="Mktg Half-Point" value={mktgHalfPoint} onChange={setMktgHalfPoint} min={10} max={200} prefix="€" suffix="/city" tooltip="Monthly spend per city to reach 50% of max marketing lift." />
        <Slider label="Response Steepness (k)" value={mktgResponseK} onChange={setMktgResponseK} min={0.3} max={3} step={0.1} tooltip="Shape of diminishing returns. 0.5=gradual, 1.0=standard, 2.0+=steep." />
        <Slider label="City Maturity" value={cityMaturityMonths} onChange={setCityMaturityMonths} min={2} max={18} suffix=" mo" tooltip="Months for a new city to reach ~95% of its potential." />
        <MktgExplainer />
      </Card>
      <Card title="Costs" icon="💸">
        <Slider label="Hosting Base" value={hostingBase} onChange={setHostingBase} min={20} max={200} prefix="€" suffix="/mo" />
        <Slider label="Hosting per 1K Players" value={hostingPerKPlayers} onChange={setHostingPerKPlayers} min={5} max={50} prefix="€" />
        <Slider label="City Launch Marketing" value={marketingPerCityLaunch} onChange={setMarketingPerCityLaunch} min={0} max={500} prefix="€" />
        <Slider label="City Monthly Marketing" value={marketingPerCityMonthly} onChange={setMarketingPerCityMonthly} min={0} max={300} prefix="€" suffix="/mo" />
        <Slider label="Court Cost / League / Season" value={courtCostPerLeagueSeason} onChange={setCourtCostPerLeagueSeason} min={0} max={200} prefix="€" />
        <Slider label="Admin Hours / League / Wk" value={adminHoursPerLeagueWeek} onChange={setAdminHoursPerLeagueWeek} min={0} max={5} step={0.5} suffix="h" />
        <Slider label="Admin Hourly Rate" value={adminHourlyRate} onChange={setAdminHourlyRate} min={0} max={25} prefix="€" />
        <Slider label="Founder Salary" value={founderSalary} onChange={setFounderSalary} min={0} max={3000} step={100} prefix="€" suffix="/mo" />
        <Slider label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} min={0} max={5000} step={100} prefix="€" />
      </Card>
      <Card title="Acquisition" icon="🎯">
        <Slider label="CAC per Player" value={cacPerPlayer} onChange={setCacPerPlayer} min={0} max={15} step={0.5} prefix="€" />
        <Slider label="Organic %" value={organicPct} onChange={setOrganicPct} min={0} max={80} suffix="%" />
      </Card>
    </div>
  )

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="-mx-6 -mt-6 text-gray-900">
      {/* HEADER */}
      <div className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <span className="text-2xl">🎾</span> Tenis del Parque
                <span className="text-xs bg-parque-purple/10 text-parque-purple px-2 py-0.5 rounded-full font-medium">Business Plan v1</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">League Management Platform &bull; City-by-City Expansion &bull; 36-month model</p>
            </div>
            <div className="hidden lg:flex gap-2">
              <KPI label="Break-even" value={model.breakEvenMonth ? `Month ${model.breakEvenMonth}` : 'N/A'} color="amber" />
              <KPI label="Y3 Revenue" value={fmt(model.yearly[2]?.totalRevenue)} />
              <KPI label="Y3 Net" value={fmt(model.yearly[2]?.netProfit)} color={(model.yearly[2]?.netProfit || 0) >= 0 ? 'emerald' : 'red'} />
              <KPI label="Monthly Net @36" value={fmt(m36?.netProfit)} color={(m36?.netProfit || 0) >= 0 ? 'emerald' : 'red'} />
            </div>
          </div>
          {/* PRESETS BAR */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Scenario:</span>
              {savedPresets.map(p => (
                <div key={p.name} className="group relative">
                  <button onClick={() => loadPreset(p.name)} className={`px-2 py-1 text-[11px] rounded-md border transition-colors ${activePresetName === p.name ? 'bg-parque-purple/10 text-parque-purple border-parque-purple/40' : 'text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-700'}`}>{p.name}</button>
                  <button onClick={(e) => { e.stopPropagation(); deletePreset(p.name) }} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-200 hover:bg-red-500 text-gray-500 hover:text-white rounded-full text-[8px] items-center justify-center hidden group-hover:flex transition-colors" title="Delete">&times;</button>
                </div>
              ))}
              {!showPresetSave ? (
                <button onClick={() => setShowPresetSave(true)} className="px-2 py-1 text-[11px] rounded-md border border-dashed border-gray-300 text-gray-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors">+ Save</button>
              ) : (
                <div className="flex items-center gap-1">
                  <input type="text" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newPresetName.trim()) savePreset(newPresetName.trim()); if (e.key === 'Escape') setShowPresetSave(false) }} placeholder="Name..." autoFocus className="w-28 px-2 py-1 text-[11px] bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple/20" />
                  <button onClick={() => newPresetName.trim() && savePreset(newPresetName.trim())} disabled={!newPresetName.trim()} className="px-2 py-1 text-[11px] rounded-md bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-100 disabled:opacity-30 transition-colors">Save</button>
                  <button onClick={() => { setShowPresetSave(false); setNewPresetName('') }} className="px-1.5 py-1 text-[11px] text-gray-400 hover:text-gray-700">&times;</button>
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <button onClick={resetToDefaults} className="text-[10px] text-gray-400 hover:text-amber-600 transition-colors">Reset</button>
            <button onClick={exportPresets} className="text-[10px] text-gray-400 hover:text-cyan-600 transition-colors">Export</button>
            <button onClick={importPresets} className="text-[10px] text-gray-400 hover:text-cyan-600 transition-colors">Import</button>
            {activePresetName && <span className="text-[10px] text-parque-purple/60 ml-auto">Active</span>}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${tab === t ? 'bg-parque-purple/10 text-parque-purple border border-parque-purple/30 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">

        {/* ============================================================ */}
        {/* MARKET TAB */}
        {/* ============================================================ */}
        {tab === 'Market' && (
          <div className="space-y-4">
            {(() => {
              const tam = MARKET.spain.recreationalPlayers
              const sam = MARKET.cities.reduce((s,c) => s + c.tennisPlayers, 0)
              const targetSegment = MARKET.cities.reduce((s,c) => s + Math.round(c.tennisPlayers * targetCapturePct / 100), 0)
              const som = m36 ? m36.totalActivePlayers : 0
              const captureRate = targetSegment > 0 ? (som / targetSegment * 100) : 0
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <KPI label="TAM" value={`${(tam / 1000).toFixed(0)}K`} sub="Recreational players in Spain" color="blue" />
                  <KPI label="SAM" value={`${(sam / 1000).toFixed(0)}K`} sub="Players in 24 target cities" color="purple" />
                  <KPI label="Target Segment" value={targetSegment.toLocaleString()} sub={`${targetCapturePct}% of SAM (league-joinable)`} color="amber" />
                  <KPI label="SOM" value={som.toLocaleString()} sub="Model output at M36" color="emerald" />
                  <KPI label="Penetration" value={`${captureRate.toFixed(1)}%`} sub="SOM ÷ Target Segment" color={captureRate > 80 ? 'red' : captureRate > 40 ? 'amber' : 'cyan'} />
                </div>
              )
            })()}

            <Card title="Market Sizing" icon="🎯">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Slider label="Target Capture %" value={targetCapturePct} onChange={setTargetCapturePct} min={1} max={10} step={0.5} suffix="%" tooltip={TIPS['Target Capture']} />
                  <div className="text-[10px] text-gray-500 mt-1">
                    At {targetCapturePct}% target players across all {MARKET.cities.length} cities
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-[10px] text-gray-500 space-y-1.5">
                  <div className="text-gray-800 font-medium">How these metrics connect:</div>
                  <div><span className="text-blue-600 font-medium">TAM</span> = all recreational tennis players in Spain (fixed market fact)</div>
                  <div><span className="text-purple-600 font-medium">SAM</span> = tennis players in your 24 target cities (fixed geography)</div>
                  <div><span className="text-emerald-600 font-medium">SOM</span> = what your model projects at M36 (dynamic &mdash; changes with every slider)</div>
                  <div><span className="text-amber-600 font-medium">Target Segment</span> = SAM &times; Target Capture % (league-joinable players)</div>
                  <div><span className="text-cyan-600 font-medium">Penetration</span> = SOM &divide; Target Segment (how much of the realistic market you&apos;ve captured)</div>
                  <div className="border-t border-gray-200 pt-1.5 mt-1.5">
                    <span className="text-amber-600 font-medium">Target Capture %</span> sets the &quot;Target&quot; column in city tables below. It&apos;s your assumption about what % of tennis players in each city <em>could</em> join a structured league.
                  </div>
                </div>
              </div>
              {m36 && (() => {
                const totalTarget = MARKET.cities.reduce((s,c) => s + Math.round(c.tennisPlayers * targetCapturePct / 100), 0)
                const som = m36.totalActivePlayers
                const pctOfTarget = totalTarget > 0 ? (som / totalTarget * 100) : 0
                const activeCitiesTarget = MARKET.cities.slice(0, m36.activeCities).reduce((s,c) => s + Math.round(c.tennisPlayers * targetCapturePct / 100), 0)
                const pctOfActiveCities = activeCitiesTarget > 0 ? (som / activeCitiesTarget * 100) : 0
                return (
                  <div className={`mt-3 p-3 rounded-lg border text-xs ${
                    pctOfActiveCities > 100 ? 'bg-red-50 border-red-200 text-red-700' :
                    pctOfActiveCities > 70 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-bold">M36 projection players</span>
                        {' '}&mdash; {pctOfTarget.toFixed(1)}% of all-city target ({totalTarget.toLocaleString()})
                      </div>
                      <div>
                        {pctOfActiveCities.toFixed(0)}% of active-city target ({activeCitiesTarget.toLocaleString()} across {m36.activeCities} cities)
                      </div>
                    </div>
                    {pctOfActiveCities > 100 && (
                      <div className="mt-1 text-[10px]">Your model projects more players than the target capture assumes exist. Either increase Target Capture % or reduce growth assumptions.</div>
                    )}
                  </div>
                )
              })()}
            </Card>

            {[1, 2, 3].map(phase => {
              const phaseCities = MARKET.cities.filter(c => c.phase === phase)
              const phaseLabels = { 1: 'Phase 1: Costa del Sol', 2: 'Phase 2: Andalucia', 3: 'Phase 3: Spain National' }
              const phaseColors = { 1: 'emerald', 2: 'purple', 3: 'blue' }
              return (
                <Card key={phase} title={phaseLabels[phase]} icon={phase === 1 ? '🏖️' : phase === 2 ? '☀️' : '🇪🇸'}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-200">
                          <th className="text-left py-2 pr-3">City</th>
                          <th className="text-right py-2 px-2">Population</th>
                          <th className="text-right py-2 px-2">Tennis Players</th>
                          <th className="text-right py-2 px-2">Clubs</th>
                          <th className="text-right py-2 px-2">Courts</th>
                          <th className="text-right py-2 px-2">Target ({targetCapturePct}%)</th>
                          <th className="text-left py-2 pl-3 hidden md:table-cell">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseCities.map(city => (
                          <tr key={city.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 pr-3 font-medium text-gray-800">{city.name}</td>
                            <td className="py-2 px-2 text-right text-gray-500">{city.population.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{city.tennisPlayers.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-gray-500">{city.clubs}</td>
                            <td className="py-2 px-2 text-right text-gray-500">{city.courts}</td>
                            <td className={`py-2 px-2 text-right font-medium text-${phaseColors[phase]}-600`}>{Math.round(city.tennisPlayers * targetCapturePct / 100)}</td>
                            <td className="py-2 pl-3 text-gray-500 hidden md:table-cell max-w-xs truncate">{city.notes}</td>
                          </tr>
                        ))}
                        <tr className="font-bold text-gray-700">
                          <td className="py-2 pr-3">Total Phase {phase}</td>
                          <td className="py-2 px-2 text-right">{phaseCities.reduce((s,c) => s + c.population, 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right">{phaseCities.reduce((s,c) => s + c.tennisPlayers, 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right">{phaseCities.reduce((s,c) => s + c.clubs, 0)}</td>
                          <td className="py-2 px-2 text-right">{phaseCities.reduce((s,c) => s + c.courts, 0)}</td>
                          <td className={`py-2 px-2 text-right text-${phaseColors[phase]}-600`}>{phaseCities.reduce((s,c) => s + Math.round(c.tennisPlayers * targetCapturePct / 100), 0)}</td>
                          <td className="hidden md:table-cell"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )
            })}
            <Card title="Sources & Methodology" icon="📊">
              <div className="text-xs text-gray-500 space-y-1">
                <p>RFET (Real Federacion Espanola de Tenis) 2024: 96,000 licensed players, ~580,000 recreational.</p>
                <p>INE (Instituto Nacional de Estadistica): Municipal population data 2024.</p>
                <p>Target players per city: estimated at 2-5% of recreational tennis players, representing competitive-social segment likely to join structured leagues.</p>
                <p>Court and club data: aggregated from Google Maps, club directories, and municipal sports councils.</p>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* OVERVIEW TAB */}
        {/* ============================================================ */}
        {tab === 'Overview' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {sidebar}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {model.yearly.map(y => (
                  <div key={y.year} className={`rounded-xl border p-4 shadow-sm ${y.netProfit >= 0 ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="text-xs text-gray-400 mb-2">Year {y.year}</div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <div className="text-[10px] text-gray-400">Cities</div>
                        <div className="text-lg font-bold text-cyan-600">{y.endCities}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">Leagues</div>
                        <div className="text-lg font-bold text-purple-600">{y.endLeagues}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400">Players</div>
                        <div className="text-lg font-bold text-emerald-600">{y.endPlayers.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Revenue</span><span className="text-emerald-600 font-medium">{fmt(y.totalRevenue)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Costs</span><span className="text-red-600 font-medium">{fmt(y.totalCosts)}</span></div>
                      <div className="flex justify-between border-t border-gray-200 pt-1"><span className="text-gray-800 font-medium">Net Profit</span><span className={`font-bold ${y.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(y.netProfit)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Cash Position</span><span className={y.endCash >= 0 ? 'text-emerald-600' : 'text-red-600'}>{fmt(y.endCash)}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <Card title="Monthly Revenue vs Costs" icon="📊">
                <div className="h-72">
                  <ResponsiveContainer>
                    <ComposedChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `€${v}`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="monthlyRevenue" name="Revenue" fill={COLORS.emerald} fillOpacity={0.15} stroke={COLORS.emerald} strokeWidth={2} />
                      <Area type="monotone" dataKey="totalCosts" name="Costs" fill={COLORS.red} fillOpacity={0.1} stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke={COLORS.amber} strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Platform Growth" icon="📈">
                <div className="h-64">
                  <ResponsiveContainer>
                    <ComposedChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left" dataKey="activeCities" name="Cities" fill={COLORS.cyan} opacity={0.7} />
                      <Line yAxisId="right" type="monotone" dataKey="totalActivePlayers" name="Players" stroke={COLORS.emerald} strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="totalLeagues" name="Leagues" stroke={COLORS.purple} strokeWidth={1.5} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* GROWTH TAB */}
        {/* ============================================================ */}
        {tab === 'Growth' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {sidebar}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPI label="Cities Y1" value={String(model.yearly[0].endCities)} sub={`→ ${model.yearly[2].endCities} by Y3`} color="cyan" />
                <KPI label="Players Y1" value={model.yearly[0].endPlayers.toLocaleString()} sub={`→ ${model.yearly[2].endPlayers.toLocaleString()} by Y3`} color="emerald" />
                <KPI label="Retention" value={`${retention}%`} sub={`${model.avgSeasonsBeforeChurn.toFixed(1)} avg seasons`} color="purple" />
                <KPI label="Fill Rate" value={`${m36.fillRate}%`} sub={`${m36.avgPlayersPerLeague} avg / league`} color="amber" />
              </div>

              <Card title="City Expansion Timeline" icon="🗺️">
                <div className="h-72">
                  <ResponsiveContainer>
                    <AreaChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="stepAfter" dataKey="activeCities" name="Active Cities" fill={COLORS.cyan} fillOpacity={0.2} stroke={COLORS.cyan} strokeWidth={2} />
                      <Area type="monotone" dataKey="totalLeagues" name="Total Leagues" fill={COLORS.purple} fillOpacity={0.15} stroke={COLORS.purple} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Player Growth" icon="👥">
                <div className="h-64">
                  <ResponsiveContainer>
                    <AreaChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="totalActivePlayers" name="Active Players" fill={COLORS.emerald} fillOpacity={0.2} stroke={COLORS.emerald} strokeWidth={2} />
                      <Area type="monotone" dataKey="returningPlayers" name="Returning" fill={COLORS.purple} fillOpacity={0.1} stroke={COLORS.purple} strokeWidth={1.5} />
                      <Area type="monotone" dataKey="newPlayers" name="New" fill={COLORS.amber} fillOpacity={0.1} stroke={COLORS.amber} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Marketing Response Curve" icon="📉">
                <p className="text-[10px] text-gray-500 mb-3">Shows how monthly marketing spend per city translates into fill rate. Dashed = organic baseline. Each line = different city age.</p>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={(() => {
                      const pts = []
                      for (let spend = 0; spend <= 250; spend += 5) {
                        const mktgEffect = mktgHalfPoint > 0 ? 1 - Math.exp(-mktgResponseK * spend / mktgHalfPoint) : 0
                        const row = { spend: `€${spend}` }
                        for (const age of [1, 3, 6, 12, 24]) {
                          const matTau = cityMaturityMonths / 3
                          const maturity = 1 - Math.exp(-age / Math.max(0.1, matTau))
                          row[`${age}mo`] = Math.round(organicFillRate + (maxFillRate - organicFillRate) * mktgEffect * maturity)
                        }
                        row.organic = organicFillRate
                        row.ceiling = maxFillRate
                        pts.push(row)
                      }
                      return pts
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="spend" tick={{ fontSize: 9, fill: '#6b7280' }} interval={9} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => `${v}%`} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="organic" name="Organic base" stroke="#6b7280" strokeDasharray="6 3" strokeWidth={1} dot={false} />
                      <Line type="monotone" dataKey="ceiling" name="Max ceiling" stroke="#6b7280" strokeDasharray="2 2" strokeWidth={1} dot={false} />
                      <Line type="monotone" dataKey="1mo" name="1 month old" stroke={COLORS.amber} strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="3mo" name="3 months" stroke={COLORS.orange} strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="6mo" name="6 months" stroke={COLORS.purple} strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="12mo" name="12 months" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="24mo" name="24 months" stroke={COLORS.emerald} strokeWidth={2} dot={false} />
                      <ReferenceLine x={`€${marketingPerCityMonthly}`} stroke={COLORS.emerald} strokeDasharray="4 4" label={{ value: 'Current', position: 'top', fontSize: 10, fill: COLORS.emerald }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-gray-50 rounded p-2 border border-gray-100">
                    <span className="text-gray-500">At €0 spend:</span>
                    <span className="text-amber-600 ml-1 font-medium">{organicFillRate}% fill</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 border border-gray-100">
                    <span className="text-gray-500">At €{marketingPerCityMonthly} (current):</span>
                    <span className="text-emerald-600 ml-1 font-medium">{Math.round(organicFillRate + (maxFillRate - organicFillRate) * (1 - Math.exp(-mktgResponseK * marketingPerCityMonthly / Math.max(0.1, mktgHalfPoint))))}% mature city</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 border border-gray-100">
                    <span className="text-gray-500">Doubling to €{marketingPerCityMonthly * 2}:</span>
                    <span className="text-cyan-600 ml-1 font-medium">{Math.round(organicFillRate + (maxFillRate - organicFillRate) * (1 - Math.exp(-mktgResponseK * marketingPerCityMonthly * 2 / Math.max(0.1, mktgHalfPoint))))}% mature city</span>
                  </div>
                </div>
                <details className="mt-3 group">
                  <summary className="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer font-medium">Understanding this chart &amp; how to calibrate it</summary>
                  <div className="mt-2 space-y-3 text-[10px] leading-relaxed text-gray-500 border-t border-gray-200 pt-3">
                    <div>
                      <div className="text-gray-700 font-medium mb-1">How to read the chart</div>
                      <p>Each colored line represents a city at a different age. The <span className="text-amber-600">1-month line</span> is always lowest because brand awareness hasn&apos;t built up yet. The <span className="text-emerald-600">24-month line</span> shows the theoretical best: a fully mature city responding to your ad budget.</p>
                      <p className="mt-1">The vertical dashed green line marks your <span className="text-emerald-600">current spend</span>. Notice how the curves flatten as you move right &mdash; that&apos;s diminishing returns.</p>
                    </div>
                    <div>
                      <div className="text-gray-700 font-medium mb-1">What &quot;Half-Point&quot; really means</div>
                      <p>If your half-point is &euro;50 and you spend &euro;50/mo, you&apos;ve captured <span className="text-gray-700 font-medium">63%</span> of possible marketing lift. Spend &euro;100 for <span className="text-gray-700 font-medium">86%</span>. Spend &euro;150 for <span className="text-gray-700 font-medium">95%</span>.</p>
                    </div>
                    <div>
                      <div className="text-gray-700 font-medium mb-1">What &quot;k&quot; (steepness) really means</div>
                      <p><span className="text-gray-700 font-medium">k = 0.5</span> gives a gentle slope. <span className="text-gray-700 font-medium">k = 2.0</span> gives a steep cliff &mdash; the first &euro;20 does almost all the work.</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                      <div className="text-amber-700 font-medium mb-1">How to calibrate with real campaigns</div>
                      <p>Track <span className="text-gray-700 font-medium">CPA at different weekly budgets</span>. If CPA stays flat &rarr; <span className="text-gray-700 font-medium">k is low (~0.5)</span>. If CPA doubles when you double budget &rarr; <span className="text-gray-700 font-medium">k is high (~2.0)</span>.</p>
                    </div>
                  </div>
                </details>
              </Card>

              <Card title="Cities Needed for Income Targets" icon="🎯">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1000, 2500, 5000, 10000].map(target => {
                    const citiesNeeded = model.profitPerCity > 0 ? Math.ceil(target / model.profitPerCity) : Infinity
                    return (
                      <div key={target} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-500">For {fmt(target)}/month</div>
                        <div className={`text-lg font-bold ${citiesNeeded <= MARKET.cities.length ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {citiesNeeded === Infinity ? '—' : citiesNeeded}
                        </div>
                        <div className="text-[10px] text-gray-500">cities needed</div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 text-[10px] text-gray-500">
                  Based on M36 profit per city of {fmt(model.profitPerCity)}. Total modeled cities.
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* UNIT ECONOMICS TAB */}
        {/* ============================================================ */}
        {tab === 'Unit Economics' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {sidebar}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KPI label="Rev / City / Mo" value={fmt(model.yearly[0].avgRevPerCity)} sub={`→ ${fmt(model.yearly[2].avgRevPerCity)} Y3`} color="emerald" />
                <KPI label="LTV" value={fmt(model.ltv)} sub={`${model.avgSeasonsBeforeChurn.toFixed(1)} seasons avg`} color="purple" />
                <KPI label="CAC" value={fmt(model.effectiveCac)} sub="effective cost per player" color="amber" />
                <KPI label="LTV:CAC" value={`${model.ltvCacRatio.toFixed(1)}x`} sub={model.ltvCacRatio >= 3 ? 'Healthy' : 'Needs improvement'} color={model.ltvCacRatio >= 3 ? 'emerald' : 'red'} />
                <KPI label="Profit / City / Mo" value={fmt(model.profitPerCity)} sub="at Month 36" color={model.profitPerCity >= 0 ? 'emerald' : 'red'} />
                <KPI label="Payback" value={model.profitPerCity > 0 ? `${Math.ceil(marketingPerCityLaunch / model.profitPerCity)} mo` : 'N/A'} sub="city launch cost recovery" color="cyan" />
              </div>

              <Card title="Revenue per Player Over Time" icon="💰">
                <div className="h-64">
                  <ResponsiveContainer>
                    <ComposedChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `€${v}`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => `€${typeof v === 'number' ? v.toFixed(2) : v}`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="effectiveFee" name="Effective Fee / Season" stroke={COLORS.emerald} strokeWidth={2} dot={false} />
                      <Bar dataKey={d => d.totalActivePlayers > 0 ? d.monthlyRevenue / d.totalActivePlayers : 0} name="Rev / Player / Mo" fill={COLORS.purple} opacity={0.6} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Unit Economics Breakdown" icon="📐">
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-600 mb-2 font-medium">Revenue Side</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-500">Registration fee</span><span className="text-gray-900">€{registrationFee}/season</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Seasons per year</span><span className="text-gray-900">{seasonsPerYear}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Annual rev / player</span><span className="text-emerald-600 font-medium">€{registrationFee * seasonsPerYear}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">LTV ({model.avgSeasonsBeforeChurn.toFixed(1)} seasons)</span><span className="text-emerald-600 font-bold">{fmt(model.ltv)}</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-2 font-medium">Cost Side</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-500">CAC (effective)</span><span className="text-gray-900">{fmt(model.effectiveCac)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Hosting / player / mo</span><span className="text-gray-900">€{(hostingPerKPlayers / 1000).toFixed(3)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Admin / league / mo</span><span className="text-gray-900">€{(adminHoursPerLeagueWeek * 4.33 * adminHourlyRate).toFixed(0)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">LTV:CAC</span><span className={`font-bold ${model.ltvCacRatio >= 3 ? 'text-emerald-600' : 'text-red-600'}`}>{model.ltvCacRatio.toFixed(1)}x</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* P&L TAB */}
        {/* ============================================================ */}
        {tab === 'P&L' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {sidebar}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {model.yearly.map(y => (
                  <div key={y.year} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="text-sm font-bold text-gray-700 mb-3">Year {y.year}</div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div><div className="text-[10px] text-gray-400">Cities</div><div className="text-lg font-bold text-cyan-600">{y.endCities}</div></div>
                      <div><div className="text-[10px] text-gray-400">Players</div><div className="text-lg font-bold text-emerald-600">{y.endPlayers.toLocaleString()}</div></div>
                      <div><div className="text-[10px] text-gray-400">Leagues</div><div className="text-lg font-bold text-purple-600">{y.endLeagues}</div></div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium"><span className="text-gray-700">Revenue</span><span className="text-emerald-600">{fmt(y.totalRevenue)}</span></div>
                      <div className="border-t border-gray-200 my-1" />
                      <div className="flex justify-between"><span className="text-gray-500">Marketing</span><span className="text-gray-700">{fmt(y.totalMarketing)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Hosting</span><span className="text-gray-700">{fmt(y.hosting)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Court Costs</span><span className="text-gray-700">{fmt(y.courtCosts)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Admin</span><span className="text-gray-700">{fmt(y.adminCosts)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Personnel</span><span className="text-gray-700">{fmt(y.personnel)}</span></div>
                      <div className="flex justify-between font-medium"><span className="text-gray-700">Total Costs</span><span className="text-red-600">{fmt(y.totalCosts)}</span></div>
                      <div className="border-t border-gray-200 my-1" />
                      <div className="flex justify-between font-bold"><span className="text-gray-900">Net Profit</span><span className={y.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>{fmt(y.netProfit)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Margin</span><span className={y.totalRevenue > 0 ? (y.netProfit / y.totalRevenue >= 0 ? 'text-emerald-600' : 'text-red-600') : 'text-gray-500'}>{y.totalRevenue > 0 ? pct(y.netProfit / y.totalRevenue * 100) : '—'}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <Card title="Revenue vs Costs Breakdown" icon="📊">
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={model.months.filter((_,i) => i % 3 === 0)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `€${v}`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="monthlyRevenue" name="Revenue" fill={COLORS.emerald} />
                      <Bar dataKey="totalMarketing" name="Marketing" fill={COLORS.amber} />
                      <Bar dataKey="hosting" name="Hosting" fill={COLORS.cyan} />
                      <Bar dataKey="courtCosts" name="Courts" fill={COLORS.purple} />
                      <Bar dataKey="adminCosts" name="Admin" fill={COLORS.pink} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Monthly P&L Detail" icon="📋">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-gray-500 border-b border-gray-300">
                        <th className="text-left py-1.5 pr-2">Month</th>
                        <th className="text-right py-1.5 px-1">Cities</th>
                        <th className="text-right py-1.5 px-1">Leagues</th>
                        <th className="text-right py-1.5 px-1">Players</th>
                        <th className="text-right py-1.5 px-1">Fee</th>
                        <th className="text-right py-1.5 px-1">Revenue</th>
                        <th className="text-right py-1.5 px-1">Costs</th>
                        <th className="text-right py-1.5 px-1">Net</th>
                        <th className="text-right py-1.5 pl-1">Cash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.months.map((m) => (
                        <tr key={m.month} className={`border-b border-gray-100 ${m.month === model.breakEvenMonth ? 'bg-emerald-50' : ''}`}>
                          <td className="py-1 pr-2 text-gray-400">{m.label}</td>
                          <td className="py-1 px-1 text-right text-cyan-600">{m.activeCities}</td>
                          <td className="py-1 px-1 text-right text-purple-600">{m.totalLeagues}</td>
                          <td className="py-1 px-1 text-right text-gray-700">{m.totalActivePlayers}</td>
                          <td className="py-1 px-1 text-right text-gray-400">€{m.effectiveFee}</td>
                          <td className="py-1 px-1 text-right text-emerald-600">{fmt(m.monthlyRevenue)}</td>
                          <td className="py-1 px-1 text-right text-red-600">{fmt(m.totalCosts)}</td>
                          <td className={`py-1 px-1 text-right font-medium ${m.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(m.netProfit)}</td>
                          <td className={`py-1 pl-1 text-right ${m.cumulativeCash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(m.cumulativeCash)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CASH FLOW TAB */}
        {/* ============================================================ */}
        {tab === 'Cash Flow' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {sidebar}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPI label="Initial Investment" value={fmt(initialInvestment)} color="amber" />
                <KPI label="Cumulative B/E" value={model.breakEvenMonth ? `Month ${model.breakEvenMonth}` : 'N/A'} color={model.breakEvenMonth && model.breakEvenMonth <= 12 ? 'emerald' : 'amber'} />
                <KPI label="Y1 End Cash" value={fmt(model.yearly[0].endCash)} color={model.yearly[0].endCash >= 0 ? 'emerald' : 'red'} />
                <KPI label="Y3 End Cash" value={fmt(model.yearly[2].endCash)} color={model.yearly[2].endCash >= 0 ? 'emerald' : 'red'} />
              </div>

              <Card title="Cumulative Cash Flow" icon="💰">
                <div className="h-72">
                  <ResponsiveContainer>
                    <AreaChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `€${v}`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
                      <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="cumulativeCash" name="Cumulative Cash" fill={COLORS.emerald} fillOpacity={0.15} stroke={COLORS.emerald} strokeWidth={2} />
                      <Line type="monotone" dataKey="netProfit" name="Monthly Net" stroke={COLORS.amber} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Monthly Cash Flow Detail" icon="📊">
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={model.months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `€${v}`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => fmt(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={0} stroke="#6b7280" />
                      <Bar dataKey="monthlyRevenue" name="Revenue" fill={COLORS.emerald} />
                      <Bar dataKey="totalCosts" name="Costs" fill={COLORS.red} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SENSITIVITY TAB */}
        {/* ============================================================ */}
        {tab === 'Sensitivity' && (
          <div className="flex flex-col lg:flex-row gap-4">
            {sidebar}
            <div className="flex-1 space-y-4">
              <Card title="Key Driver Impact on Y3 Net Profit" icon="🎚️">
                <p className="text-xs text-gray-500 mb-4">Shows how changing each driver independently affects Year 3 net profit. Current values marked.</p>
                <div className="space-y-6">
                  {sensitivity.map(driver => {
                    const steps = []
                    for (let v = driver.range[0]; v <= driver.range[1]; v += driver.step) steps.push(Math.round(v * 100) / 100)
                    return (
                      <div key={driver.key}>
                        <div className="text-xs text-gray-700 font-medium mb-2">{driver.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-end gap-px h-16">
                            {steps.map(v => {
                              const isCurrent = Math.abs(v - driver.base) < driver.step / 2
                              return (
                                <div key={v} className="flex-1 flex flex-col items-center">
                                  <div className={`w-full rounded-t ${isCurrent ? 'bg-parque-purple' : 'bg-gray-200'}`} style={{ height: `${Math.max(4, 60 * (v / driver.range[1]))}px` }} />
                                  <div className={`text-[8px] mt-1 ${isCurrent ? 'text-parque-purple font-bold' : 'text-gray-400'}`}>
                                    {driver.prefix || ''}{v}{driver.suffix || ''}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card title="Scenario Comparison" icon="📊">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Conservative', desc: '€20 fee, 60% retention, 1 city/qtr', color: 'amber' },
                    { name: 'Base Case', desc: 'Current slider values', color: 'emerald' },
                    { name: 'Aggressive', desc: '€40 fee, 80% retention, 3 cities/qtr', color: 'cyan' },
                  ].map(scenario => (
                    <div key={scenario.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className={`text-xs font-medium text-${scenario.color}-600 mb-1`}>{scenario.name}</div>
                      <div className="text-[10px] text-gray-500 mb-2">{scenario.desc}</div>
                      <div className="text-xs text-gray-500">
                        {scenario.name === 'Base Case' ? (
                          <div className="space-y-1">
                            <div>Y3 Revenue: <span className="text-emerald-600 font-medium">{fmt(model.yearly[2].totalRevenue)}</span></div>
                            <div>Y3 Net: <span className={`font-medium ${model.yearly[2].netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(model.yearly[2].netProfit)}</span></div>
                            <div>Break-even: <span className="text-amber-600">{model.breakEvenMonth ? `M${model.breakEvenMonth}` : 'N/A'}</span></div>
                          </div>
                        ) : (
                          <div className="text-gray-400 italic text-[10px]">Save as preset &amp; compare</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Admin Time Projection" icon="⏱️">
                <div className="text-xs text-gray-500 space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    {model.yearly.map(y => {
                      const lastMonth = model.months.filter((m) => m.year === y.year).slice(-1)[0]
                      return (
                        <div key={y.year} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="text-gray-500 text-[10px]">Year {y.year}</div>
                          <div className="text-lg font-bold text-purple-600">{lastMonth.monthlyAdminHours}h/mo</div>
                          <div className="text-[10px] text-gray-500">{lastMonth.totalLeagues} leagues &times; {adminHoursPerLeagueWeek}h/wk</div>
                          <div className="text-[10px] text-gray-500">{(lastMonth.monthlyAdminHours / 4.33 / 5).toFixed(1)}h/day (weekdays)</div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-gray-500">At {adminHoursPerLeagueWeek}h per league per week. Consider hiring when admin exceeds 20h/week ({Math.ceil(20 / adminHoursPerLeagueWeek)} leagues).</p>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

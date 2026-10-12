'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TrendingUp, Scale, Trophy, Star, Infinity as InfinityIcon, ArrowLeft } from 'lucide-react'

const content = {
  es: {
    back: 'OpenRank',
    title: '¿Qué es el ELO?',
    intro: 'Tu ELO es un número que muestra tu nivel de tenis. Sube cuando ganas, baja cuando pierdes.',
    startTitle: 'Todos empiezan con un número',
    startText: 'Tu punto de partida depende del nivel que elegiste al apuntarte.',
    levels: [
      { label: 'Bronce', value: 1100 },
      { label: 'Plata', value: 1200 },
      { label: 'Oro', value: 1300 }
    ],
    rivalTitle: 'Importa contra quién juegas',
    rivalText: 'Ganar a alguien más fuerte vale más. Perder contra alguien más fuerte cuesta menos.',
    exampleHeader: 'Tú tienes 1200 y ganas a...',
    examples: [
      { who: 'Un rival más fuerte', elo: 1300, pts: '+20' },
      { who: 'Un rival igual', elo: 1200, pts: '+16' },
      { who: 'Un rival más débil', elo: 1100, pts: '+12' }
    ],
    exampleNote: 'Tu rival pierde los mismos puntos que tú ganas.',
    resultTitle: 'Solo cuenta quién gana',
    resultText: 'Un 6-0 6-0 o una victoria en el super tie-break dan los mismos puntos ELO. Los walkovers no cambian el ELO.',
    leagueTitle: 'ELO no es la clasificación de la liga',
    leagueText: 'La clasificación de tu liga usa puntos por partido (3 por un 2-0, 2 por un 2-1...). El ELO es tu nivel general y te acompaña en todas las ligas y temporadas.',
    rankTitle: 'OpenRank',
    rankText: 'Juega 8 partidos y entrarás en OpenRank, el ranking de todos los jugadores ordenado por ELO.',
    cta: 'Ver OpenRank'
  },
  en: {
    back: 'OpenRank',
    title: 'What is ELO?',
    intro: 'Your ELO is a number that shows your tennis level. It goes up when you win and down when you lose.',
    startTitle: 'Everyone starts with a number',
    startText: 'Your starting point depends on the level you picked when you signed up.',
    levels: [
      { label: 'Bronze', value: 1100 },
      { label: 'Silver', value: 1200 },
      { label: 'Gold', value: 1300 }
    ],
    rivalTitle: 'Who you play matters',
    rivalText: 'Beating a stronger player is worth more. Losing to a stronger player costs less.',
    exampleHeader: 'You have 1200 and you beat...',
    examples: [
      { who: 'A stronger rival', elo: 1300, pts: '+20' },
      { who: 'An equal rival', elo: 1200, pts: '+16' },
      { who: 'A weaker rival', elo: 1100, pts: '+12' }
    ],
    exampleNote: 'Your rival loses the same points you win.',
    resultTitle: 'Only the winner counts',
    resultText: 'A 6-0 6-0 or a win in the super tiebreak give the same ELO points. Walkovers don’t change ELO.',
    leagueTitle: 'ELO is not the league table',
    leagueText: 'Your league table uses match points (3 for a 2-0, 2 for a 2-1...). ELO is your overall level, and it follows you across all leagues and seasons.',
    rankTitle: 'OpenRank',
    rankText: 'Play 8 matches and you join OpenRank, the ranking of all players sorted by ELO.',
    cta: 'See OpenRank'
  }
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-parque-purple" />
        </div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function PlayerEloPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const t = content[locale] || content.es

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href={`/${locale}/player/openrank`} className="tap-target inline-flex items-center gap-1 text-sm text-gray-500 hover:text-parque-purple">
        <ArrowLeft className="w-4 h-4" />
        {t.back}
      </Link>

      <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 rounded-2xl text-white p-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="mt-2 text-purple-100">{t.intro}</p>
        </div>
      </div>

      <Section icon={Star} title={t.startTitle}>
        <p className="text-sm text-gray-600">{t.startText}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {t.levels.map(l => (
            <div key={l.value} className="rounded-xl bg-gray-50 py-3 text-center">
              <div className="text-xs text-gray-500">{l.label}</div>
              <div className="text-lg font-bold text-gray-900 tabular-nums">{l.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Scale} title={t.rivalTitle}>
        <p className="text-sm text-gray-600">{t.rivalText}</p>
        <div className="mt-4 rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">{t.exampleHeader}</div>
          {t.examples.map(e => (
            <div key={e.elo} className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">{e.who}</div>
                <div className="text-xs text-gray-400 tabular-nums">ELO {e.elo}</div>
              </div>
              <div className="text-lg font-bold text-green-600 tabular-nums">{e.pts}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">{t.exampleNote}</p>
      </Section>

      <Section icon={TrendingUp} title={t.resultTitle}>
        <p className="text-sm text-gray-600">{t.resultText}</p>
      </Section>

      <Section icon={InfinityIcon} title={t.leagueTitle}>
        <p className="text-sm text-gray-600">{t.leagueText}</p>
      </Section>

      <Section icon={Trophy} title={t.rankTitle}>
        <p className="text-sm text-gray-600">{t.rankText}</p>
        <Link
          href={`/${locale}/player/openrank`}
          className="mt-4 inline-flex items-center px-4 py-2 bg-parque-purple hover:bg-purple-800 text-white text-sm font-medium rounded-lg"
        >
          {t.cta}
        </Link>
      </Section>
    </div>
  )
}

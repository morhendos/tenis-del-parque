import React from 'react'

const pill = 'text-xs font-semibold rounded-full ring-1 border-0 py-1 pl-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-parque-purple/40'

const levelStyle = {
  beginner: 'bg-orange-50 text-orange-700 ring-orange-200',
  intermediate: 'bg-slate-50 text-slate-700 ring-slate-200',
  advanced: 'bg-amber-50 text-amber-700 ring-amber-200'
}

const statusStyle = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  confirmed: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200'
}

const Spinner = () => (
  <svg className="animate-spin h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
)

const Svg = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const IC = {
  move: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  remove: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6',
  injury: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
}

const iconBtn = 'p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors'

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase()

export default function PlayerTableRow({
  player,
  onStatusUpdate,
  onLevelUpdate,
  onInvite,
  onDelete,
  onRecalculateElo,
  onRemoveFromLeague,
  onMoveToLeague,
  onViewDetails,
  onPaymentStatusUpdate,
  onInjuryToggle,
  updateLoading,
  invitationLoading,
  eloRecalculateLoading,
  currentLeagueId
}) {
  const getInviteButtonConfig = (player) => {
    const canInvite = player.status === 'pending' && !player.userId
    const canReinvite = player.status === 'pending' && player.userId

    if (canInvite) return { show: true, text: 'Invite', isReinvite: false }
    if (canReinvite) return { show: true, text: 'Re-invite', isReinvite: true }
    if (player.status === 'confirmed') return { show: false, status: 'Invited' }
    if (player.status === 'active') return { show: false, status: 'Active' }
    return { show: false, status: '-' }
  }

  const getPaymentDisplay = () => {
    const paymentStatus = player.paymentStatus || 'pending'
    const originalPrice = player.originalPrice ?? 0
    const finalPrice = player.finalPrice ?? player.originalPrice ?? 0
    const discountCode = player.discountCode
    const discountApplied = player.discountApplied || 0

    if (originalPrice === 0 && !discountCode) {
      return { status: 'unknown', label: 'N/A', style: 'bg-gray-50 text-gray-400 ring-gray-200', amount: null, discountCode: null }
    }
    if (paymentStatus === 'completed') {
      return { status: 'completed', label: 'Paid', style: 'bg-emerald-50 text-emerald-700 ring-emerald-200', amount: finalPrice, discountCode }
    }
    if (paymentStatus === 'waived' || (finalPrice === 0 && discountCode) || discountApplied === 100) {
      return {
        status: 'waived',
        label: 'Free',
        style: 'bg-purple-50 text-parque-purple ring-purple-200',
        amount: 0,
        discountCode: discountCode || (discountApplied === 100 ? '100% OFF' : null),
        originalPrice
      }
    }
    return { status: 'pending', label: 'Owes', style: 'bg-amber-50 text-amber-700 ring-amber-200', amount: finalPrice, discountCode }
  }

  const config = getInviteButtonConfig(player)
  const paymentInfo = getPaymentDisplay()
  const statusLoadingKey = `status-${player._id}`
  const levelLoadingKey = `level-${player._id}`
  const inviteLoadingKey = `invite-${player._id}`
  const paymentLoadingKey = `payment-${player._id}`
  const played = player.stats?.matchesPlayed || 0
  const won = player.stats?.matchesWon || 0

  return (
    <tr className="hover:bg-purple-50/30 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-50 text-parque-purple text-xs font-bold flex items-center justify-center flex-shrink-0">
            {initials(player.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {onViewDetails ? (
                <button
                  onClick={() => onViewDetails(player)}
                  className="text-sm font-semibold text-gray-900 hover:text-parque-purple text-left"
                  title="View player details"
                >
                  {player.name}
                </button>
              ) : (
                <span className="text-sm font-semibold text-gray-900">{player.name}</span>
              )}
              {player.injury?.active && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                  title={`Injured${player.injury.reason ? ': ' + player.injury.reason : ''} - Est. return: ${player.injury.estimatedReturnDate ? new Date(player.injury.estimatedReturnDate).toLocaleDateString('en-GB') : 'N/A'}`}
                >
                  Injured
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Joined {new Date(player.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-sm text-gray-700 truncate max-w-[220px]" title={player.email}>{player.email}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">{player.whatsapp}</span>
          {player.whatsapp && (
            <button
              onClick={() => {
                const cleanPhone = player.whatsapp.replace(/[^0-9+]/g, '')
                const phoneWithCode = cleanPhone.startsWith('+') ? cleanPhone : `+34${cleanPhone}`
                window.open(`https://wa.me/${phoneWithCode.replace('+', '')}`, '_blank')
              }}
              className="p-0.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Open WhatsApp"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487" />
              </svg>
            </button>
          )}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <select
            value={player.level}
            onChange={(e) => onLevelUpdate(player._id, e.target.value)}
            disabled={updateLoading[levelLoadingKey]}
            className={`${pill} ${levelStyle[player.level] || 'bg-purple-50 text-parque-purple ring-purple-200'} ${updateLoading[levelLoadingKey] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {updateLoading[levelLoadingKey] && <Spinner />}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 tabular-nums">{player.eloRating || 1200}</p>
            <p className="text-xs text-gray-400 tabular-nums">{won}W - {played - won}L</p>
          </div>
          {played > 0 && (
            <button
              onClick={() => onRecalculateElo(player._id)}
              disabled={eloRecalculateLoading[`elo-${player._id}`]}
              className={`${iconBtn} hover:text-parque-purple disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Recalculate ELO from match history"
            >
              {eloRecalculateLoading[`elo-${player._id}`] ? <Spinner /> : <Svg d={IC.refresh} className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            {onPaymentStatusUpdate && paymentInfo.status !== 'unknown' ? (
              <select
                value={player.paymentStatus || 'pending'}
                onChange={(e) => onPaymentStatusUpdate(player._id, e.target.value)}
                disabled={updateLoading[paymentLoadingKey]}
                className={`${pill} ${paymentInfo.style} ${updateLoading[paymentLoadingKey] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="pending">Owes €{paymentInfo.amount || 0}</option>
                <option value="completed">Paid</option>
                <option value="waived">Free</option>
              </select>
            ) : (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${paymentInfo.style}`}>
                {paymentInfo.label}
                {paymentInfo.amount !== null && paymentInfo.status === 'pending' && ` €${paymentInfo.amount}`}
              </span>
            )}
            {updateLoading[paymentLoadingKey] && <Spinner />}
          </div>
          {paymentInfo.discountCode && (
            <span
              className="font-mono text-[10px] font-semibold text-parque-purple bg-purple-50 border border-dashed border-purple-200 px-1.5 py-0.5 rounded"
              title={paymentInfo.originalPrice ? `Saved €${paymentInfo.originalPrice}` : 'Discount applied'}
            >
              {paymentInfo.discountCode}
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <select
            value={player.status}
            onChange={(e) => onStatusUpdate(player._id, e.target.value)}
            disabled={updateLoading[statusLoadingKey]}
            className={`${pill} ${statusStyle[player.status] || 'bg-gray-50 text-gray-600 ring-gray-200'} ${updateLoading[statusLoadingKey] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {updateLoading[statusLoadingKey] && <Spinner />}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        {config.show ? (
          <button
            onClick={() => onInvite(player._id, config.isReinvite)}
            disabled={invitationLoading[inviteLoadingKey]}
            className={`px-3 py-1 text-xs font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              config.isReinvite
                ? 'bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50'
                : 'bg-parque-purple text-white hover:bg-parque-purple/90'
            }`}
          >
            {invitationLoading[inviteLoadingKey] ? '...' : config.text}
          </button>
        ) : (
          <span className={`text-xs font-medium ${
            player.status === 'active' ? 'text-emerald-600' :
            player.status === 'confirmed' ? 'text-indigo-600' : 'text-gray-300'
          }`}>
            {config.status}
          </span>
        )}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center justify-end gap-0.5">
          {currentLeagueId && onMoveToLeague && (
            <button onClick={() => onMoveToLeague(player)} className={`${iconBtn} hover:text-parque-purple`} title="Move to another league">
              <Svg d={IC.move} />
            </button>
          )}
          {currentLeagueId && onRemoveFromLeague && (
            <button
              onClick={() => onRemoveFromLeague(player._id, currentLeagueId, player.league?.name)}
              className={`${iconBtn} hover:text-orange-600`}
              title="Remove from this league only"
            >
              <Svg d={IC.remove} />
            </button>
          )}
          {onInjuryToggle && (
            <button
              onClick={() => onInjuryToggle(player)}
              className={`${iconBtn} ${player.injury?.active ? 'text-rose-500 hover:text-emerald-600' : 'hover:text-rose-500'}`}
              title={player.injury?.active ? 'Clear injury status' : 'Mark as injured'}
            >
              <Svg d={IC.injury} />
            </button>
          )}
          <button
            onClick={() => onDelete({ show: true, player: player })}
            className={`${iconBtn} hover:text-red-600 hover:bg-red-50`}
            title="Delete player completely"
          >
            <Svg d={IC.trash} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function EloContentRenderer({ contentItems = [], language = 'es' }) {
  const renderContent = (items) => {
    if (!items || !Array.isArray(items)) {
      return null
    }
    
    return items.map((item, index) => {
      if (!item || !item.type) {
        return null
      }
      
      switch (item.type) {
        case 'text':
          return (
            <p key={index} className="text-gray-600 leading-relaxed mb-6 text-lg">
              {item.text}
            </p>
          )
        
        case 'cards':
          return (
            <div key={index} className="grid md:grid-cols-3 gap-6 my-12">
              {item.cards?.map((card, cardIndex) => (
                <div key={cardIndex} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 rounded-2xl flex items-center justify-center mb-6">
                    {renderIcon(card.icon)}
                  </div>
                  <h4 className="text-xl font-medium text-parque-purple mb-3">{card.title}</h4>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          )
        
        case 'timeline':
          return (
            <div key={index} className="my-12">
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-parque-purple/20 via-parque-purple/40 to-parque-purple/20"></div>
                {item.events?.map((event, eventIndex) => (
                  <div key={eventIndex} className={`relative flex items-center mb-12 ${eventIndex % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-5/12 ${eventIndex % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <span className="text-3xl font-light text-parque-purple">{event.year}</span>
                        <h4 className="text-xl font-medium text-gray-800 mt-2 mb-2">{event.title}</h4>
                        <p className="text-gray-600">{event.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-parque-purple rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          )
        
        case 'comparison':
          return (
            <div key={index} className="my-12">
              <h4 className="text-2xl font-light text-center text-parque-purple mb-8">{item.title}</h4>
              <div className="grid md:grid-cols-2 gap-8">
                {item.items?.map((system, sysIndex) => (
                  <div key={sysIndex} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h5 className="text-xl font-medium text-gray-800 mb-6">{system.system}</h5>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-2">{language === 'es' ? 'Ventajas:' : 'Pros:'}</p>
                        <ul className="space-y-2">
                          {system.pros?.map((pro, proIndex) => (
                            <li key={proIndex} className="flex items-start">
                              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-600">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {system.cons?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-2">{language === 'es' ? 'Desventajas:' : 'Cons:'}</p>
                          <ul className="space-y-2">
                            {system.cons.map((con, conIndex) => (
                              <li key={conIndex} className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-gray-600">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        
        case 'features':
          return (
            <div key={index} className="grid md:grid-cols-2 gap-8 my-12">
              {item.features?.map((feature, featIndex) => (
                <div key={featIndex} className="bg-gradient-to-br from-parque-purple/5 to-parque-green/5 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-parque-purple/10">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {renderFeatureIcon(feature.icon)}
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-parque-purple mb-3">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        
        case 'process':
          return (
            <div key={index} className="my-12">
              <h4 className="text-2xl font-light text-parque-purple mb-8">{item.title}</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {item.steps?.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-parque-purple to-parque-purple/80 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-medium">
                      {stepIndex + 1}
                    </div>
                    <div>
                      <h5 className="text-lg font-medium text-gray-800 mb-2">{step.title}</h5>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        
        case 'example':
          return (
            <div key={index} className="my-12 bg-gradient-to-br from-parque-purple/5 to-transparent rounded-3xl p-8 shadow-lg">
              <h4 className="text-2xl font-light text-parque-purple mb-6">{item.title}</h4>
              
              {item.scenario?.player && (
                <div className="bg-white/90 rounded-2xl p-6 mb-6">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">{item.scenario.player}</h5>
                  <div className="space-y-3">
                    {item.scenario.rounds?.map((round, roundIndex) => (
                      <div key={roundIndex} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-600">{language === 'es' ? 'Ronda' : 'Round'} {round.round}</span>
                          <span className="text-sm text-gray-500">vs {round.opponent}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`text-sm font-medium ${round.result?.includes('Gana') || round.result?.includes('Wins') ? 'text-green-600' : 'text-red-600'}`}>
                            {round.result}
                          </span>
                          <span className="text-lg font-medium text-parque-purple">{round.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {item.scenario?.player1 && (
                <>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/90 rounded-2xl p-6">
                      <h5 className="text-lg font-medium text-gray-800 mb-4">{language === 'es' ? 'Antes del partido' : 'Before the match'}</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.scenario.player1.name}</span>
                          <span className="text-2xl font-light text-parque-purple">{item.scenario.player1.elo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.scenario.player2.name}</span>
                          <span className="text-2xl font-light text-parque-purple">{item.scenario.player2.elo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/90 rounded-2xl p-6">
                      <h5 className="text-lg font-medium text-gray-800 mb-4">{language === 'es' ? 'Resultado' : 'Result'}</h5>
                      <p className="text-lg text-gray-700">{item.scenario.result}</p>
                    </div>
                  </div>
                  
                  {item.calculation && (
                    <div className="bg-white/90 rounded-2xl p-6">
                      <h5 className="text-lg font-medium text-gray-800 mb-4">{language === 'es' ? 'Cálculo' : 'Calculation'}</h5>
                      <ul className="space-y-2">
                        {item.calculation.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="text-parque-green mr-2">→</span>
                            <span className="text-gray-600">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        
        case 'formula':
          return (
            <div key={index} className="my-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h4 className="text-xl font-medium text-parque-purple mb-4">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )
        
        default:
          return null
      }
    })
  }

  const renderIcon = (iconName) => {
    const iconClass = "w-8 h-8 text-parque-purple"
    const iconProps = {
      className: iconClass,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }

    switch (iconName) {
      case 'dynamic':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'fair':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        )
      case 'accurate':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'no-elimination':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        )
      case 'fair-pairing':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'max-participation':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      case 'smart':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'double':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      case 'complete':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const renderFeatureIcon = (iconName) => {
    const iconClass = "w-6 h-6 text-parque-purple"
    const iconProps = {
      className: iconClass,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }

    switch (iconName) {
      case 'levels':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'swiss':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        )
      case 'motivation':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'progress':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'flexibility':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'learning':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'social':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      case 'combine':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {renderContent(contentItems)}
      </div>
    </div>
  )
}
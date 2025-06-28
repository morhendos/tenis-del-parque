// Analytics utility for tracking custom events
// Works with Microsoft Clarity and Google Analytics

export const analytics = {
  // Track page views
  pageView: (pageName) => {
    // Microsoft Clarity
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('set', 'page', pageName)
    }
    
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname
      })
    }
    
    console.log('Page view:', pageName)
  },

  // Track custom events
  track: (eventName, eventData = {}) => {
    // Microsoft Clarity custom events
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', eventName, eventData)
    }
    
    // Google Analytics custom events
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...eventData,
        custom_timestamp: new Date().toISOString()
      })
    }
    
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventName, eventData)
    }
  },

  // Track registration funnel
  trackRegistration: {
    // When user lands on signup page
    viewSignupPage: (league) => {
      analytics.track('signup_page_viewed', { 
        league,
        event_category: 'engagement',
        event_label: league
      })
    },

    // When user starts filling form
    startForm: (league) => {
      analytics.track('signup_form_started', { 
        league,
        event_category: 'engagement',
        event_label: league
      })
    },

    // Track field interactions
    fieldInteraction: (fieldName, league) => {
      analytics.track('signup_field_interaction', { 
        field: fieldName,
        league,
        event_category: 'form',
        event_label: fieldName
      })
    },

    // Track validation errors
    validationError: (fieldName, errorType, league) => {
      analytics.track('signup_validation_error', { 
        field: fieldName,
        error: errorType,
        league,
        event_category: 'form_error',
        event_label: `${fieldName}_${errorType}`
      })
    },

    // When form is submitted
    submitForm: (league, level) => {
      analytics.track('signup_form_submitted', { 
        league,
        level,
        event_category: 'conversion',
        event_label: `${league}_${level}`
      })
    },

    // Registration success - This is a conversion!
    success: (league, level, playerId) => {
      analytics.track('signup_success', { 
        league,
        level,
        playerId,
        event_category: 'conversion',
        event_label: `${league}_${level}`,
        value: 1
      })
      
      // Also track as a conversion for Google Ads if needed
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with your conversion ID if using Google Ads
          'value': 1.0,
          'currency': 'EUR'
        })
      }
    },

    // Registration failure
    failure: (league, error) => {
      analytics.track('signup_failure', { 
        league,
        error,
        event_category: 'error',
        event_label: error
      })
    }
  },

  // Track navigation
  trackNavigation: {
    click: (item, currentPage) => {
      analytics.track('navigation_click', { 
        item,
        from: currentPage,
        event_category: 'navigation',
        event_label: item
      })
    },

    languageChange: (from, to) => {
      analytics.track('language_changed', { 
        from,
        to,
        event_category: 'preferences',
        event_label: `${from}_to_${to}`
      })
    }
  },

  // Track CTA clicks
  trackCTA: {
    heroButton: () => {
      analytics.track('cta_hero_clicked', { 
        event_category: 'cta',
        event_label: 'hero_button'
      })
    },

    signupSectionButton: () => {
      analytics.track('cta_signup_section_clicked', { 
        event_category: 'cta',
        event_label: 'signup_section_button'
      })
    }
  },

  // Track user engagement
  trackEngagement: {
    scrollDepth: (percentage) => {
      analytics.track('scroll_depth', { 
        percentage,
        event_category: 'engagement',
        event_label: `${percentage}%`
      })
    },

    timeOnPage: (seconds, pageName) => {
      analytics.track('time_on_page', { 
        seconds,
        page: pageName,
        event_category: 'engagement',
        event_label: pageName,
        value: seconds
      })
    }
  },

  // Identify user (useful after registration)
  identify: (userId, traits = {}) => {
    // Microsoft Clarity
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('identify', userId, traits)
    }
    
    // Google Analytics User ID
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId
      })
    }
  }
}

// Auto-track page load time
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    analytics.track('page_load_time', { 
      loadTime,
      url: window.location.pathname,
      event_category: 'performance',
      event_label: window.location.pathname,
      value: loadTime
    })
  })
}

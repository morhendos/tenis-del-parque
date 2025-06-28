// Analytics utility for tracking custom events
// Works with Microsoft Clarity and can be extended for other analytics

export const analytics = {
  // Track page views
  pageView: (pageName) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('set', 'page', pageName)
    }
    console.log('Page view:', pageName)
  },

  // Track custom events
  track: (eventName, eventData = {}) => {
    // Microsoft Clarity custom events
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', eventName, eventData)
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
        timestamp: new Date().toISOString()
      })
    },

    // When user starts filling form
    startForm: (league) => {
      analytics.track('signup_form_started', { 
        league,
        timestamp: new Date().toISOString()
      })
    },

    // Track field interactions
    fieldInteraction: (fieldName, league) => {
      analytics.track('signup_field_interaction', { 
        field: fieldName,
        league,
        timestamp: new Date().toISOString()
      })
    },

    // Track validation errors
    validationError: (fieldName, errorType, league) => {
      analytics.track('signup_validation_error', { 
        field: fieldName,
        error: errorType,
        league,
        timestamp: new Date().toISOString()
      })
    },

    // When form is submitted
    submitForm: (league, level) => {
      analytics.track('signup_form_submitted', { 
        league,
        level,
        timestamp: new Date().toISOString()
      })
    },

    // Registration success
    success: (league, level, playerId) => {
      analytics.track('signup_success', { 
        league,
        level,
        playerId,
        timestamp: new Date().toISOString()
      })
    },

    // Registration failure
    failure: (league, error) => {
      analytics.track('signup_failure', { 
        league,
        error,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track navigation
  trackNavigation: {
    click: (item, currentPage) => {
      analytics.track('navigation_click', { 
        item,
        from: currentPage,
        timestamp: new Date().toISOString()
      })
    },

    languageChange: (from, to) => {
      analytics.track('language_changed', { 
        from,
        to,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track CTA clicks
  trackCTA: {
    heroButton: () => {
      analytics.track('cta_hero_clicked', { 
        timestamp: new Date().toISOString()
      })
    },

    signupSectionButton: () => {
      analytics.track('cta_signup_section_clicked', { 
        timestamp: new Date().toISOString()
      })
    }
  },

  // Track user engagement
  trackEngagement: {
    scrollDepth: (percentage) => {
      analytics.track('scroll_depth', { 
        percentage,
        timestamp: new Date().toISOString()
      })
    },

    timeOnPage: (seconds, pageName) => {
      analytics.track('time_on_page', { 
        seconds,
        page: pageName,
        timestamp: new Date().toISOString()
      })
    }
  },

  // Identify user (useful after registration)
  identify: (userId, traits = {}) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('identify', userId, traits)
    }
  }
}

// Auto-track page load time
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    analytics.track('page_load_time', { 
      loadTime,
      url: window.location.pathname
    })
  })
}
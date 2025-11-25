/**
 * UI Interactions Component
 * Handles subtle animations, scroll reveals, and magnetic effects.
 */

export function initUIInteractions() {
  initScrollReveal()
  initMagneticButtons()
  initParallax()
}

/**
 * Initialize Scroll Reveal Animations using IntersectionObserver
 */
function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
        observer.unobserve(entry.target) // Only animate once
      }
    })
  }, observerOptions)

  // Select elements to animate
  const elements = document.querySelectorAll('.reveal-on-scroll')
  elements.forEach(el => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    observer.observe(el)
  })

  // Add global style for animation
  const style = document.createElement('style')
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `
  document.head.appendChild(style)
}

/**
 * Initialize Magnetic Button Effect
 * Adds a subtle magnetic pull to buttons on hover
 */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-magnetic')

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`
    })

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)'
    })
  })
}

/**
 * Initialize Parallax Effect for Hero Image
 */
function initParallax() {
  const heroImage = document.querySelector('.hero-image')
  if (!heroImage) {
    return
  }

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY
    if (scrolled < 800) {
      heroImage.style.transform = `translateY(${scrolled * 0.05}px)`
    }
  })
}

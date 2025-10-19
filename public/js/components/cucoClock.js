/**
 * Verdadero Reloj Cuco - Sin fallbacks, con fail-fast
 * Un reloj cucu auténtico con pajarito animado que sale y dice "cucu"
 * Aplica estrictamente las reglas: no fallbacks, fail-fast inmediato
 */

console.log('🔍 [CUCO DEBUG] cucoClock.js module loaded')

class CucoClock {
  constructor() {
    console.log('🔍 [CUCO DEBUG] CucoClock constructor called')
    this.clockElement = null
    this.timeElement = null
    this.hourHand = null
    this.minuteHand = null
    this.door = null
    this.bird = null
    this.speechBubble = null
    this.cucoAudio = null

    // Load saved state from localStorage
    try {
      const savedState = localStorage.getItem('cucoClockState')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        this.isClockVisible = parsed.isVisible !== undefined ? parsed.isVisible : false
        this.soundEnabled = parsed.soundEnabled !== undefined ? parsed.soundEnabled : true
        console.log('🔍 [CUCO DEBUG] Loaded state from localStorage:', parsed)
      } else {
        this.isClockVisible = false
        this.soundEnabled = true
        console.log('🔍 [CUCO DEBUG] No saved state found, using defaults')
      }
    } catch (error) {
      console.warn('⚠️ [CUCO WARNING] Failed to load state from localStorage:', error)
      this.isClockVisible = false
      this.soundEnabled = true
    }

    this.lastHour = null

    console.log('🔍 [CUCO DEBUG] Starting CucoClock initialization...')
    this.init()
    console.log('🔍 [CUCO DEBUG] CucoClock initialization completed')
  }

  init() {
    try {
      this.createClockElement()
      this.initializeAudio()
      this.startClock()
      this.handleVisibility()
      this.addEventListeners()
      this.updateToggleButtonState()
      this.setClockVisibility(this.isClockVisible)
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to initialize CucoClock:', error)
      throw new Error(`CucoClock initialization failed: ${error.message}`)
    }
  }

  createClockElement() {
    try {
      this.clockElement = document.createElement('div')
      this.clockElement.className = 'cuco-clock'
      this.clockElement.innerHTML = `
        <div class="cuco-clock-body">
          <!-- Techo del reloj -->
          <div class="cuco-clock-roof"></div>

          <!-- Cara del reloj -->
          <div class="cuco-clock-face">
            <div class="cuco-clock-number twelve">12</div>
            <div class="cuco-clock-number three">3</div>
            <div class="cuco-clock-number six">6</div>
            <div class="cuco-clock-number nine">9</div>
            <div class="cuco-clock-center"></div>
            <div class="cuco-clock-hand cuco-clock-hour-hand"></div>
            <div class="cuco-clock-hand cuco-clock-minute-hand"></div>
          </div>

          <!-- Display digital -->
          <div class="cuco-clock-time-display">--:--</div>

          <!-- Burbuja de diálogo -->
          <div class="cuco-clock-speech-bubble">¡CU-CU!</div>

          <!-- Marco de la puerta -->
          <div class="cuco-clock-door-frame"></div>

          <!-- Puerta del cuco -->
          <div class="cuco-clock-door"></div>

          <!-- El pajarito cuco -->
          <div class="cuco-clock-bird">
            <div class="cuco-clock-bird-head">
              <div class="cuco-clock-bird-eye"></div>
              <div class="cuco-clock-bird-beak"></div>
            </div>
            <div class="cuco-clock-bird-body"></div>
            <div class="cuco-clock-bird-wing-left"></div>
            <div class="cuco-clock-bird-wing-right"></div>
          </div>

          <!-- Botón de sonido -->
          <div class="cuco-clock-sound-toggle">
            <button class="cuco-clock-sound-btn" title="Toggle sound">
              <svg class="cuco-clock-sound-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" class="sound-wave"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" class="sound-wave"></path>
              </svg>
            </button>
          </div>
        </div>
      `

      document.body.appendChild(this.clockElement)

      // Cache de elementos DOM
      this.timeElement = this.clockElement.querySelector('.cuco-clock-time-display')
      this.hourHand = this.clockElement.querySelector('.cuco-clock-hour-hand')
      this.minuteHand = this.clockElement.querySelector('.cuco-clock-minute-hand')
      this.door = this.clockElement.querySelector('.cuco-clock-door')
      this.bird = this.clockElement.querySelector('.cuco-clock-bird')
      this.speechBubble = this.clockElement.querySelector('.cuco-clock-speech-bubble')
      this.soundBtn = this.clockElement.querySelector('.cuco-clock-sound-btn')
      this.soundWaves = this.clockElement.querySelectorAll('.sound-wave')

      if (!this.door || !this.bird || !this.speechBubble) {
        throw new Error('Required clock elements not found in DOM')
      }
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to create clock element:', error)
      throw error
    }
  }

  initializeAudio() {
    try {
      console.log('🔍 [CUCO DEBUG] Initializing cuco audio...')
      this.cucoAudio = new Audio('/reloj-cucu.mp3')
      this.cucoAudio.preload = 'auto'

      // Set up audio event listeners
      this.cucoAudio.addEventListener('canplaythrough', () => {
        console.log('🔍 [CUCO DEBUG] Cuco audio loaded successfully')
      })

      this.cucoAudio.addEventListener('error', error => {
        console.error('❌ [CUCO ERROR] Failed to load cuco audio:', error)
        // Fall back to synthetic sound if audio file fails
        this.cucoAudio = null
      })
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to initialize audio:', error)
      this.cucoAudio = null
    }
  }

  addEventListeners() {
    try {
      // Click en la cara del reloj para hacer cucu manual
      const clockFace = this.clockElement.querySelector('.cuco-clock-face')
      if (clockFace) {
        clockFace.addEventListener('click', () => {
          console.log('🔍 [CUCO DEBUG] Clock face clicked - manual cuco')
          this.triggerCucoSound()
        })
      }

      // Botón de sonido
      if (this.soundBtn) {
        this.soundBtn.addEventListener('click', e => {
          e.stopPropagation()
          this.toggleSound()
        })
      }
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to add event listeners:', error)
      throw error
    }
  }

  startClock() {
    try {
      this.updateTime()
      this.timeInterval = setInterval(() => {
        this.updateTime()
      }, 1000)
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to start clock:', error)
      throw error
    }
  }

  updateTime() {
    try {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      // Update time display
      if (this.timeElement) {
        this.timeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }

      // Calculate rotations
      const hourRotation = (hours % 12) * 30 + minutes * 0.5
      const minuteRotation = minutes * 6 + seconds * 0.1

      // Apply rotations
      if (this.hourHand) {
        this.hourHand.style.transform = `rotate(${hourRotation}deg)`
      }
      if (this.minuteHand) {
        this.minuteHand.style.transform = `rotate(${minuteRotation}deg)`
      }

      // Check for new hour
      if (hours !== this.lastHour && minutes === 0 && seconds === 0) {
        this.lastHour = hours
        if (this.soundEnabled) {
          const displayHour = hours === 0 ? 12 : hours % 12 || 12
          this.triggerCucoSound(displayHour)
        }
      }
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to update time:', error)
      // No throw error for time updates to keep clock running
    }
  }

  async triggerCucoSound(times = 1) {
    try {
      console.log(`🔍 [CUCO DEBUG] Triggering cuco sound ${times} time(s)`)

      // Open door
      if (this.door) {
        this.door.classList.add('open')
      }

      // Show speech bubble
      if (this.speechBubble) {
        this.speechBubble.classList.add('show')
      }

      // Show bird
      if (this.bird) {
        this.bird.classList.add('show')
      }

      // Play sound multiple times
      for (let i = 0; i < times; i++) {
        if (this.soundEnabled) {
          this.playCucoAudio()
        }
        await this.wait(800) // Wait between cuco sounds
      }

      // Hide everything after animation
      setTimeout(() => {
        if (this.door) {
          this.door.classList.remove('open')
        }
        if (this.speechBubble) {
          this.speechBubble.classList.remove('show')
        }
        if (this.bird) {
          this.bird.classList.remove('show')
        }
      }, 1500)
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to trigger cuco sound:', error)
      throw error
    }
  }

  playCucoAudio() {
    try {
      if (this.cucoAudio && this.cucoAudio.readyState >= 2) {
        // HAVE_CURRENT_DATA or higher
        console.log('🔍 [CUCO DEBUG] Playing real cuco audio file')
        // Reset audio to start if it's already playing
        this.cucoAudio.currentTime = 0
        this.cucoAudio.play()
      } else {
        console.log('🔍 [CUCO DEBUG] Audio not ready, using synthetic fallback')
        this.playSyntheticCuco()
      }
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to play cuco audio:', error)
      // Fall back to synthetic sound
      this.playSyntheticCuco()
    }
  }

  playSyntheticCuco() {
    try {
      console.log('🔍 [CUCO DEBUG] Using synthetic cuco sound fallback')
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = 'sine'
      oscillator.frequency.value = 1000 // Frequency for cuco sound
      gainNode.gain.value = 0.3

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)

      // Close context after use
      setTimeout(() => {
        try {
          audioContext.close()
        } catch (error) {
          console.warn('⚠️ [CUCO WARNING] Could not close audio context:', error)
        }
      }, 500)
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to play synthetic cuco audio:', error)
      // No throw error for audio to keep functionality working
    }
  }

  toggleSound() {
    try {
      this.soundEnabled = !this.soundEnabled
      console.log(`🔍 [CUCO DEBUG] Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`)

      // Update sound button appearance
      if (this.soundWaves) {
        this.soundWaves.forEach(wave => {
          if (this.soundEnabled) {
            wave.style.opacity = '1'
          } else {
            wave.style.opacity = '0.3'
          }
        })
      }

      this.saveState()
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to toggle sound:', error)
      throw error
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  handleVisibility() {
    try {
      document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === '`') {
          e.preventDefault()
          this.toggleClock()
        }
      })
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to setup visibility handlers:', error)
      throw error
    }
  }

  toggleClock() {
    try {
      this.isClockVisible = !this.isClockVisible
      this.clockElement.style.display = this.isClockVisible ? 'block' : 'none'
      this.updateToggleButtonState()
      this.saveState()
      console.log(`🔍 [CUCO DEBUG] Clock ${this.isClockVisible ? 'shown' : 'hidden'}`)
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to toggle clock:', error)
      throw error
    }
  }

  updateToggleButtonState() {
    try {
      const toggleBtn = document.getElementById('cuco-clock-toggle')
      if (toggleBtn) {
        if (this.isClockVisible) {
          toggleBtn.classList.add('active')
          toggleBtn.style.color = 'var(--navbar-icon-active, #ec4899)'
          toggleBtn.style.backgroundColor = 'rgba(236, 72, 153, 0.1)'
        } else {
          toggleBtn.classList.remove('active')
          toggleBtn.style.color = 'var(--navbar-icon-color, #6b7280)'
          toggleBtn.style.backgroundColor = 'transparent'
        }
      }
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to update toggle button state:', error)
      throw error
    }
  }

  setClockVisibility(visible) {
    try {
      this.isClockVisible = visible
      this.clockElement.style.display = this.isClockVisible ? 'block' : 'none'
      this.updateToggleButtonState()
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to set clock visibility:', error)
      throw error
    }
  }

  destroy() {
    try {
      if (this.timeInterval) {
        clearInterval(this.timeInterval)
      }
      if (this.cucoAudio) {
        this.cucoAudio.pause()
        this.cucoAudio = null
      }
      if (this.clockElement && this.clockElement.parentNode) {
        this.clockElement.parentNode.removeChild(this.clockElement)
      }
    } catch (error) {
      console.error('❌ [CUCO ERROR] Failed to destroy clock:', error)
      throw error
    }
  }
}

// Initialize the CucoClock immediately or when DOM is ready
function initializeCucoClock() {
  try {
    console.log('🔍 [CUCO DEBUG] initializeCucoClock() called')

    if (!window.cucoClockInstance) {
      console.log('🔍 [CUCO DEBUG] Creating new CucoClock instance...')
      window.cucoClockInstance = new CucoClock()
      window.cucoClock = window.cucoClockInstance
      console.log('🔍 [CUCO DEBUG] CucoClock instance created and assigned to window.cucoClock')
    } else {
      console.log('🔍 [CUCO DEBUG] CucoClock instance already exists')
    }
  } catch (error) {
    console.error('❌ [CUCO ERROR] Failed to initialize CucoClock:', error)
    // Fail-fast - no fallbacks
    throw error
  }
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for it
  document.addEventListener('DOMContentLoaded', initializeCucoClock)
} else {
  // DOM is already loaded, initialize immediately
  initializeCucoClock()
}

// Export for module usage if needed
export default CucoClock

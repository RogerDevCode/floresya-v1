/**
 * FloresYa - Sistema de Confeti Festivo
 * Huevos de pascua para diferentes épocas del año
 * Sin acceso a consola - activación automática y por teclas
 */

class FestiveConfetti {
  constructor() {
    this.hasShownToday = false
    this.init()
  }

  init() {
    this.setupKeyboardShortcuts()
    this.checkForSpecialDates()
    console.log('🎊 Sistema de confeti festivo inicializado')
  }

  /**
   * Configurar atajos de teclado
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Ctrl + Shift + F = Confeti de Pétalos
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        this.triggerPetalConfetti()
      }
    })
  }

  /**
   * Verificar fechas especiales al cargar
   */
  checkForSpecialDates() {
    const today = new Date()
    const month = today.getMonth() + 1 // JavaScript months are 0-11
    const day = today.getDate()
    const key = `confetti_shown_${month}_${day}`

    // Verificar si ya se mostró hoy
    this.hasShownToday = localStorage.getItem(key) === 'true'

    if (!this.hasShownToday) {
      // Carnaval (variable, pero típicamente febrero/marzo - simplificado)
      if (this.isCarnaval(today)) {
        this.triggerCarnavalConfetti()
        this.markAsShown(month, day)
      }
      // Navidad (24-25 de diciembre)
      else if (month === 12 && (day === 24 || day === 25)) {
        this.triggerChristmasConfetti()
        this.markAsShown(month, day)
      }
      // Día de los Muertos (1-2 de noviembre)
      else if (month === 11 && (day === 1 || day === 2)) {
        this.triggerDiaMuertosConfetti()
        this.markAsShown(month, day)
      }
      // Halloween (31 de octubre)
      else if (month === 10 && day === 31) {
        this.triggerHalloweenConfetti()
        this.markAsShown(month, day)
      }
      // Semana Santa (Pascua - variable pero simplificado marzo-abril)
      else if (this.isSemanaSanta(today)) {
        this.triggerSemanaSantaConfetti()
        this.markAsShown(month, day)
      }
      // Día del Huevo de Pascua (primer domingo después de luna llena de equinoccio)
      else if (this.isEasterSunday(today)) {
        this.triggerEasterEggConfetti()
        this.markAsShown(month, day)
      }
      // Año Nuevo (1 de enero)
      else if (month === 1 && day === 1) {
        this.triggerNewYearConfetti()
        this.markAsShown(month, day)
      }
      // Nochevieja (31 de diciembre)
      else if (month === 12 && day === 31) {
        this.triggerNewYearEveConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Mujer (8 de marzo)
      else if (month === 3 && day === 8) {
        this.triggerWomensDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Trabajador (1 de mayo)
      else if (month === 5 && day === 1) {
        this.triggerWorkersDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Niño (tercer domingo de julio - simplificado 16-22 julio)
      else if (month === 7 && day >= 16 && day <= 22) {
        const dayOfWeek = new Date().getDay()
        if (dayOfWeek === 0) {
          // domingo
          this.triggerChildrensDayConfetti()
          this.markAsShown(month, day)
        }
      }
      // Día del Maestro (15 de septiembre)
      else if (month === 9 && day === 15) {
        this.triggerTeachersDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Profesor Universitario (15 de noviembre)
      else if (month === 11 && day === 15) {
        this.triggerProfessorsDayConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Independencia Venezuela (5 de julio)
      else if (month === 7 && day === 5) {
        this.triggerVenezuelaIndependenceConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Resistencia Indígena (12 de octubre)
      else if (month === 10 && day === 12) {
        this.triggerIndigenousDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Libro (23 de abril)
      else if (month === 4 && day === 23) {
        this.triggerBookDayConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Tierra (22 de abril)
      else if (month === 4 && day === 22) {
        this.triggerEarthDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Artista (21 de abril)
      else if (month === 4 && day === 21) {
        this.triggerArtistDayConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Música (21 de junio)
      else if (month === 6 && day === 21) {
        this.triggerMusicDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Café (29 de septiembre)
      else if (month === 9 && day === 29) {
        this.triggerCoffeeDayConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Pizza (9 de febrero)
      else if (month === 2 && day === 9) {
        this.triggerPizzaDayConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Fotografía (19 de agosto)
      else if (month === 8 && day === 19) {
        this.triggerPhotographyDayConfetti()
        this.markAsShown(month, day)
      }
      // Día de la Madre (segundo domingo de mayo - simplificado 8-14 mayo)
      else if (month === 5 && day >= 8 && day <= 14) {
        const dayOfWeek = new Date().getDay()
        if (dayOfWeek === 0) {
          // domingo
          this.triggerMothersDayConfetti()
          this.markAsShown(month, day)
        }
      }
      // Día del Padre (tercer domingo de junio - simplificado 15-21 junio)
      else if (month === 6 && day >= 15 && day <= 21) {
        const dayOfWeek = new Date().getDay()
        if (dayOfWeek === 0) {
          // domingo
          this.triggerFathersDayConfetti()
          this.markAsShown(month, day)
        }
      }
      // Día del Amor y Amistad (14 de febrero)
      else if (month === 2 && day === 14) {
        this.triggerLoveFriendshipConfetti()
        this.markAsShown(month, day)
      }
      // Día del Gamer (29 de agosto)
      else if (month === 8 && day === 29) {
        this.triggerGamerDayConfetti()
        this.markAsShown(month, day)
      }
      // Día del Programador (13 de septiembre o día 256)
      else if ((month === 9 && day === 13) || (month === 9 && day === 13)) {
        this.triggerProgrammerDayConfetti()
        this.markAsShown(month, day)
      }
    }
  }

  /**
   * Simplificación: Carnaval en fechas típicas (febrero-marzo)
   */
  isCarnaval(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    // Fechas típicas de carnaval (simplificado)
    return (month === 2 && day >= 10 && day <= 20) || (month === 3 && day >= 1 && day <= 10)
  }

  /**
   * Simplificación: Semana Santa (marzo-abril, Domingo de Ramos)
   */
  isSemanaSanta(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = date.getDay() // 0 = domingo, 6 = sábado
    // Simplificado: Domingo de Ramos entre 20 marzo y 25 abril
    return (
      ((month === 3 && day >= 20 && day <= 31) || (month === 4 && day >= 1 && day <= 25)) &&
      dayOfWeek === 0
    )
  }

  /**
   * Simplificación: Día de Pascua (primer domingo de luna llena después de equinoccio)
   */
  isEasterSunday(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = date.getDay()
    // Simplificado: Entre 22 marzo y 25 abril, debe ser domingo
    return (
      ((month === 3 && day >= 22 && day <= 31) || (month === 4 && day >= 1 && day <= 25)) &&
      dayOfWeek === 0
    )
  }

  /**
   * Marcar que ya se mostró hoy
   */
  markAsShown(month, day) {
    localStorage.setItem(`confetti_shown_${month}_${day}`, 'true')
    this.hasShownToday = true
  }

  /**
   * Confeti de Carnaval - colores festivos y brillantes
   */
  triggerCarnavalConfetti() {
    const colors = ['#FF1744', '#F50057', '#D500F9', '#651FFF', '#00E676', '#FFEA00', '#FF6D00']
    this.createConfetti(colors, 'carnaval', 100)
    this.showMessage('🎭 ¡Feliz Carnaval! 🎉')
  }

  /**
   * Confeti de Navidad - rojo, verde, dorado y plata
   */
  triggerChristmasConfetti() {
    const colors = ['#FF0000', '#00FF00', '#FFD700', '#C0C0C0', '#FF6B6B', '#4ECDC4']
    this.createConfetti(colors, 'christmas', 80)
    // Agregar nieve adicional
    this.createSnowEffect()
    this.showMessage('🎄 ¡Feliz Navidad! ❄️')
  }

  /**
   * Confeti de Día de los Muertos - colores mexicanos y máscaras
   */
  triggerDiaMuertosConfetti() {
    const colors = ['#FF6B35', '#F7931E', '#FDD835', '#8BC34A', '#2196F3', '#9C27B0']
    this.createConfetti(colors, 'diamuertos', 120)
    // Agregar máscaras y flores de cempasúchil
    this.createDiaMuertosSpecials()
    this.showMessage('🌼 ¡Día de los Muertos! 🕯️')
  }

  /**
   * Confeti de Halloween - naranja, negro, morado
   */
  triggerHalloweenConfetti() {
    const colors = ['#FF6600', '#000000', '#800080', '#FF8C00', '#4B0082', '#FF4500']
    this.createConfetti(colors, 'halloween', 90)
    // Agregar elementos especiales de Halloween
    this.createHalloweenSpecials()
    this.showMessage('🎃 ¡Feliz Halloween! 👻')
  }

  /**
   * Confeti de Pétalos de Flores - manual con Ctrl+Alt+F
   */
  triggerPetalConfetti() {
    const petalColors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#DB7093', '#FF00FF']
    this.createConfetti(petalColors, 'petals', 60)
    this.showMessage('🌸 ¡Pétalos de flores! 🌺')
  }

  /**
   * Confeti de Semana Santa - colores púrpura y dorado
   */
  triggerSemanaSantaConfetti() {
    const colors = ['#6B46C1', '#9333EA', '#FCD34D', '#F59E0B', '#4C1D95', '#78350F']
    this.createConfetti(colors, 'semanasanta', 100)
    this.createSemanaSantaSpecials()
    this.showMessage('✝️ ¡Feliz Semana Santa! 🙏')
  }

  /**
   * Confeti del Día del Huevo de Pascua - huevos de colores
   */
  triggerEasterEggConfetti() {
    const colors = ['#FF69B4', '#87CEEB', '#98FB98', '#FFB6C1', '#F0E68C', '#DDA0DD', '#F5DEB3']
    this.createConfetti(colors, 'easter', 120)
    this.createEasterEggSpecials()
    this.showMessage('🥳 ¡Feliz Día del Huevo de Pascua! 🐰')
  }

  /**
   * Confeti de Año Nuevo - dorado y plateado con fuegos artificiales
   */
  triggerNewYearConfetti() {
    const colors = ['#FFD700', '#C0C0C0', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    this.createConfetti(colors, 'newyear', 150)
    this.createFireworksEffect()
    this.showMessage('🎊 ¡Feliz Año Nuevo! 🥂')
  }

  /**
   * Confeti de Nochevieja - cuenta regresiva
   */
  triggerNewYearEveConfetti() {
    const colors = ['#FFD700', '#000080', '#C0C0C0', '#FF4500', '#4169E1']
    this.createConfetti(colors, 'newyeareve', 130)
    this.showMessage('⏰ ¡Cuenta Regresiva para Año Nuevo! 🎆')
  }

  /**
   * Confeti del Día de la Mujer - rosados y violetas
   */
  triggerWomensDayConfetti() {
    const colors = ['#FF69B4', '#DDA0DD', '#9370DB', '#FFB6C1', '#FF1493', '#8B008B']
    this.createConfetti(colors, 'womensday', 100)
    this.createWomensDaySpecials()
    this.showMessage('💪 ¡Feliz Día de la Mujer! 👩')
  }

  /**
   * Confeti del Día del Trabajador - colores profesionales
   */
  triggerWorkersDayConfetti() {
    const colors = ['#4169E1', '#FF6347', '#32CD32', '#FFD700', '#8B4513', '#708090']
    this.createConfetti(colors, 'workersday', 110)
    this.createWorkersDaySpecials()
    this.showMessage('🛠️ ¡Feliz Día del Trabajador! 💪')
  }

  /**
   * Confeti del Día del Niño - colores alegres y juguetes
   */
  triggerChildrensDayConfetti() {
    const colors = ['#FF69B4', '#00CED1', '#FFD700', '#FF6347', '#32CD32', '#9370DB']
    this.createConfetti(colors, 'childrenday', 120)
    this.createChildrensDaySpecials()
    this.showMessage('🎈 ¡Feliz Día del Niño! 🧸')
  }

  /**
   * Confeti del Día del Maestro - colores educativos
   */
  triggerTeachersDayConfetti() {
    const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#8B008B', '#FF69B4']
    this.createConfetti(colors, 'teachersday', 100)
    this.createTeachersDaySpecials()
    this.showMessage('📚 ¡Feliz Día del Maestro! 🍎')
  }

  /**
   * Confeti del Día del Profesor Universitario - académico
   */
  triggerProfessorsDayConfetti() {
    const colors = ['#000080', '#4169E1', '#FFD700', '#8B4513', '#2F4F4F', '#B8860B']
    this.createConfetti(colors, 'professorsday', 95)
    this.createProfessorsDaySpecials()
    this.showMessage('🎓 ¡Feliz Día del Profesor Universitario! 📖')
  }

  /**
   * Confeti de la Independencia Venezuela - amarillo, azul, rojo
   */
  triggerVenezuelaIndependenceConfetti() {
    const colors = ['#FFD700', '#003087', '#CF142B', '#FFFFFF', '#00853F']
    this.createConfetti(colors, 'venezuelaindep', 130)
    this.createVenezuelaSpecials()
    this.showMessage('🇻🇪 ¡Feliz Día de la Independencia! 🦜')
  }

  /**
   * Confeti del Día de la Resistencia Indígena - colores tierra
   */
  triggerIndigenousDayConfetti() {
    const colors = ['#8B4513', '#D2691E', '#DEB887', '#F4A460', '#CD853F', '#A0522D']
    this.createConfetti(colors, 'indigenousday', 100)
    this.createIndigenousSpecials()
    this.showMessage('🌍 ¡Día de la Resistencia Indígena! 🏹')
  }

  /**
   * Confeti del Día del Libro - colores de libros
   */
  triggerBookDayConfetti() {
    const colors = ['#8B4513', '#FFD700', '#FF6347', '#4169E1', '#2F4F4F', '#F0E68C']
    this.createConfetti(colors, 'bookday', 90)
    this.createBookSpecials()
    this.showMessage('📖 ¡Feliz Día del Libro! 📚')
  }

  /**
   * Confeti del Día de la Tierra - verdes y azules
   */
  triggerEarthDayConfetti() {
    const colors = ['#228B22', '#32CD32', '#006400', '#4169E1', '#00CED1', '#2E8B57']
    this.createConfetti(colors, 'earthday', 100)
    this.createEarthSpecials()
    this.showMessage('🌍 ¡Feliz Día de la Tierra! 🌱')
  }

  /**
   * Confeti del Día del Artista - paleta de colores
   */
  triggerArtistDayConfetti() {
    const colors = ['#FF6347', '#FFD700', '#4169E1', '#32CD32', '#FF69B4', '#8B008B', '#FF4500']
    this.createConfetti(colors, 'artistday', 110)
    this.createArtistSpecials()
    this.showMessage('🎨 ¡Feliz Día del Artista! 🖌️')
  }

  /**
   * Confeti del Día de la Música - notas musicales
   */
  triggerMusicDayConfetti() {
    const colors = ['#FF69B4', '#4169E1', '#FFD700', '#32CD32', '#FF6347', '#9370DB']
    this.createConfetti(colors, 'musicday', 100)
    this.createMusicSpecials()
    this.showMessage('🎵 ¡Feliz Día de la Música! 🎶')
  }

  /**
   * Confeti del Día del Café - marrones
   */
  triggerCoffeeDayConfetti() {
    const colors = ['#8B4513', '#D2691E', '#A0522D', '#CD853F', '#F4A460', '#704214']
    this.createConfetti(colors, 'coffeeday', 90)
    this.createCoffeeSpecials()
    this.showMessage('☕ ¡Feliz Día del Café! 🌱')
  }

  /**
   * Confeti del Día de la Pizza - triangular
   */
  triggerPizzaDayConfetti() {
    const colors = ['#FF6347', '#FFD700', '#8B4513', '#FF8C00', '#FF4500', '#FFA500']
    this.createConfetti(colors, 'pizzaday', 100)
    this.createPizzaSpecials()
    this.showMessage('🍕 ¡Feliz Día de la Pizza! 🧀')
  }

  /**
   * Confeti del Día de la Fotografía - flash
   */
  triggerPhotographyDayConfetti() {
    const colors = ['#000000', '#FFFFFF', '#C0C0C0', '#FFD700', '#4169E1', '#FF6347']
    this.createConfetti(colors, 'photographyday', 85)
    this.createPhotographySpecials()
    this.showMessage('📸 ¡Feliz Día de la Fotografía! 📷')
  }

  /**
   * Confeti del Día de la Madre - rosados y corazones
   */
  triggerMothersDayConfetti() {
    const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#DDA0DD', '#C71585', '#FF00FF']
    this.createConfetti(colors, 'mothersday', 130)
    this.createMothersDaySpecials()
    this.showMessage('💖 ¡Feliz Día Mamá! 🌹')
  }

  /**
   * Confeti del Día del Padre - azules y masculinos
   */
  triggerFathersDayConfetti() {
    const colors = ['#4169E1', '#000080', '#4682B4', '#1E90FF', '#0000CD', '#B0C4DE']
    this.createConfetti(colors, 'fathersday', 120)
    this.createFathersDaySpecials()
    this.showMessage('💙 ¡Feliz Día Papá! 🎁')
  }

  /**
   * Confeti del Día del Amor y Amistad - corazones y flores
   */
  triggerLoveFriendshipConfetti() {
    const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FF69B4', '#C71585', '#FF00FF']
    this.createConfetti(colors, 'lovefriendship', 120)
    this.createLoveFriendshipSpecials()
    this.showMessage('💕 ¡Feliz Día del Amor y Amistad! 💝')
  }

  /**
   * Confeti del Día del Gamer - pixels y game over
   */
  triggerGamerDayConfetti() {
    const colors = ['#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
    this.createConfetti(colors, 'gamerday', 100)
    this.createGamerSpecials()
    this.showMessage('🎮 ¡Feliz Día del Gamer! 🕹️')
  }

  /**
   * Confeti del Día del Programador - código binario
   */
  triggerProgrammerDayConfetti() {
    const colors = ['#000000', '#00FF00', '#000080', '#C0C0C0', '#FF6347', '#4169E1']
    this.createConfetti(colors, 'programmerday', 90)
    this.createProgrammerSpecials()
    this.showMessage('💻 ¡Feliz Día del Programador! 👨‍💻')
  }

  /**
   * Crear confeti genérico
   */
  createConfetti(colors, type, count = 50) {
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div')
      confetti.className = `festive-confetti ${type}`

      const size = this.getRandomSize(type)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const shape = this.getShape(type)

      confetti.style.cssText = `
        position: fixed;
        width: ${size.width}px;
        height: ${size.height}px;
        background: ${color};
        left: ${Math.random() * 100}%;
        top: -20px;
        z-index: 9999;
        pointer-events: none;
        ${shape}
        animation: fall ${2 + Math.random() * 3}s linear;
      `

      document.body.appendChild(confetti)

      // Limpiar después de la animación
      setTimeout(() => {
        confetti.remove()
      }, 5000)
    }
  }

  /**
   * Obtener tamaño según tipo de confeti
   */
  getRandomSize(type) {
    switch (type) {
      case 'petals':
        return { width: 15, height: 20 }
      case 'christmas':
        return { width: 8, height: 8 }
      case 'diamuertos':
        return { width: 12, height: 12 }
      case 'halloween':
        return { width: 10, height: 10 }
      case 'carnaval':
        return { width: 15, height: 15 }
      case 'semanasanta':
        return { width: 18, height: 25 }
      case 'easter':
        return { width: 16, height: 20 }
      case 'newyear':
        return { width: 12, height: 12 }
      case 'newyeareve':
        return { width: 14, height: 14 }
      case 'womensday':
        return { width: 16, height: 18 }
      case 'workersday':
        return { width: 12, height: 12 }
      case 'childrenday':
        return { width: 18, height: 18 }
      case 'teachersday':
        return { width: 14, height: 16 }
      case 'professorsday':
        return { width: 13, height: 15 }
      case 'venezuelaindep':
        return { width: 15, height: 10 }
      case 'indigenousday':
        return { width: 14, height: 14 }
      case 'bookday':
        return { width: 12, height: 16 }
      case 'earthday':
        return { width: 13, height: 13 }
      case 'artistday':
        return { width: 16, height: 16 }
      case 'musicday':
        return { width: 12, height: 18 }
      case 'coffeeday':
        return { width: 11, height: 15 }
      case 'pizzaday':
        return { width: 14, height: 14 }
      case 'photographyday':
        return { width: 10, height: 12 }
      case 'lovefriendship':
        return { width: 15, height: 13 }
      case 'gamerday':
        return { width: 8, height: 8 }
      case 'programmerday':
        return { width: 10, height: 12 }
      case 'mothersday':
        return { width: 17, height: 15 }
      case 'fathersday':
        return { width: 15, height: 13 }
      default:
        return { width: 10, height: 10 }
    }
  }

  /**
   * Obtener forma según tipo
   */
  getShape(type) {
    switch (type) {
      case 'petals':
        return 'border-radius: 50% 0 50% 0; transform: rotate(45deg);'
      case 'christmas':
        return 'border-radius: 50%;'
      case 'diamuertos':
        return 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);'
      case 'halloween':
        return 'clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);'
      case 'carnaval':
        return Math.random() > 0.5 ? 'border-radius: 50%;' : 'transform: rotate(45deg);'
      case 'semanasanta':
        return 'border-radius: 50% 50% 0 0; transform: rotate(45deg);'
      case 'easter':
        return 'border-radius: 50% 50% 50% 0; transform: rotate(135deg);'
      case 'newyear':
        return 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);'
      case 'newyeareve':
        return 'border-radius: 50% 50% 50% 50%; box-shadow: 0 0 10px rgba(255,215,0,0.8);'
      case 'womensday':
        return 'border-radius: 50% 50% 20% 50%; transform: rotate(-45deg);'
      case 'workersday':
        return 'border-radius: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);'
      case 'childrenday':
        return 'border-radius: 50%;'
      case 'teachersday':
        return 'clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);'
      case 'professorsday':
        return 'border-radius: 2px 15px 2px 15px;'
      case 'venezuelaindep':
        return 'clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);'
      case 'indigenousday':
        return 'border-radius: 50% 20% 50% 20%;'
      case 'bookday':
        return 'border-radius: 2px; box-shadow: 0 2px 4px rgba(139,69,19,0.3);'
      case 'earthday':
        return 'border-radius: 50%; box-shadow: 0 0 5px rgba(34,139,34,0.4);'
      case 'artistday':
        return 'transform: rotate(45deg);'
      case 'musicday':
        return 'clip-path: ellipse(50% 30% at 50% 50%);'
      case 'coffeeday':
        return 'border-radius: 50% 50% 0 0;'
      case 'pizzaday':
        return 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);'
      case 'photographyday':
        return 'box-shadow: 0 0 8px rgba(255,255,255,0.8);'
      case 'lovefriendship':
        return 'border-radius: 50% 50% 50% 0; transform: rotate(45deg);'
      case 'gamerday':
        return 'border-radius: 0; box-shadow: 0 0 3px rgba(0,255,0,0.5);'
      case 'programmerday':
        return 'font-family: monospace; font-weight: bold; color: #00ff00; background: #000;'
      case 'mothersday':
        return 'border-radius: 50% 50% 0 0; transform: rotate(135deg);'
      case 'fathersday':
        return 'border-radius: 50% 50% 0 0; transform: rotate(45deg);'
      default:
        return 'border-radius: 2px;'
    }
  }

  /**
   * Efecto de nieve para Navidad
   */
  createSnowEffect() {
    for (let i = 0; i < 30; i++) {
      const snow = document.createElement('div')
      snow.className = 'festive-snow'
      snow.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: -10px;
        z-index: 9998;
        pointer-events: none;
        opacity: 0.8;
        animation: snow ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(snow)

      setTimeout(() => snow.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de los Muertos
   */
  createDiaMuertosSpecials() {
    // Máscaras de calavera
    for (let i = 0; i < 10; i++) {
      const mask = document.createElement('div')
      mask.innerHTML = '💀'
      mask.className = 'festive-special'
      mask.style.cssText = `
        position: fixed;
        font-size: 30px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(mask)
      setTimeout(() => mask.remove(), 7000)
    }

    // Flores de cempasúchil
    for (let i = 0; i < 15; i++) {
      const flower = document.createElement('div')
      flower.innerHTML = '🌼'
      flower.className = 'festive-special'
      flower.style.cssText = `
        position: fixed;
        font-size: 25px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(flower)
      setTimeout(() => flower.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Halloween
   */
  createHalloweenSpecials() {
    const specials = ['🎃', '👻', '🦇', '🕷️', '🕸️']
    for (let i = 0; i < 12; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 28px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Semana Santa
   */
  createSemanaSantaSpecials() {
    const specials = ['✝️', '🙏', '🕊️', '⚜️']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 24px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de Pascua
   */
  createEasterEggSpecials() {
    // Huevos de Pascua
    for (let i = 0; i < 15; i++) {
      const egg = document.createElement('div')
      egg.innerHTML = '🥚'
      egg.className = 'festive-special'
      egg.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(egg)
      setTimeout(() => egg.remove(), 7000)
    }

    // Conejos de Pascua
    for (let i = 0; i < 5; i++) {
      const bunny = document.createElement('div')
      bunny.innerHTML = '🐰'
      bunny.className = 'festive-special'
      bunny.style.cssText = `
        position: fixed;
        font-size: 25px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(bunny)
      setTimeout(() => bunny.remove(), 7000)
    }
  }

  /**
   * Efecto de fuegos artificiales para Año Nuevo
   */
  createFireworksEffect() {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight * 0.5

        for (let j = 0; j < 8; j++) {
          const spark = document.createElement('div')
          spark.className = 'firework-spark'
          spark.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 4)]};
            left: ${x}px;
            top: ${y}px;
            z-index: 9998;
            pointer-events: none;
            border-radius: 50%;
            animation: explode 1s ease-out forwards;
          `
          document.body.appendChild(spark)
          setTimeout(() => spark.remove(), 1000)
        }
      }, i * 200)
    }

    // Agregar animación de explosión al CSS
    if (!document.querySelector('#firework-style')) {
      const fireworkStyle = document.createElement('style')
      fireworkStyle.id = 'firework-style'
      fireworkStyle.textContent = `
        @keyframes explode {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0); opacity: 0; }
        }
      `
      document.head.appendChild(fireworkStyle)
    }
  }

  /**
   * Elementos especiales para Día de la Mujer
   */
  createWomensDaySpecials() {
    const specials = ['👩', '💪', '💖', '🌸', '⭐', '🎯']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Trabajador
   */
  createWorkersDaySpecials() {
    const specials = ['🛠️', '⚙️', '💼', '🏗️', '⚡', '🔧']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Niño
   */
  createChildrensDaySpecials() {
    const specials = ['🎈', '🧸', '🎨', '🎭', '🎪', '🚀', '🌈']
    for (let i = 0; i < 12; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 24px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Maestro
   */
  createTeachersDaySpecials() {
    const specials = ['📚', '🍎', '✏️', '📝', '📐', '🎓']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Profesor Universitario
   */
  createProfessorsDaySpecials() {
    const specials = ['🎓', '📖', '🔬', '💡', '🏛️', '📜']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Venezuela
   */
  createVenezuelaSpecials() {
    const specials = ['🇻🇪', '🦜', '🌺', '⚽', '🏔️']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 24px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día Indígena
   */
  createIndigenousSpecials() {
    const specials = ['🏹', '🌽', '🪶', '🪘', '🦜', '🌿']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Libro
   */
  createBookSpecials() {
    const specials = ['📚', '📖', '📝', '📜', '✒️', '🖋️']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de la Tierra
   */
  createEarthSpecials() {
    const specials = ['🌍', '🌱', '🌿', '🌳', '♻️', '💧']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Artista
   */
  createArtistSpecials() {
    const specials = ['🎨', '🖌️', '🎭', '🎪', '🖼️', '✨']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de la Música
   */
  createMusicSpecials() {
    const specials = ['🎵', '🎶', '🎤', '🎸', '🎹', '🥁']
    for (let i = 0; i < 12; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Café
   */
  createCoffeeSpecials() {
    const specials = ['☕', '🌱', '☘️', '🍃', '💤', '⚡']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de la Pizza
   */
  createPizzaSpecials() {
    const specials = ['🍕', '🧀', '🍅', '🌶️', '🥗', '🍴']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de la Fotografía
   */
  createPhotographySpecials() {
    const specials = ['📸', '📷', '🖼️', '💡', '⚡', '✨']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Amor y Amistad
   */
  createLoveFriendshipSpecials() {
    const specials = ['💕', '💖', '💝', '💘', '💗', '💞']
    for (let i = 0; i < 12; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Gamer
   */
  createGamerSpecials() {
    const specials = ['🎮', '🕹️', '👾', '🎯', '🏆', '⚔️']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Programador
   */
  createProgrammerSpecials() {
    const specials = ['💻', '⌨️', '🖱️', '👨‍💻', '👩‍💻', '⚡']
    for (let i = 0; i < 8; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 20px;
        left: ${Math.random() * 100}%;
        top: -35px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${4 + Math.random() * 3}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día de la Madre
   */
  createMothersDaySpecials() {
    const specials = ['💖', '🌹', '🌺', '💐', '🎁', '🦋']
    for (let i = 0; i < 12; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 24px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Elementos especiales para Día del Padre
   */
  createFathersDaySpecials() {
    const specials = ['💙', '🎁', '🏆', '⚽', '🎣', '👨‍👩‍👧‍👦']
    for (let i = 0; i < 10; i++) {
      const special = document.createElement('div')
      special.innerHTML = specials[Math.floor(Math.random() * specials.length)]
      special.className = 'festive-special'
      special.style.cssText = `
        position: fixed;
        font-size: 22px;
        left: ${Math.random() * 100}%;
        top: -40px;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${3 + Math.random() * 4}s linear;
      `
      document.body.appendChild(special)
      setTimeout(() => special.remove(), 7000)
    }
  }

  /**
   * Mostrar mensaje especial
   */
  showMessage(message) {
    const toast = document.createElement('div')
    toast.className = 'festive-toast'
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      animation: slideDown 0.5s ease-out;
    `

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.animation = 'slideUp 0.5s ease-out'
      setTimeout(() => toast.remove(), 500)
    }, 3000)
  }
}

// Agregar CSS para animaciones
const style = document.createElement('style')
style.textContent = `
  @keyframes fall {
    to {
      transform: translateY(calc(100vh + 100px)) rotate(360deg);
    }
  }

  @keyframes snow {
    to {
      transform: translateY(calc(100vh + 100px)) translateX(50px);
    }
  }

  @keyframes slideDown {
    from {
      transform: translate(-50%, -100px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translate(-50%, 0);
      opacity: 1;
    }
    to {
      transform: translate(-50%, -100px);
      opacity: 0;
    }
  }

  .festive-confetti {
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .festive-special {
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
  }
`
document.head.appendChild(style)

// Exportar para uso global
window.festiveConfetti = new FestiveConfetti()
export default FestiveConfetti

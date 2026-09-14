document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. NAVBAR SCROLL & MOBILE DRAWER
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // ==========================================================================
  // 2. SCROLLSPY (DESTAQUE AUTOMÁTICO DO MENU AO ROLAR A PÁGINA)
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active-nav');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active-nav');
      }
    });
  });

  // ==========================================================================
  // 3. ANIMAÇÃO DE PARALLAX COM O MOUSE NO HERO
  // ==========================================================================
  const heroSection = document.getElementById('hero');
  const heroImage = document.querySelector('.robot-hero-img');
  const heroTitle = document.querySelector('.hero-title');

  if (heroSection && heroImage) {
    heroSection.addEventListener('mousemove', (e) => {
      // Checa se o usuário prefere movimentos reduzidos
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calcula o deslocamento suave do centro (-1 a 1)
      const offsetX = (clientX - innerWidth / 2) / (innerWidth / 2);
      const offsetY = (clientY - innerHeight / 2) / (innerHeight / 2);

      // Aplica rotação e translação sutil no elemento visual
      heroImage.style.transform = `translate3d(${offsetX * 15}px, ${offsetY * 15}px, 0) rotateX(${-offsetY * 5}deg) rotateY(${offsetX * 5}deg)`;
      
      if (heroTitle) {
        heroTitle.style.transform = `translate3d(${offsetX * -6}px, ${offsetY * -6}px, 0)`;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      heroImage.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
      if (heroTitle) heroTitle.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  // ==========================================================================
  // 4. ANIMAÇÃO DE CONTADORES NUMÉRICOS NO HERO (COUNT-UP)
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-num');
  let countersAnimated = false;

  function animateCounters() {
    statNumbers.forEach(stat => {
      const rawText = stat.textContent.trim();
      const targetValue = parseInt(rawText, 10);
      const hasPercent = rawText.includes('%');
      let currentValue = 0;
      const duration = 1600; // 1.6s
      const increment = targetValue / (duration / 16);

      const updateCounter = () => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          stat.textContent = targetValue + (hasPercent ? '%' : '');
        } else {
          stat.textContent = Math.floor(currentValue) + (hasPercent ? '%' : '');
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    });
  }

  // Observador para disparar os contadores apenas quando visíveis na tela
  const heroStatsEl = document.querySelector('.hero-stats');
  if (heroStatsEl) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.5 });

    statsObserver.observe(heroStatsEl);
  }

  // ==========================================================================
  // 5. ANIMAÇÃO DE INCLINAÇÃO 3D NOS CARDS (TILT EFFECT NO HOVER)
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.bento-card, .component-card, .synergy-card, .sonar-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // Ângulo máximo de 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // ==========================================================================
  // 6. SIMULADOR DO SENSOR ULTRASSÔNICO HC-SR04 & RADAR VISUAL DINÂMICO
  // ==========================================================================
  const slider = document.getElementById('obstacleDistance');
  const distValue = document.getElementById('distValue');
  const statusBox = document.getElementById('sonarStatusBox');
  const statusText = document.getElementById('sonarStatusText');
  const radarDot = document.getElementById('radarObstacleDot');

  if (slider && distValue) {
    slider.addEventListener('input', (e) => {
      const dist = parseInt(e.target.value, 10);
      distValue.textContent = `${dist} cm`;

      // Atualiza a posição do ponto vermelho no gráfico do Radar (Coordenadas Polares no SVG)
      if (radarDot) {
        // Mapeia 5cm-150cm para o raio do radar (30px até 135px a partir do centro 170,170)
        const radius = 30 + ((dist - 5) / 145) * 105;
        const angleInDegrees = 45; // Ângulo constante do feixe visual
        const angleInRadians = (angleInDegrees * Math.PI) / 180;

        const newX = 170 + radius * Math.cos(angleInRadians);
        const newY = 170 - radius * Math.sin(angleInRadians);

        radarDot.setAttribute('cx', newX.toFixed(1));
        radarDot.setAttribute('cy', newY.toFixed(1));

        // Animação de pulso no ponto do obstáculo ao se aproximar
        if (dist <= 20) {
          radarDot.setAttribute('r', '9');
        } else {
          radarDot.setAttribute('r', '7');
        }
      }

      // Lógica do Limite de Segurança (20 cm)
      if (dist <= 20) {
        statusBox.classList.add('danger');
        statusText.textContent = 'Status: OBSTÁCULO DETECTADO - PARADA PREVENTIVA';
      } else {
        statusBox.classList.remove('danger');
        statusText.textContent = 'Status: CAMINHO LIVRE';
      }
    });
  }

  // ==========================================================================
  // 7. SIMULAÇÃO DE TRAJETÓRIA NO MAPA DA ESCOLA (PONTO A -> PONTO B)
  // ==========================================================================
  const btnSimulate = document.getElementById('btnSimulateRoute');
  const simulatedRobot = document.getElementById('simulatedRobot');
  let isSimulating = false;

  if (btnSimulate && simulatedRobot) {
    btnSimulate.addEventListener('click', () => {
      if (isSimulating) return;
      isSimulating = true;
      btnSimulate.disabled = true;
      btnSimulate.innerHTML = `
        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        EM DESLOCAMENTO...
      `;

      let progress = 0;
      // Coordenadas dos Pontos da Rota no SVG Map
      const startX = 140, startY = 160;
      const corner1X = 140, corner1Y = 200;
      const corner2X = 660, corner2Y = 200;
      const endX = 660, endY = 240;

      function stepAnimation() {
        progress += 0.005; // Velocidade do movimento

        let currentX, currentY;

        if (progress <= 0.25) {
          // Trecho 1: Saindo da Secretaria (Descendo)
          const t = progress / 0.25;
          currentX = startX;
          currentY = startY + (corner1Y - startY) * t;
        } else if (progress <= 0.8) {
          // Trecho 2: Percorrendo o Corredor Principal (Direita)
          const t = (progress - 0.25) / 0.55;
          currentX = corner1X + (corner2X - corner1X) * t;
          currentY = corner1Y;
        } else if (progress <= 1.0) {
          // Trecho 3: Entrando na Sala dos Professores (Descendo)
          const t = (progress - 0.8) / 0.2;
          currentX = corner2X;
          currentY = corner1Y + (endY - corner1Y) * t;
        } else {
          currentX = endX;
          currentY = endY;
        }

        simulatedRobot.setAttribute('transform', `translate(${currentX}, ${currentY})`);

        if (progress < 1.0) {
          requestAnimationFrame(stepAnimation);
        } else {
          // Fim do trajeto
          isSimulating = false;
          btnSimulate.disabled = false;
          btnSimulate.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            REINICIAR SIMULAÇÃO
          `;
        }
      }

      requestAnimationFrame(stepAnimation);
    });
  }

  // ==========================================================================
  // 8. ANIMAÇÃO DE REVELAÇÃO ESCALONADA AO ROLAR A PÁGINA (SCROLL REVEAL)
  // ==========================================================================
  const revealElements = document.querySelectorAll(
    '.bento-card, .component-card, .synergy-card, .timeline-item, .arch-box, .future-step-card, .sonar-card, .radar-hud-box, .nav-dashboard'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Adiciona um pequeno atraso em cascata para cards do mesmo grupo
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, (index % 4) * 80);

          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      el.classList.add('reveal-init');
      revealObserver.observe(el);
    });
  }

});

// ==========================================================================
// EFEITO HOVER LETRA POR LETRA (AUTOMÁTICO)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const hoverTextElements = document.querySelectorAll('.hover-text');

    hoverTextElements.forEach(el => {
        // Pega o texto mantendo quebras de linha e nós
        const nodes = Array.from(el.childNodes);
        el.innerHTML = ''; // Limpa para reconstruir

        nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const chars = text.split('');

                chars.forEach(char => {
                    const span = document.createElement('span');
                    span.classList.add('hover-char');
                    // Preserva os espaços
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    el.appendChild(span);
                });
            } else {
                // Se for outra tag (ex: <strong>), preserva a tag
                el.appendChild(node);
            }
        });
    });
});
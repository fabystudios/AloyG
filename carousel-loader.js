/**
 * Carousel Loader - Carga y ordena slides desde JSON
 * - Soporta posiciones fijas (position: 1, 2, 3, etc.)
 * - Posición 0 = ubicación aleatoria
 * - Performance optimizada: ordena en memoria antes de renderizar
 */

(function() {
  'use strict';

  // Función para mezclar array (Fisher-Yates shuffle)
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Función para ordenar slides según posición
  function sortSlides(slides) {
    // Separar slides con posición fija (position > 0) y aleatorios (position === 0)
    const fixedSlides = slides.filter(s => s.position > 0).sort((a, b) => a.position - b.position);
    const randomSlides = shuffleArray(slides.filter(s => s.position === 0));
    
    // Crear array resultante
    const result = [];
    const maxPosition = Math.max(slides.length, ...fixedSlides.map(s => s.position));
    
    let randomIndex = 0;
    
    // Llenar posiciones
    for (let i = 1; i <= maxPosition; i++) {
      const fixedSlide = fixedSlides.find(s => s.position === i);
      if (fixedSlide) {
        result.push(fixedSlide);
      } else if (randomIndex < randomSlides.length) {
        result.push(randomSlides[randomIndex++]);
      }
    }
    
    // Agregar slides aleatorios restantes
    while (randomIndex < randomSlides.length) {
      result.push(randomSlides[randomIndex++]);
    }
    
    return result;
  }

  // Función para precargar videos (inicia descarga anticipada)
  function preloadVideo(src) {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = src;
    video.load();
    return video;
  }

  // Función para generar HTML de un slide
  function generateSlideHTML(slide, isFirst, preloadIndex) {
    const activeClass = isFirst ? ' active' : '';
    const hasVideoAttr = slide.hasVideo ? ' data-has-video="true"' : '';
    // Los primeros 2 slides usan preload="auto", el resto "metadata" para ahorrar ancho de banda
    const preloadAttr = (preloadIndex < 2) ? 'auto' : 'metadata';
    
    let content = '';
    
    if (slide.hasVideo && slide.desktop.type === 'video') {
      content = `
        <a href="${slide.link}">
          <video src="${slide.desktop.src}" class="d-none d-md-block w-100" alt="${slide.id} escritorio" 
                 autoplay muted loop preload="${preloadAttr}" poster="${slide.desktop.poster}"></video>
          <video src="${slide.mobile.src}" class="d-block d-md-none w-100" alt="${slide.id} móvil" 
                 autoplay muted loop preload="${preloadAttr}" poster="${slide.mobile.poster}"></video>
        </a>`;
    } else {
      // Soporte para imágenes (si en el futuro las usas)
      content = `
        <a href="${slide.link}">
          <img src="${slide.desktop.src}" class="d-none d-md-block w-100" alt="${slide.id} escritorio" loading="${isFirst ? 'eager' : 'lazy'}">
          <img src="${slide.mobile.src}" class="d-block d-md-none w-100" alt="${slide.id} móvil" loading="${isFirst ? 'eager' : 'lazy'}">
        </a>`;
    }
    
    return `<div class="carousel-item${activeClass}"${hasVideoAttr}>${content}</div>`;
  }

  // Función principal de carga
  async function loadCarousel() {
    try {
      // Cargar JSON
      const response = await fetch('./carousel-slides.json');
      if (!response.ok) throw new Error('Error al cargar carousel-slides.json');
      
      const slides = await response.json();
      
      // Ordenar slides
      const sortedSlides = sortSlides(slides);
      
      // ⚡ OPTIMIZACIÓN: Precargar videos de los primeros 2 slides INMEDIATAMENTE
      // Esto inicia la descarga antes de generar el HTML completo
      const isMobile = window.innerWidth < 768;
      if (sortedSlides.length > 0 && sortedSlides[0].hasVideo) {
        preloadVideo(isMobile ? sortedSlides[0].mobile.src : sortedSlides[0].desktop.src);
      }
      if (sortedSlides.length > 1 && sortedSlides[1].hasVideo) {
        preloadVideo(isMobile ? sortedSlides[1].mobile.src : sortedSlides[1].desktop.src);
      }
      
      // Generar HTML
      const carouselInner = document.querySelector('#mainCarousel .carousel-inner');
      if (!carouselInner) {
        console.error('No se encontró #mainCarousel .carousel-inner');
        return;
      }
      
      // Limpiar contenido existente
      carouselInner.innerHTML = '';
      
      // Insertar slides
      sortedSlides.forEach((slide, index) => {
        carouselInner.innerHTML += generateSlideHTML(slide, index === 0, index);
      });
      
      // Actualizar indicadores si existen
      const indicators = document.querySelector('#mainCarousel .carousel-indicators');
      if (indicators && !indicators.classList.contains('d-none')) {
        indicators.innerHTML = '';
        sortedSlides.forEach((_, index) => {
          const activeClass = index === 0 ? ' class="active"' : '';
          indicators.innerHTML += `<button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="${index}"${activeClass}></button>`;
        });
      }
      
      // Inicializar carousel de Bootstrap si está disponible
      if (window.bootstrap && window.bootstrap.Carousel) {
        const carouselElement = document.getElementById('mainCarousel');
        if (carouselElement) {
          new window.bootstrap.Carousel(carouselElement);
        }
      }
      
      console.log(`✅ Carrusel cargado: ${sortedSlides.length} slides (${slides.filter(s => s.position > 0).length} fijos, ${slides.filter(s => s.position === 0).length} aleatorios)`);
      
    } catch (error) {
      console.error('❌ Error al cargar el carrusel:', error);
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCarousel);
  } else {
    loadCarousel();
  }

  // ============================================================
  // Manejo de videos del carrusel (preload y reproducción)
  // ============================================================
  function initCarouselVideoHandling() {
    const carousel = document.getElementById('mainCarousel');
    if (!carousel) return;
    
    const slides = Array.from(carousel.querySelectorAll('.carousel-item'));

    // Función para cargar y reproducir videos de un slide
    function loadAndPlayVideos(slide) {
      if (!slide.hasAttribute('data-has-video')) return;
      
      const videos = slide.querySelectorAll('video');
      videos.forEach(video => {
        if (video.readyState === 0) {
          video.load();
        }
        video.play().catch(() => {});
      });
    }

    // Función para pausar videos de un slide
    function pauseVideos(slide) {
      const videos = slide.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
      });
    }

    // Cargar videos del primer slide si tiene
    const activeSlide = carousel.querySelector('.carousel-item.active');
    if (activeSlide) loadAndPlayVideos(activeSlide);

    // Preload del segundo slide al inicio para evitar que el primer cambio se quede "esperando"
    if (slides.length > 1) {
      const initialImgs = Array.from(slides[1].querySelectorAll('img[loading="lazy"], img'));
      initialImgs.forEach(img => {
        try {
          const src = img.getAttribute('src');
          if (src) {
            const pre = new Image();
            pre.src = src;
            if (pre.decode) pre.decode().catch(() => { });
          }
        } catch (e) { }
      });
    }

    // Manejar cambios de slide para videos e imágenes
    carousel.addEventListener('slide.bs.carousel', function (event) {
      // Pausar videos del slide que se está dejando
      const currentSlide = slides[event.from];
      if (currentSlide) pauseVideos(currentSlide);
    });

    // Precargar la siguiente imagen y cargar videos DESPUÉS de que el slide haya terminado
    carousel.addEventListener('slid.bs.carousel', function (event) {
      try {
        if (!event || typeof event.to !== 'number') return;

        // Normalizar índice
        const currentIndex = ((event.to % slides.length) + slides.length) % slides.length;
        const currentSlide = slides[currentIndex];
        
        // Cargar y reproducir videos del slide activo
        if (currentSlide) loadAndPlayVideos(currentSlide);

        // Precargar siguiente slide
        const nextIndex = ((event.to + 1) % slides.length + slides.length) % slides.length;
        const nextSlide = slides[nextIndex];
        if (!nextSlide) return;

        // Preload seguro sin mutar atributos del DOM
        const images = Array.from(nextSlide.querySelectorAll('img[loading="lazy"], img'));
        images.forEach(img => {
          try {
            const src = img.getAttribute('src');
            if (src) {
              const pre = new Image();
              pre.src = src;
              if (pre.decode) pre.decode().catch(() => { });
            }
          } catch (e) {
            // ignorar errores de imagen individuales
          }
        });
      } catch (err) {
        console.error('Error al precargar imagen del carrusel:', err);
      }
    });
  }

  // Inicializar manejo de videos después de cargar las slides
  document.addEventListener('DOMContentLoaded', function() {
    // Esperar un momento para que el DOM del carrusel esté completamente cargado
    setTimeout(initCarouselVideoHandling, 100);
  });
})();

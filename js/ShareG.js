document.documentElement.classList.add('js');

const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const enlaces = document.querySelectorAll('.navbar nav a[href^="#"]');

// Menú móvil
const cerrarMenu = () => {
    navbar.classList.remove('abierto');
    menuToggle.setAttribute('aria-expanded', 'false');
};

menuToggle.addEventListener('click', () => {
    const abierto = navbar.classList.toggle('abierto');
    menuToggle.setAttribute('aria-expanded', String(abierto));
});

document.querySelectorAll('.navbar nav a').forEach(a => a.addEventListener('click', cerrarMenu));

// Modo oscuro
const raiz = document.documentElement;
const temaToggle = document.querySelector('.tema-toggle');

const etiquetarTema = () => {
    const oscuro = raiz.dataset.theme === 'dark';
    temaToggle.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro');
    temaToggle.setAttribute('aria-pressed', String(oscuro));
};

temaToggle.addEventListener('click', () => {
    raiz.dataset.theme = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tema', raiz.dataset.theme); } catch (e) {}
    etiquetarTema();
});

etiquetarTema();

// Sombra del navbar al desplazarse
// y botón para volver arriba
const btnSubir = document.querySelector('.btn-subir');

const alDesplazar = () => {
    navbar.classList.toggle('con-sombra', window.scrollY > 10);
    btnSubir.classList.toggle('visible', window.scrollY > 400);
};
window.addEventListener('scroll', alDesplazar, { passive: true });
alDesplazar();

btnSubir.addEventListener('click', () => window.scrollTo({ top: 0 }));

// Aparición suave al hacer scroll
const revelar = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revelar.observe(el));

// Enlace activo según la sección visible
const seccionActiva = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === `#${entry.target.id}`));
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach(s => seccionActiva.observe(s));

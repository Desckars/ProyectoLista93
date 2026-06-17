console.debug('navbar.js loaded');
const NAV_SUPABASE_URL = (typeof SUPABASE_URL !== 'undefined') ? SUPABASE_URL : 'https://lnqqmoflqbbgxstxlujy.supabase.co';
const NAV_SUPABASE_KEY = (typeof SUPABASE_KEY !== 'undefined') ? SUPABASE_KEY : 'sb_publishable_ehNfp-wrQtIqlDbtNesRww_iFNWR-H3';
const CALENDAR_FALLBACK_URL =
    'https://calendar.google.com/calendar/embed?wkst=1&ctz=America%2FMontevideo&src=ZGFlZGRhNjAwOWM0OGFjNGQyNTk2ZTc1YmI1MjgzZGRiM2YyNzRjODM4MjNlOWQyNmZjZmIwMzI0OTVlZDlhM0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23e67c73';

async function getCalendarUrl() {
    try {
        const res = await fetch(
            `${NAV_SUPABASE_URL}/rest/v1/calendario?id=eq.1&select=link`,
            {
                headers: {
                    apikey: NAV_SUPABASE_KEY,
                    Authorization: 'Bearer ' + NAV_SUPABASE_KEY
                }
            }
        );

        if (!res.ok) {
            console.error('Error fetching calendar URL:', res.status, await res.text());
            return CALENDAR_FALLBACK_URL;
        }

        const data = await res.json();
        return data.length && data[0].link ? data[0].link : CALENDAR_FALLBACK_URL;
    } catch (error) {
        console.error('Error fetching calendar URL:', error);
        return CALENDAR_FALLBACK_URL;
    }
}

class NavbarComponent extends HTMLElement {
    connectedCallback() {
        console.debug('custom-navbar connectedCallback');
        this.innerHTML = `
        <nav>
        
            <div class="nav-marca">
                <div class="nav-logo-wrapper">
                    <img class="nav-logo-fondo" src="Imagenes/logo_fondo.png" alt="Logo fondo">
                    <img class="nav-logo-93" src="Imagenes/logo_93.png" alt="93">
                </div>
                
                <div class="nav-marca-texto">
                    <span class="nav-nombre">Vanguardia del Ceibo</span>
                    <span class="nav-sub">Maldonado — Uruguay</span>
                </div>
            </div>

            <button class="hamburguesa" id="hamburguesa">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul class="nav-links">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="conocenos.html">Conocénos</a></li>
                <li><a href="que_hacemos.html">Qué Hacemos</a></li>

                <li>
                    <a href="#" onclick="abrirCalendario(); return false;">
                        Calendario
                    </a>
                </li>
            </ul>

            <div class="menu-lateral" id="menuLateral">

                <button class="cerrar-menu" id="cerrarMenu">
                    ✕
                </button>

                <a href="index.html">Inicio</a>
                <a href="conocenos.html">Conócenos</a>
                <a href="que_hacemos.html">Qué Hacemos</a>

                <a href="#"
                onclick="abrirCalendario(); return false;">
                    Calendario
                </a>

            </div>

            <div class="overlay-menu" id="overlayMenu"></div>
        </nav>

        <!-- MODAL CALENDARIO -->
        <div id="calendarModal" class="calendar-modal">

            <div class="calendar-modal-content">

                <div class="calendar-topbar">
                    <h2>Calendario de Actividades</h2>

                    <button
                        class="calendar-close"
                        onclick="cerrarCalendario()">
                        ✕
                    </button>
                </div>

                <iframe
                    src="${CALENDAR_FALLBACK_URL}"
                    loading="lazy">
                </iframe>

            </div>

        </div>
        `;

        // Update iframe src asynchronously when Supabase responds.
        getCalendarUrl().then((url) => {
            try {
                const iframe = this.querySelector('iframe');
                if (iframe && url) iframe.src = url;
            } catch (e) {
                console.error('Failed to update calendar iframe:', e);
            }
        }).catch((e) => console.error('Error getting calendar URL:', e));

        const hamburguesa = this.querySelector('#hamburguesa');
        const menuLateral = this.querySelector('#menuLateral');
        const cerrarMenu = this.querySelector('#cerrarMenu');
        const overlayMenu = this.querySelector('#overlayMenu');

        hamburguesa?.addEventListener('click', () => {
            menuLateral.classList.add('abierto');
            overlayMenu.classList.add('activo');
        });

        cerrarMenu?.addEventListener('click', () => {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
        });

        overlayMenu?.addEventListener('click', () => {
            menuLateral.classList.remove('abierto');
            overlayMenu.classList.remove('activo');
        });
    }
}

if (!customElements.get('custom-navbar')) {
    customElements.define('custom-navbar', NavbarComponent);
} else {
    console.debug('custom-navbar already defined');
}

window.abrirCalendario = function () {
    document
        .getElementById("calendarModal")
        .classList.add("active");
};

window.cerrarCalendario = function () {
    document
        .getElementById("calendarModal")
        .classList.remove("active");
};

window.addEventListener("click", (e) => {
    const modal = document.getElementById("calendarModal");

    if (e.target === modal) {
        cerrarCalendario();
    }
});
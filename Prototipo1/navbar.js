const CALENDAR_URL =
"https://calendar.google.com/calendar/embed?wkst=1&ctz=America%2FMontevideo&src=ZGFlZGRhNjAwOWM0OGFjNGQyNTk2ZTc1YmI1MjgzZGRiM2YyNzRjODM4MjNlOWQyNmZjZmIwMzI0OTVlZDlhM0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23e67c73";

class NavbarComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <nav>
        
            <div class="nav-marca">
                <img src="Imagenes/logo.jpeg" alt="Logo">
                <div class="nav-marca-texto">
                    <span class="nav-nombre">Vanguardia del Ceibo</span>
                    <span class="nav-sub">Maldonado — Uruguay</span>
                </div>
            </div>

            <ul class="nav-links">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="conocenos.html">Conócenos</a></li>
                <li><a href="que_hacemos.html">Qué Hacemos</a></li>

                <li>
                    <a href="#" onclick="abrirCalendario(); return false;">
                        Calendario
                    </a>
                </li>
            </ul>
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
                    src="${CALENDAR_URL}"
                    loading="lazy">
                </iframe>

            </div>

        </div>
        `;
    }
}

customElements.define('custom-navbar', NavbarComponent);

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
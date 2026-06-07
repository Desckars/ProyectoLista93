class NavbarComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <nav>
            <a href="index.html" class="nav-marca">
                <img src="Imagenes/logo.jpeg" alt="Logo">
                <div class="nav-marca-texto">
                    <span class="nav-nombre">Vanguardia del Ceibo</span>
                    <span class="nav-sub">Maldonado &mdash; Uruguay</span>
                </div>
            </a>
            <ul class="nav-links">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="conocenos.html">Conócenos</a></li>
                <li><a href="que_hacemos.html">Qué Hacemos</a></li>
                <li><a href="Calendar.html">Calendario</a></li>
            </ul>
        </nav>
        `;
    }
}

customElements.define('custom-navbar', NavbarComponent);
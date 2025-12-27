#!/bin/bash

###############################################################################
# Grow Monitoring System - Setup ohne Node.js Installation
#
# Für Systeme wo Node.js bereits installiert ist oder manuell installiert wurde
###############################################################################

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     🌱 Grow Monitoring System - Setup (ohne Node.js Installation)    ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

LOG_FILE="setup-no-nodejs-$(date +%Y%m%d_%H%M%S).log"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${MAGENTA}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

# Node.js prüfen (aber NICHT installieren)
check_nodejs() {
    log_step "Prüfe ob Node.js verfügbar ist..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js nicht gefunden!"
        echo ""
        echo -e "${YELLOW}Bitte installiere Node.js manuell:${NC}"
        echo ""
        echo "Ubuntu/Debian:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        echo ""
        echo "macOS:"
        echo "  brew install node"
        echo ""
        echo "Oder von: https://nodejs.org/"
        echo ""
        exit 1
    fi

    NODE_VERSION=$(node --version)
    log_success "Node.js gefunden: $NODE_VERSION"

    if ! command -v npm &> /dev/null; then
        log_error "npm nicht gefunden!"
        exit 1
    fi

    NPM_VERSION=$(npm --version)
    log_success "npm gefunden: $NPM_VERSION"
}

# Backend Dependencies
install_backend() {
    log_step "Installiere Backend Dependencies..."

    cd backend

    if [ -f "package.json" ]; then
        log_info "npm install (Backend) läuft..."
        npm install 2>&1 | tee -a "../$LOG_FILE"
        log_success "Backend Dependencies installiert"
    else
        log_error "package.json nicht gefunden!"
        exit 1
    fi

    cd ..
}

# Backend .env
configure_backend_env() {
    log_step "Konfiguriere Backend .env..."

    cd backend

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success ".env erstellt"
        else
            log_error ".env.example nicht gefunden!"
            exit 1
        fi
    fi

    # JWT Secret generieren
    if grep -q "your-super-secret-jwt-key" .env; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        sed -i.bak "s|your-super-secret-jwt-key.*|$JWT_SECRET|" .env
        log_success "JWT_SECRET generiert"
    fi

    cd ..
}

# Frontend Dependencies
install_frontend() {
    log_step "Installiere Frontend Dependencies..."

    cd frontend

    if [ -f "package.json" ]; then
        log_info "npm install (Frontend) läuft... (kann 5-10 Min dauern!)"
        npm install 2>&1 | tee -a "../$LOG_FILE"
        log_success "Frontend Dependencies installiert"
    else
        log_error "package.json nicht gefunden!"
        exit 1
    fi

    cd ..
}

# Frontend .env
configure_frontend_env() {
    log_step "Konfiguriere Frontend .env..."

    cd frontend

    # IP ermitteln
    if [[ "$OSTYPE" == "darwin"* ]]; then
        IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
    else
        IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi

    cat > .env << ENVCONF
REACT_APP_API_URL=http://$IP:3001
REACT_APP_WS_URL=ws://$IP:3001
ENVCONF

    log_success "Frontend .env erstellt"
    log_info "API URL: http://$IP:3001"

    cd ..
}

# Datenbank
init_database() {
    log_step "Initialisiere Datenbank..."

    cd backend
    mkdir -p data
    log_success "Datenbank-Verzeichnis bereit"
    cd ..
}

# Zusammenfassung
show_summary() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")
    else
        IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✓✓✓ INSTALLATION ERFOLGREICH! ✓✓✓                ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}System-Status:${NC}"
    echo "  ✓ Node.js:  $(node --version)"
    echo "  ✓ npm:      $(npm --version)"
    echo "  ✓ Backend:  Dependencies installiert"
    echo "  ✓ Frontend: Dependencies installiert"
    echo ""
    echo -e "${CYAN}Netzwerk:${NC}"
    echo "  IP-Adresse: $IP"
    echo "  Backend:    http://$IP:3001"
    echo "  Frontend:   http://localhost:3000"
    echo ""
    echo -e "${YELLOW}Nächste Schritte:${NC}"
    echo ""
    echo "1. Backend starten (Terminal 1):"
    echo "   cd backend"
    echo "   npm run dev"
    echo ""
    echo "2. Frontend starten (Terminal 2):"
    echo "   cd frontend"
    echo "   npm start"
    echo ""
    echo "3. Im Browser:"
    echo "   http://localhost:3000"
    echo "   Login: admin / Admin123!"
    echo ""
    echo -e "${GREEN}Viel Erfolg! 🌱${NC}"
    echo ""
}

# Hauptprogramm
main() {
    log_info "Starte Setup (ohne Node.js Installation)..."
    log_info "Log: $LOG_FILE"
    echo ""

    check_nodejs
    install_backend
    configure_backend_env
    install_frontend
    configure_frontend_env
    init_database
    show_summary
}

main

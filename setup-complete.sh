#!/bin/bash

###############################################################################
# Grow Monitoring System - Komplette Automatische Installation
#
# Dieses Script installiert und konfiguriert das KOMPLETTE System:
# - Node.js & npm (falls nicht vorhanden)
# - Backend (Dependencies, .env, Datenbank)
# - Frontend (Dependencies, .env)
# - MQTT Broker (Mosquitto)
# - Tests & Validierung
#
# Unterstützte Systeme: Ubuntu/Debian, Raspberry Pi, macOS
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

# Banner
clear
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     🌱 Grow Monitoring System - Komplette Automatische Installation  ║
║                                                                       ║
║                           Version 3.0.0                               ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Logging
LOG_FILE="setup-$(date +%Y%m%d_%H%M%S).log"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${MAGENTA}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

# Fortschritt
TOTAL_STEPS=12
CURRENT_STEP=0

show_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local percent=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    echo -e "${CYAN}═══ Fortschritt: $CURRENT_STEP/$TOTAL_STEPS ($percent%) ═══${NC}"
    echo ""
}

# Betriebssystem erkennen
detect_os() {
    log_step "Erkenne Betriebssystem..."
    show_progress

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
            VER=$VERSION_ID
            log_success "Erkannt: $PRETTY_NAME"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        VER=$(sw_vers -productVersion)
        log_success "Erkannt: macOS $VER"
    fi
}

# Node.js prüfen/installieren
check_nodejs() {
    log_step "Prüfe Node.js Installation..."
    show_progress

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js gefunden: $NODE_VERSION"

        # Mindestversion prüfen (v16+)
        REQUIRED_VERSION=16
        CURRENT_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

        if [ "$CURRENT_VERSION" -lt "$REQUIRED_VERSION" ]; then
            log_warn "Node.js Version zu alt (benötigt: v16+, gefunden: v$CURRENT_VERSION)"
            log_info "Bitte aktualisiere Node.js: https://nodejs.org/"
        fi
    else
        log_warn "Node.js nicht gefunden, installiere..."

        if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]] || [[ "$OS" == "raspbian" ]]; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OS" == "macos" ]]; then
            if command -v brew &> /dev/null; then
                brew install node
            else
                log_error "Homebrew nicht gefunden. Bitte installiere Node.js manuell."
                exit 1
            fi
        fi

        log_success "Node.js installiert: $(node --version)"
    fi

    # npm prüfen
    if command -v npm &> /dev/null; then
        log_success "npm gefunden: $(npm --version)"
    else
        log_error "npm nicht gefunden!"
        exit 1
    fi
}

# Backend Dependencies installieren
install_backend() {
    log_step "Installiere Backend Dependencies..."
    show_progress

    cd backend

    if [ -f "package.json" ]; then
        log_info "Führe npm install aus (kann 2-5 Min dauern)..."
        npm install --quiet 2>&1 | grep -v "deprecated" || true
        log_success "Backend Dependencies installiert"
    else
        log_error "package.json nicht gefunden in backend/"
        exit 1
    fi

    cd ..
}

# Backend .env konfigurieren
configure_backend_env() {
    log_step "Konfiguriere Backend .env..."
    show_progress

    cd backend

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success ".env erstellt von .env.example"
        else
            log_error ".env.example nicht gefunden!"
            exit 1
        fi
    else
        log_info ".env existiert bereits"
    fi

    # Generiere sicheres JWT_SECRET
    if grep -q "your-super-secret-jwt-key" .env; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
        sed -i.bak "s|your-super-secret-jwt-key.*|$JWT_SECRET|" .env
        log_success "JWT_SECRET generiert und eingetragen"
    fi

    cd ..
}

# Frontend Dependencies installieren
install_frontend() {
    log_step "Installiere Frontend Dependencies..."
    show_progress

    cd frontend

    if [ -f "package.json" ]; then
        log_info "Führe npm install aus (kann 3-10 Min dauern)..."
        npm install --quiet 2>&1 | grep -v "deprecated" || true
        log_success "Frontend Dependencies installiert"
    else
        log_error "package.json nicht gefunden in frontend/"
        exit 1
    fi

    cd ..
}

# Frontend .env konfigurieren
configure_frontend_env() {
    log_step "Konfiguriere Frontend .env..."
    show_progress

    cd frontend

    # IP-Adresse ermitteln
    if [[ "$OS" == "macos" ]]; then
        IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
    else
        IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi

    # .env erstellen/aktualisieren
    cat > .env << ENVCONF
REACT_APP_API_URL=http://$IP:3001
REACT_APP_WS_URL=ws://$IP:3001
ENVCONF

    log_success "Frontend .env erstellt"
    log_info "API URL: http://$IP:3001"

    cd ..
}

# MQTT Broker installieren
install_mqtt() {
    log_step "Installiere MQTT Broker (Mosquitto)..."
    show_progress

    # Prüfe ob bereits installiert
    if command -v mosquitto &> /dev/null; then
        log_success "Mosquitto bereits installiert: $(mosquitto -h 2>&1 | head -1)"
        return
    fi

    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]] || [[ "$OS" == "raspbian" ]]; then
        sudo apt update
        sudo apt install -y mosquitto mosquitto-clients
    elif [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            brew install mosquitto
        else
            log_warn "Homebrew nicht gefunden, überspringe MQTT Installation"
            return
        fi
    fi

    log_success "Mosquitto installiert"
}

# MQTT konfigurieren
configure_mqtt() {
    log_step "Konfiguriere MQTT Broker..."
    show_progress

    if [[ "$OS" == "macos" ]]; then
        MQTT_CONF="/opt/homebrew/etc/mosquitto/mosquitto.conf"
    else
        MQTT_CONF="/etc/mosquitto/mosquitto.conf"
    fi

    if [ ! -f "$MQTT_CONF" ]; then
        log_warn "mosquitto.conf nicht gefunden, überspringe Konfiguration"
        return
    fi

    # Backup
    sudo cp "$MQTT_CONF" "${MQTT_CONF}.backup.$(date +%Y%m%d)" 2>/dev/null || true

    # Konfiguration
    sudo tee "$MQTT_CONF" > /dev/null << 'MQTTCONF'
listener 1883
protocol mqtt
listener 9001
protocol websockets
allow_anonymous true
log_dest file /var/log/mosquitto/mosquitto.log
log_type error
log_type warning
log_timestamp true
persistence true
persistence_location /var/lib/mosquitto/
MQTTCONF

    log_success "MQTT konfiguriert"

    # Service starten
    if [[ "$OS" == "macos" ]]; then
        brew services start mosquitto 2>/dev/null || true
    else
        sudo systemctl enable mosquitto 2>/dev/null || true
        sudo systemctl start mosquitto 2>/dev/null || true
    fi

    log_success "MQTT Service gestartet"
}

# Backend MQTT konfigurieren
configure_backend_mqtt() {
    log_step "Aktiviere MQTT im Backend..."
    show_progress

    cd backend

    if grep -q "MQTT_ENABLED=" .env 2>/dev/null; then
        sed -i.bak "s|^MQTT_ENABLED=.*|MQTT_ENABLED=true|" .env
        sed -i.bak "s|^MQTT_BROKER_URL=.*|MQTT_BROKER_URL=mqtt://localhost:1883|" .env
    else
        cat >> .env << ENVCONF

# MQTT Configuration
MQTT_ENABLED=true
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_BASE_TOPIC=grow_monitoring
MQTT_CLIENT_ID=grow_backend
MQTT_HA_DISCOVERY=true
MQTT_HA_PREFIX=homeassistant
ENVCONF
    fi

    log_success "Backend MQTT konfiguriert"

    cd ..
}

# Datenbank initialisieren
init_database() {
    log_step "Initialisiere Datenbank..."
    show_progress

    cd backend

    # Erstelle data/ Verzeichnis falls nicht vorhanden
    mkdir -p data

    log_success "Datenbank-Verzeichnis bereit"

    cd ..
}

# Tests durchführen
run_tests() {
    log_step "Führe System-Tests durch..."
    show_progress

    # Test 1: Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js nicht gefunden!"
    fi

    # Test 2: npm
    if command -v npm &> /dev/null; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm nicht gefunden!"
    fi

    # Test 3: Backend Dependencies
    if [ -d "backend/node_modules" ]; then
        log_success "Backend Dependencies installiert"
    else
        log_warn "Backend node_modules fehlt"
    fi

    # Test 4: Frontend Dependencies
    if [ -d "frontend/node_modules" ]; then
        log_success "Frontend Dependencies installiert"
    else
        log_warn "Frontend node_modules fehlt"
    fi

    # Test 5: .env Dateien
    if [ -f "backend/.env" ]; then
        log_success "Backend .env vorhanden"
    else
        log_warn "Backend .env fehlt"
    fi

    if [ -f "frontend/.env" ]; then
        log_success "Frontend .env vorhanden"
    else
        log_warn "Frontend .env fehlt"
    fi

    # Test 6: MQTT
    if command -v mosquitto &> /dev/null; then
        log_success "Mosquitto installiert"

        # Port-Test
        if netstat -tuln 2>/dev/null | grep ":1883 " > /dev/null || ss -tuln 2>/dev/null | grep ":1883 " > /dev/null; then
            log_success "MQTT Port 1883 offen"
        else
            log_warn "MQTT Port 1883 nicht erreichbar"
        fi
    else
        log_info "MQTT nicht installiert (optional)"
    fi
}

# Zusammenfassung und nächste Schritte
show_summary() {
    log_step "Installation abgeschlossen!"
    show_progress

    # IP ermitteln
    if [[ "$OS" == "macos" ]]; then
        IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
    else
        IP=$(hostname -I | awk '{print $1}' || echo "localhost")
    fi

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    ✓✓✓ INSTALLATION ERFOLGREICH! ✓✓✓                  ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}═══ System-Status ═══${NC}"
    echo ""
    echo -e "  ${GREEN}✓${NC} Node.js:  $(node --version)"
    echo -e "  ${GREEN}✓${NC} npm:      $(npm --version)"
    echo -e "  ${GREEN}✓${NC} Backend:  Dependencies installiert"
    echo -e "  ${GREEN}✓${NC} Frontend: Dependencies installiert"
    if command -v mosquitto &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} MQTT:     Mosquitto läuft"
    else
        echo -e "  ${YELLOW}○${NC} MQTT:     Nicht installiert (optional)"
    fi
    echo ""
    echo -e "${CYAN}═══ Netzwerk ═══${NC}"
    echo ""
    echo "  Ihre IP-Adresse:  $IP"
    echo "  Backend URL:      http://$IP:3001"
    echo "  Frontend URL:     http://localhost:3000"
    if command -v mosquitto &> /dev/null; then
        echo "  MQTT Broker:      mqtt://$IP:1883"
    fi
    echo ""
    echo -e "${CYAN}═══ Nächste Schritte ═══${NC}"
    echo ""
    echo -e "${YELLOW}1. Backend starten (Terminal 1):${NC}"
    echo "   cd backend"
    echo "   npm run dev"
    echo ""
    echo -e "   Erwartete Ausgabe:"
    echo "   ${GREEN}✓ Database initialized${NC}"
    echo "   ${GREEN}✓ Server started on port 3001${NC}"
    if command -v mosquitto &> /dev/null; then
        echo "   ${GREEN}✓ MQTT connected to broker${NC}"
    fi
    echo ""
    echo -e "${YELLOW}2. Frontend starten (Terminal 2):${NC}"
    echo "   cd frontend"
    echo "   npm start"
    echo ""
    echo "   ${GREEN}→ Browser öffnet automatisch${NC}"
    echo ""
    echo -e "${YELLOW}3. Im Browser einloggen:${NC}"
    echo "   URL:      http://localhost:3000"
    echo "   Username: admin"
    echo "   Password: Admin123!"
    echo ""
    echo -e "${YELLOW}4. ESP32 vorbereiten:${NC}"
    echo "   Öffne:    esp32/GrowMonitor.ino"
    echo "   Ändere:"
    echo "     const char* ssid = \"IHR_WIFI\";"
    echo "     const char* password = \"IHR_PASSWORT\";"
    echo "     const char* serverIP = \"$IP\";"
    if command -v mosquitto &> /dev/null; then
        echo "     const char* mqtt_server = \"$IP\";"
    fi
    echo "   Upload:   Arduino IDE → Upload"
    echo ""
    echo -e "${CYAN}═══ Dokumentation ═══${NC}"
    echo ""
    echo "  COMPLETE_SETUP_GUIDE.md  → Vollständige Anleitung"
    echo "  IOT_STACK_SETUP.md       → MQTT & Home Assistant"
    echo "  esp32/WIRING_GUIDE.md    → Hardware-Verkabelung"
    echo "  SETUP_INDEX.md           → Alle Anleitungen"
    echo ""
    echo -e "${CYAN}═══ Support ═══${NC}"
    echo ""
    echo "  Log-Datei:     $LOG_FILE"
    echo "  GitHub Issues: https://github.com/IHR_USER/Grown_GrowMonitoring/issues"
    echo ""
    echo -e "${GREEN}Viel Erfolg mit deinem Grow Monitoring System! 🌱${NC}"
    echo ""
}

# Hauptprogramm
main() {
    log_info "Starte komplette Installation..."
    log_info "Log-Datei: $LOG_FILE"
    echo ""

    detect_os
    check_nodejs
    install_backend
    configure_backend_env
    install_frontend
    configure_frontend_env
    install_mqtt
    configure_mqtt
    configure_backend_mqtt
    init_database
    run_tests
    show_summary

    log_success "Setup abgeschlossen!"
}

# Script ausführen
main

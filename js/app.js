import { CONFIG } from './config.js';
import { AnimationEngine } from './animation.js';
import { SearchModule } from './search.js';
import { speakGreeting, getRandomSpeech } from './speech.js';
import { AdminModule } from './admin.js';
import { GuestbookModule } from './guestbook.js';

class WeddingApp {
  constructor() {
    this.config = CONFIG;
    this.data = { tables: [], guests: [] };
    this.animationEngine = new AnimationEngine('animation-canvas');
  }

  async init() {
    this.applyConfig();
    await this.loadData();

    this.searchModule = new SearchModule(this.data.guests, (guest) => this.onGuestSelected(guest));
    this.adminModule = new AdminModule(this.data, () => this.onDataUpdated());
    new GuestbookModule();

    this.renderMapMarkers();
    this.setupEventListeners();
  }

  applyConfig() {
    document.getElementById('app-title').innerText = `${this.config.names.bride} & ${this.config.names.groom}`;
    document.getElementById('photo-link').href = this.config.photoAlbumUrl;
  }

  async loadData() {
    try {
      const res = await fetch('data.json');
      const jsonData = await res.json();
      this.data.tables = jsonData.tables;
      
      const savedGuests = localStorage.getItem('wedding_guests_custom');
      this.data.guests = savedGuests ? JSON.parse(savedGuests) : jsonData.guests;
    } catch (e) {
      console.error("Fehler beim Laden von data.json", e);
    }
  }

  onDataUpdated() {
    this.searchModule.updateGuests(this.data.guests);
  }

  renderMapMarkers() {
    const layer = document.getElementById('tables-layer');
    if (!layer) return;

    layer.innerHTML = '';
    this.data.tables.forEach(table => {
      const marker = document.createElement('div');
      marker.className = 'table-marker';
      marker.id = `marker-${table.id}`;
      marker.style.left = `${table.x}%`;
      marker.style.top = `${table.y}%`;
      
      const displayName = table.name.replace('Tisch ', '').replace('Braut-Tisch', 'BT');
      marker.innerText = displayName;

      marker.addEventListener('click', () => {
        this.focusTable(table);
      });

      layer.appendChild(marker);
    });
  }

  setupEventListeners() {
    document.getElementById('speech-btn')?.addEventListener('click', () => {
      alert(`💬 Brautpaar Spruch:\n\n"${getRandomSpeech()}"`);
    });

    document.getElementById('pdf-download-btn')?.addEventListener('click', () => {
      window.print();
    });
  }

  onGuestSelected(guest) {
    const table = this.data.tables.find(t => t.id === guest.tableId);
    if (!table) return;

    // 1. Highlight info text
    const guestName = `${guest.firstName} ${guest.lastNameInitial || ''}`.trim();
    const tableName = table.name;
    document.getElementById('target-guest-info').innerText = `${guestName} ➔ ${tableName}`;
    document.getElementById('target-seat-info').innerText = `Dein Sitzplatz ist Nummer ${guest.seat}`;

    // 2. Focus & Pulse Table
    this.focusTable(table);

    // 3. Canvas Confetti
    this.animationEngine.triggerConfetti();

    // 4. Voice Greeting
    speakGreeting(guest.firstName, tableName, guest.seat);
  }

  focusTable(table) {
    document.querySelectorAll('.table-marker').forEach(m => m.classList.remove('highlight'));
    
    const targetMarker = document.getElementById(`marker-${table.id}`);
    if (targetMarker) {
      targetMarker.classList.add('highlight');
    }

    // Gentle zoom to table
    const container = document.getElementById('map-container');
    const scale = 1.6;
    const translateX = (50 - table.x) * (scale / 1.8);
    const translateY = (50 - table.y) * (scale / 1.8);

    container.style.transform = `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new WeddingApp();
  app.init();
});

import { CONFIG } from './config.js';

export class AdminModule {
  constructor(data, onDataUpdated) {
    this.data = data;
    this.onDataUpdated = onDataUpdated;
    this.dialog = document.getElementById('admin-dialog');
    this.init();
  }

  init() {
    // Geheimer URL-Parameter Check (?admin=true)
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminUrl = urlParams.get(CONFIG.adminUrlParam) === CONFIG.adminUrlValue;

    const adminTriggerBtn = document.getElementById('admin-trigger-btn');
    if (isAdminUrl) {
      if (adminTriggerBtn) adminTriggerBtn.classList.remove('hidden');
    }

    adminTriggerBtn?.addEventListener('click', () => this.openAdminPanel());
    document.getElementById('admin-close-btn')?.addEventListener('click', () => this.dialog.close());

    // Excel Export
    document.getElementById('excel-export-btn')?.addEventListener('click', () => this.exportToExcel());

    // Excel Import
    document.getElementById('excel-import-file')?.addEventListener('change', (e) => this.importFromExcel(e));
  }

  openAdminPanel() {
    this.renderAdminTable();
    this.dialog.showModal();
  }

  exportToExcel() {
    if (!window.XLSX) return alert("Excel-Bibliothek lädt noch...");

    const exportRows = this.data.guests.map(g => ({
      "Vorname": g.firstName,
      "Initial / Nachname": g.lastNameInitial || "",
      "Tisch": g.tableId.replace("tisch-", "").replace("-2", ""),
      "Sitzplatz": g.seat
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sitzplatzliste");

    XLSX.writeFile(workbook, "Hochzeit_Anja_Dino_Sitzplatzliste.xlsx");
  }

  importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = new Uint8Array(e.target.result);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      if (jsonData.length === 0) return alert("Die hochgeladene Datei enthält keine Daten.");

      this.data.guests = jsonData.map((row, idx) => ({
        id: `g_${idx + 1}`,
        firstName: row["Vorname"] || row["Name"] || "Gast",
        lastNameInitial: row["Initial / Nachname"] || row["Initial"] || "",
        tableId: `tisch-${row["Tisch"]?.toString().replace(/\D/g, '')}`,
        seat: parseInt(row["Sitzplatz"]) || 1
      }));

      localStorage.setItem('wedding_guests_custom', JSON.stringify(this.data.guests));
      alert(`${this.data.guests.length} Gäste erfolgreich importiert!`);
      this.onDataUpdated();
      this.renderAdminTable();
    };
    reader.readAsArrayBuffer(file);
  }

  renderAdminTable() {
    const tbody = document.getElementById('admin-guest-tbody');
    const countEl = document.getElementById('admin-guest-count');
    if (!tbody) return;

    tbody.innerHTML = '';
    countEl.innerText = this.data.guests.length;

    this.data.guests.forEach((g, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.firstName}</td>
        <td>${g.lastNameInitial || '-'}</td>
        <td>${g.tableId.replace('tisch-', 'Tisch ')}</td>
        <td>${g.seat}</td>
        <td><button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.75rem;" data-idx="${idx}">Löschen</button></td>
      `;

      tr.querySelector('button').addEventListener('click', () => {
        this.data.guests.splice(idx, 1);
        localStorage.setItem('wedding_guests_custom', JSON.stringify(this.data.guests));
        this.onDataUpdated();
        this.renderAdminTable();
      });

      tbody.appendChild(tr);
    });
  }
}

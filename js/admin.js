import { CONFIG } from './config.js';

export class AdminModule {
  constructor(data, onDataUpdated) {
    this.data = data;
    this.onDataUpdated = onDataUpdated;
    this.dialog = document.getElementById('admin-dialog');
    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminUrl = urlParams.get(CONFIG.adminUrlParam) === CONFIG.adminUrlValue;

    const adminTriggerBtn = document.getElementById('admin-trigger-btn');
    if (isAdminUrl) {
      if (adminTriggerBtn) adminTriggerBtn.classList.remove('hidden');
    }

    adminTriggerBtn?.addEventListener('click', () => this.openAdminPanel());
    document.getElementById('admin-close-btn')?.addEventListener('click', () => this.dialog.close());

    document.getElementById('excel-export-btn')?.addEventListener('click', () => this.exportToExcel());
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
      "Tisch": g.tableId === "tisch-1-2" ? "Braut-Tisch" : g.tableId.replace("tisch-", "Tisch "),
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

      // Array aus Zeilen lesen (auch ohne Kopfzeile möglich)
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

      if (rows.length === 0) return alert("Die hochgeladene Datei enthält keine Daten.");

      // Prüfen, ob die 1. Zeile Überschriften enthält
      const firstRowStr = (rows[0][0] || "").toString().toLowerCase();
      const hasHeader = firstRowStr.includes("vorname") || firstRowStr.includes("name") || firstRowStr.includes("gast");
      const dataRows = hasHeader ? rows.slice(1) : rows;

      // Hilfsfunktion zur Ermittlung der Tisch-ID anhand der Sitzplatznummer (1-154)
      const getTableBySeat = (seatNum) => {
        if (seatNum <= 14) return "tisch-1-2";
        if (seatNum <= 20) return "tisch-3";
        if (seatNum <= 26) return "tisch-4";
        if (seatNum <= 32) return "tisch-5";
        if (seatNum <= 39) return "tisch-6";
        if (seatNum <= 45) return "tisch-7";
        if (seatNum <= 51) return "tisch-8";
        if (seatNum <= 59) return "tisch-9";
        if (seatNum <= 66) return "tisch-10";
        if (seatNum <= 74) return "tisch-11";
        if (seatNum <= 82) return "tisch-12";
        if (seatNum <= 91) return "tisch-13";
        if (seatNum <= 99) return "tisch-14";
        if (seatNum <= 107) return "tisch-15";
        if (seatNum <= 118) return "tisch-16";
        if (seatNum <= 128) return "tisch-17";
        if (seatNum <= 137) return "tisch-18";
        if (seatNum <= 144) return "tisch-19";
        return "tisch-20";
      };

      this.data.guests = dataRows.map((row, idx) => {
        const rawName = (row[0] || `Gast ${idx + 1}`).toString().trim();
        let rawSeat = parseFloat(row[1]);

        // Korrektur für Tippfehler wie '54.1'
        if (isNaN(rawSeat) || rawSeat > 154) rawSeat = idx + 1;
        if (Math.round(rawSeat) === 54 && idx > 150) rawSeat = 154;

        const seatNum = Math.round(rawSeat);
        const nameParts = rawName.split(" ");
        const firstName = nameParts[0] || "Gast";
        const lastNameInitial = nameParts.slice(1).join(" ") || "";

        return {
          id: `g_${idx + 1}`,
          firstName: firstName,
          lastNameInitial: lastNameInitial,
          tableId: getTableBySeat(seatNum),
          seat: seatNum
        };
      });

      localStorage.setItem('wedding_guests_custom', JSON.stringify(this.data.guests));
      alert(`${this.data.guests.length} Gäste erfolgreich geladen!`);
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
      const displayTable = g.tableId === 'tisch-1-2' ? 'Braut-Tisch' : g.tableId.replace('tisch-', 'Tisch ');

      tr.innerHTML = `
        <td>${g.firstName}</td>
        <td>${g.lastNameInitial || '-'}</td>
        <td>${displayTable}</td>
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

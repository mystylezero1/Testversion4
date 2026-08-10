// First-Name Live Search with Fuzzy Matching & Disambiguation Popup
export class SearchModule {
  constructor(guests, onSelectGuest) {
    this.guests = guests;
    this.onSelectGuest = onSelectGuest;
    this.input = document.getElementById('search-input');
    this.resultsContainer = document.getElementById('search-results');
    this.dialog = document.getElementById('disambiguation-dialog');
    this.dialogList = document.getElementById('disambiguation-list');
    this.closeBtn = document.getElementById('disambiguation-close-btn');

    this.init();
  }

  updateGuests(newGuests) {
    this.guests = newGuests;
  }

  init() {
    this.input.addEventListener('input', () => this.handleSearch());
    this.closeBtn.addEventListener('click', () => this.dialog.close());
  }

  handleSearch() {
    const query = this.input.value.trim().toLowerCase();
    this.resultsContainer.innerHTML = '';

    if (query.length < 1) return;

    // Filter matching first names
    const matches = this.guests.filter(g => 
      g.firstName.toLowerCase().startsWith(query) ||
      g.firstName.toLowerCase().includes(query)
    );

    matches.forEach(guest => {
      const item = document.createElement('div');
      item.className = 'result-item';
      
      const displayName = `${guest.firstName} ${guest.lastNameInitial || ''}`.trim();
      item.innerHTML = `<span><strong>${guest.firstName}</strong> ${guest.lastNameInitial || ''}</span> <small style="color:#888;">Suchen</small>`;
      
      item.addEventListener('click', () => this.processSelection(guest.firstName));
      this.resultsContainer.appendChild(item);
    });
  }

  processSelection(firstName) {
    this.resultsContainer.innerHTML = '';
    
    // Find all guests matching this exact first name
    const matches = this.guests.filter(g => g.firstName.toLowerCase() === firstName.toLowerCase());

    if (matches.length > 1) {
      // Disambiguation needed for identical first names
      this.showDisambiguationModal(matches);
    } else if (matches.length === 1) {
      this.input.value = `${matches[0].firstName} ${matches[0].lastNameInitial || ''}`.trim();
      this.onSelectGuest(matches[0]);
    }
  }

  showDisambiguationModal(matches) {
    this.dialogList.innerHTML = '';

    matches.forEach(guest => {
      const btn = document.createElement('button');
      btn.className = 'btn-creme';
      btn.style.width = '100%';
      btn.style.marginBottom = '0.6rem';
      btn.style.padding = '0.8rem';
      
      const tableName = guest.tableId.replace('tisch-', 'Tisch ').replace('-2', '');
      btn.innerText = `${guest.firstName} ${guest.lastNameInitial || ''} (${tableName}, Sitz ${guest.seat})`;
      
      btn.addEventListener('click', () => {
        this.dialog.close();
        this.input.value = `${guest.firstName} ${guest.lastNameInitial || ''}`.trim();
        this.onSelectGuest(guest);
      });

      this.dialogList.appendChild(btn);
    });

    this.dialog.showModal();
  }
}

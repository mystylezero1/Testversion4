export class GuestbookModule {
  constructor() {
    this.dialog = document.getElementById('guestbook-dialog');
    this.openBtn = document.getElementById('guestbook-open-btn');
    this.closeBtn = document.getElementById('gb-close-btn');
    this.form = document.getElementById('guestbook-form');
    this.init();
  }

  init() {
    this.openBtn?.addEventListener('click', () => this.dialog.showModal());
    this.closeBtn?.addEventListener('click', () => this.dialog.close());

    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('gb-author').value.trim();
      const message = document.getElementById('gb-message').value.trim();

      const entries = JSON.parse(localStorage.getItem('wedding_guestbook_entries') || '[]');
      entries.push({ author, message, timestamp: new Date().toISOString() });
      localStorage.setItem('wedding_guestbook_entries', JSON.stringify(entries));

      this.form.reset();
      this.dialog.close();
      alert("Vielen Dank für deine wundervolle Nachricht! ❤️");
    });
  }
}

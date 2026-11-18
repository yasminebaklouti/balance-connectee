/* Rappel à l'apiculteur d'aller voir ses abeilles.
*/
(function () {
    const INTERVAL_DAYS = 7;   // rappel si pas de visite depuis X jours
    const SNOOZE_HOURS = 24;   // durée du « Plus tard »
    const SELECTED_KEY = 'couesnon.selectedDeviceId';

    const banner = document.getElementById('visit-reminder');
    const detail = document.getElementById('vr-detail');
    const titleEl = document.getElementById('topbar-name');
    if (!banner || !detail || !titleEl) return;

    const keyVisit = id => 'couesnon.lastVisit.' + id;
    const keySnooze = id => 'couesnon.visitSnooze.' + id;
remeinder
    function read(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, value); } catch { /* ignore */ }
    }
remeinder
    function currentDevice() {
        return read(SELECTED_KEY);
    }

    function hide() { banner.style.display = 'none'; }
    function show(text) {
        detail.textContent = text;
        banner.style.display = 'flex';
    }

    function refresh() {
        const id = currentDevice();
        if (!id) { hide(); return; }

        if (Date.now() < Number(read(keySnooze(id)) || 0)) { hide(); return; }

        const last = Number(read(keyVisit(id)) || 0);
        if (!last) {
            show('Aucune visite enregistrée pour cette ruche.');
            return;
        }

        const days = Math.floor((Date.now() - last) / 86400000);
        if (days >= INTERVAL_DAYS) {
            show('Dernière visite il y a ' + days + ' jour' + (days > 1 ? 's' : '') + '.');
        } else {
            hide();
        }
    }

    document.getElementById('vr-done')?.addEventListener('click', () => {
        const id = currentDevice();
        if (!id) return;
        write(keyVisit(id), String(Date.now()));
        refresh();
    });

    document.getElementById('vr-snooze')?.addEventListener('click', () => {
        const id = currentDevice();
        if (!id) return;
        write(keySnooze(id), String(Date.now() + SNOOZE_HOURS * 3600000));
        refresh();
    });

    // app.js met à jour le titre à chaque changement de ruche
    new MutationObserver(refresh).observe(titleEl, {
        childList: true, characterData: true, subtree: true
    });

    refresh();
})();

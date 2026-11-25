const announcements = [...document.querySelectorAll('[data-investigation-date]')];
for (const list of document.querySelectorAll('[data-announcement-order]')) {
    const entries = [...list.children].filter(item => item.dataset.eventSort);
    const sorted = [...entries].sort((a, b) => a.dataset.eventSort.localeCompare(b.dataset.eventSort));
    if (sorted.some((entry, index) => entry !== entries[index])) {
        list.prepend(...sorted);
    }
}

const update = () => {
    const now = Date.now();
    let pending = false;

    for (const item of announcements) {
        const start = Date.parse(item.dataset.investigationDate);
        const end = Date.parse(item.dataset.archiveAfter);
        const archived = now >= end;
        item.hidden = (item.dataset.listing === 'upcoming' && archived)
            || (item.dataset.listing === 'archive' && !archived);

        const status = item.querySelector('[data-investigation-status]');
        if (status) {
            status.textContent = archived ? (item.dataset.archiveLabel || 'Investigation archive')
                : now >= start ? (item.dataset.openLabel || 'Investigation date')
                : (item.dataset.upcomingLabel || 'Upcoming investigation');
        }

        const countdown = item.querySelector('[data-investigation-countdown]');
        if (countdown) {
            countdown.hidden = now >= start;
            if (now < start) {
                const seconds = Math.ceil((start - now) / 1000);
                const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24,
                    Math.floor(seconds / 60) % 60, seconds % 60];
                countdown.querySelectorAll('strong').forEach((field, index) => {
                    field.textContent = String(values[index]).padStart(2, '0');
                });
            }
        }
        pending ||= !archived;
    }
    return pending;
};

if (update()) {
    const clock = setInterval(() => {
        if (!update()) clearInterval(clock);
    }, 1000);
}

for (const button of document.querySelectorAll('[data-investigation-share]')) {
    button.hidden = !navigator.share;
    button.addEventListener('click', async () => {
        try {
            await navigator.share({ title: document.title, url: location.href });
        } catch (error) {
            if (error.name !== 'AbortError') button.nextElementSibling.textContent = 'Copy the page address to share this investigation.';
        }
    });
}

const share = document.querySelector('[data-event-share]');
const shareStatus = document.querySelector('[data-event-share-status]');

share.addEventListener('click', async () => {
    const url = location.href.split('#')[0];
    try {
        if (navigator.share) {
            await navigator.share({ title: document.title, url });
            return;
        }
        await navigator.clipboard.writeText(url);
        shareStatus.textContent = 'Event link copied.';
    } catch (error) {
        if (error.name !== 'AbortError') shareStatus.textContent = 'Copy the address from your browser to share this event.';
    }
});

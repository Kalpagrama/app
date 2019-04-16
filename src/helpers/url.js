export function urlGet(name) {
    const parts = window.location.href.split('?');
    if (parts.length > 1) {
        name = encodeURIComponent(name);
        const params = parts[1].split('&');
        const found = params.filter(el => (el.split('=')[0] === name) && el);
        if (found.length) {
            return decodeURIComponent(found[0].split('=')[1].split('#')[0]);
        }
    }
}

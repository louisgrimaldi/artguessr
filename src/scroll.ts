/**
 * The app shell, not the document, is the scroll container — see `.content` in
 * index.css. Route changes therefore have to reset that element rather than the
 * window, which no longer scrolls at all on wide screens.
 */
export function scrollContentToTop(): void {
  const content = document.querySelector('.content');
  content?.scrollTo({ top: 0, behavior: 'instant' });
  // Below the breakpoint the page itself scrolls again.
  window.scrollTo({ top: 0, behavior: 'instant' });
}

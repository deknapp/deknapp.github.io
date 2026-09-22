// Analytics for deknapp.github.io and every project site published under it.
//
// One file, loaded by all of them, so the tag can be changed in one place
// rather than in eight repositories. It does two things: GoatCounter's own
// script counts the page view, and the handler below counts a click whenever
// a link leaves the site it was clicked on.
//
// "Leaves the site" cannot mean a different origin here. The hub and every
// project share deknapp.github.io and are told apart only by the first path
// segment, so a click from /otowi/ back to the hub is a real navigation
// between two sites that a same-origin test would throw away. It means a
// different first segment, a different host, or mailto.
(function () {
  var ENDPOINT = 'https://deknapp.goatcounter.com/count';

  // count.js reads the endpoint from this global when it is not loaded with a
  // data-goatcounter attribute, so it has to be set before the script is added.
  window.goatcounter = window.goatcounter || {};
  window.goatcounter.endpoint = ENDPOINT;

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://gc.zgo.at/count.js';
  (document.head || document.documentElement).appendChild(tag);

  // The hub is served from the root, where there is no first segment.
  function siteOf(pathname) {
    return pathname.split('/')[1] || 'home';
  }

  var here = siteOf(location.pathname);

  function destinationOf(link) {
    if (link.protocol === 'mailto:') return 'mailto';
    if (link.host !== location.host) {
      return link.host.replace(/^www\./, '') + link.pathname.replace(/\/+$/, '');
    }
    return 'deknapp.github.io/' + siteOf(link.pathname);
  }

  function leavesSite(link) {
    if (link.protocol === 'mailto:') return true;
    if (link.protocol !== 'http:' && link.protocol !== 'https:') return false;
    if (link.host !== location.host) return true;
    return siteOf(link.pathname) !== here;
  }

  // Capture phase, so a click is still counted when the page's own handler
  // stops propagation. A click that lands on a child element of the link --
  // the icon inside a button, say -- has to walk up to find it.
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest
      ? event.target.closest('a[href]')
      : null;
    if (!link || !leavesSite(link)) return;

    // count.js may not have loaded yet on a very fast click. Losing that one
    // is the right trade against blocking the navigation to wait for it.
    if (window.goatcounter && window.goatcounter.count) {
      var destination = destinationOf(link);
      window.goatcounter.count({
        path: 'click:' + here + ' > ' + destination,
        title: 'Link click: ' + here + ' > ' + destination,
        event: true
      });
    }
  }, true);
})();

'use strict';
// Enabled only after Web Analytics is activated in the Vercel project.
// Custom events require a compatible plan and are separately controlled.
(() => {
  const config = window.PORTAL_ANALYTICS || { enabled: false, customEvents: false };
  if (!config.enabled || window.top !== window.self || navigator.doNotTrack === '1') return;
  const productionHost = 'bi-para-todosbi-para-todos-2026.vercel.app';
  if (location.hostname !== productionHost) return;
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va('beforeSend', data => {
    if (data.url) { const url = new URL(data.url, location.origin); url.search = ''; url.hash = ''; data.url = url.href; }
    return data;
  });
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.append(script);
  const names = new Set(['article_open','section_select','advertising_visit','proposal_prepare','contact_open']);
  window.portalTrack = (name, properties = {}) => {
    if (!config.customEvents || !names.has(name)) return;
    const data = {};
    if (['Todas','Angola','Mundo','Diáspora','Desporto','Tecnologia','Oportunidades'].includes(properties.section)) data.section = properties.section;
    if (/^[0-9a-f-]{36}$/i.test(properties.article_id || '')) data.article_id = properties.article_id;
    if (['email','whatsapp','telephone'].includes(properties.channel)) data.channel = properties.channel;
    if (['header','highlight','between_sections'].includes(properties.placement)) data.placement = properties.placement;
    window.va('event', { name, data });
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.matches('.advertise-nav,.ad-slot a')) {
      const placement = link.matches('.advertise-nav') ? 'header' : link.closest('.ad-slot-secondary') ? 'between_sections' : 'highlight';
      window.portalTrack('advertising_visit', { placement });
    }
    if (link.closest('.commercial-contacts,#proposal-result')) {
      const channel = link.href.startsWith('mailto:') ? 'email' : link.href.startsWith('tel:') ? 'telephone' : link.hostname === 'wa.me' ? 'whatsapp' : null;
      if (channel) window.portalTrack('contact_open', { channel });
    }
  });
})();

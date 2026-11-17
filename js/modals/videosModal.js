function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildVideoTile(item) {
  return `
    <article class="video-tile">
      <div class="documents-video-wrapper">
        <video
          class="documents-video"
          controls
          playsinline
          preload="metadata"
        >
          <source src="${escapeHtml(item.href)}" type="${escapeHtml(item.mimeType || 'video/mp4')}" />
          Seu navegador não suporta reprodução de vídeo.
        </video>
      </div>

      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description || '')}</p>
    </article>
  `;
}

export function setupVideosModal({ triggerSelector, modalRootSelector, videos }) {
  const trigger = document.querySelector(triggerSelector);
  const modalRoot = document.querySelector(modalRootSelector);
  const items = Array.isArray(videos) ? videos : [];

  if (!trigger || !modalRoot || items.length === 0) {
    return;
  }

  modalRoot.insertAdjacentHTML(
    'beforeend',
    `
      <div class="modal-overlay" id="videosModal" aria-hidden="true">
        <div class="modal modal-videos" role="dialog" aria-modal="true" aria-labelledby="videosModalTitle">
          <button class="modal-close" id="closeVideosModal" aria-label="Fechar modal">×</button>

          <h2 id="videosModalTitle">Vídeos</h2>
          <p class="modal-subtitle">
            Assista aos vídeos de passo a passo.
          </p>

          <div class="video-gallery" id="videoGallery">
            ${items.map(buildVideoTile).join('')}
          </div>
        </div>
      </div>
    `,
  );

  const modal = document.getElementById('videosModal');
  const closeButton = document.getElementById('closeVideosModal');
  const gallery = document.getElementById('videoGallery');

  function fitVideo(video) {
    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) {
      return;
    }

    const availableWidth = video.parentElement?.clientWidth || videoWidth;
    const maxHeight = Math.min(420, window.innerHeight * 0.5);
    const ratio = videoWidth / videoHeight;

    let width = Math.min(availableWidth, videoWidth);
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    video.style.aspectRatio = `${videoWidth} / ${videoHeight}`;
    video.style.width = `${Math.round(width)}px`;
    video.style.height = 'auto';
  }

  function syncVideoFrames() {
    gallery.querySelectorAll('.documents-video').forEach((video) => {
      const apply = () => fitVideo(video);

      if (video.readyState >= 1) {
        apply();
        return;
      }

      if (video.dataset.fitBound === 'true') {
        return;
      }

      video.dataset.fitBound = 'true';
      video.addEventListener('loadedmetadata', apply, { once: true });
    });
  }

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    syncVideoFrames();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');

    gallery.querySelectorAll('.documents-video').forEach((video) => {
      video.pause();
    });
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
  });

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  window.addEventListener('resize', syncVideoFrames);
  syncVideoFrames();
}

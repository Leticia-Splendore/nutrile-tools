function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function getFileBadge(type) {
  const labels = {
    pdf: 'PDF',
    image: 'Imagem',
    external: 'Link',
    video: 'Vídeo',
    zip: 'ZIP',
  };

  return labels[type] || 'Arquivo';
}

function getFileIcon(type) {
  const icons = {
    pdf: 'fa-regular fa-file-lines',
    image: 'fa-regular fa-file-image',
    external: 'fa-solid fa-arrow-up-right-from-square',
    video: 'fa-regular fa-file-video',
    zip: 'fa-regular fa-file-zipper',
  };

  return icons[type] || 'fa-regular fa-file-lines';
}

function prepareItems(items) {
  return items.map((item) => ({
    ...item,
    typeLabel: getFileBadge(item.type),
    searchIndex: normalizeText(
      [item.title, item.description, (item.tags || []).join(' ')].join(' '),
    ),
  }));
}

function buildVideoPreview(item) {
  const posterAttr = item.poster ? `poster="${escapeHtml(item.poster)}"` : '';

  return `
    <div class="documents-video-wrapper">
      <video
        class="documents-video"
        controls
        playsinline
        preload="metadata"
        ${posterAttr}
      >
        <source src="${escapeHtml(item.href)}" type="${escapeHtml(item.mimeType || 'video/mp4')}" />
        Seu navegador não suporta reprodução de vídeo.
      </video>
    </div>
  `;
}

function buildDocumentCard(item) {
  const nonDownloadableTypes = ['external', 'video'];
  const canDownload = !nonDownloadableTypes.includes(item.type);
  const isVideo = item.type === 'video';

  return `
    <article class="documents-card ${isVideo ? 'documents-card-video' : ''}">
      <div class="documents-card-main">
        <div class="documents-card-icon" aria-hidden="true">
          <i class="${escapeHtml(getFileIcon(item.type))}"></i>
        </div>

        <div class="documents-card-content">
          <div class="documents-card-header">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="documents-card-badge">${escapeHtml(item.typeLabel)}</span>
          </div>

          <p>${escapeHtml(item.description || 'Arquivo disponível para visualização.')}</p>

          ${isVideo ? buildVideoPreview(item) : ''}

          <div class="documents-card-actions">
            <a
              class="documents-action-btn"
              href="${escapeHtml(item.href)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${isVideo ? 'Abrir vídeo em nova aba' : 'Visualizar'} ${escapeHtml(item.title)}"
            >
              <span>${isVideo ? 'Abrir em nova aba' : 'Abrir'}</span>
            </a>

            ${
              canDownload
                ? `
              <a
                class="documents-action-btn"
                href="${escapeHtml(item.href)}"
                download="${escapeHtml(item.downloadName || item.title)}"
                aria-label="Baixar ${escapeHtml(item.title)}"
              >
                <span>Baixar</span>
              </a>
            `
                : ''
            }
          </div>
        </div>
      </div>
    </article>
  `;
}

export function setupDocumentsModal({
  triggerSelector,
  modalRootSelector,
  documents,
}) {
  const trigger = document.querySelector(triggerSelector);
  const modalRoot = document.querySelector(modalRootSelector);
  const allItems = Array.isArray(documents) ? prepareItems(documents) : [];

  if (!trigger || !modalRoot || allItems.length === 0) {
    return;
  }

  modalRoot.insertAdjacentHTML(
    'beforeend',
    `
      <div class="modal-overlay" id="documentsModal" aria-hidden="true">
        <div class="modal modal-library modal-documents" role="dialog" aria-modal="true" aria-labelledby="documentsModalTitle">
          <button class="modal-close" id="closeDocumentsModal" aria-label="Fechar modal">×</button>

          <h2 id="documentsModalTitle">Materiais e arquivos</h2>
          <p class="modal-subtitle">
            Encontre rapidamente os documentos disponíveis.
          </p>

          <div class="documents-toolbar">
            <div class="documents-search-group">
              <label class="sr-only" for="documentsSearch">Buscar documento</label>
              <i class="fa-solid fa-magnifying-glass documents-search-icon" aria-hidden="true"></i>
              <input id="documentsSearch" type="search" placeholder="Buscar por nome, descrição ou contexto" />
            </div>
          </div>

          <div class="documents-results-meta" id="documentsResultsMeta" aria-live="polite"></div>
          <div class="documents-list" id="documentsList"></div>
        </div>
      </div>
    `,
  );

  const modal = document.getElementById('documentsModal');
  const closeButton = document.getElementById('closeDocumentsModal');
  const searchInput = document.getElementById('documentsSearch');
  const resultsMeta = document.getElementById('documentsResultsMeta');
  const documentsList = document.getElementById('documentsList');

  const searchCache = new Map();

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function updateResultsMeta(total) {
    const label =
      total === 1 ? 'documento encontrado' : 'documentos encontrados';
    resultsMeta.textContent = `${total} ${label}`;
  }

  function getSearchResult(searchValue) {
    const normalizedQuery = normalizeText(searchValue);

    if (searchCache.has(normalizedQuery)) {
      return searchCache.get(normalizedQuery);
    }

    const result = !normalizedQuery
      ? allItems
      : allItems.filter((item) => item.searchIndex.includes(normalizedQuery));

    searchCache.set(normalizedQuery, result);
    return result;
  }

  function renderDocuments() {
    const searched = getSearchResult(searchInput.value);

    updateResultsMeta(searched.length);

    if (searched.length === 0) {
      documentsList.innerHTML = `
        <div class="documents-empty-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>Nenhum documento encontrado para essa busca.</p>
        </div>
      `;
      return;
    }

    documentsList.innerHTML = searched.map(buildDocumentCard).join('');
  }

  let debounceId = null;
  function handleSearchInput() {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(renderDocuments, 120);
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
    searchInput.focus();
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

  searchInput.addEventListener('input', handleSearchInput);

  renderDocuments();
}

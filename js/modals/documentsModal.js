function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
    pdf: 'fa-regular fa-file-pdf',
    image: 'fa-regular fa-file-image',
    external: 'fa-solid fa-arrow-up-right-from-square',
    video: 'fa-regular fa-file-video',
    zip: 'fa-regular fa-file-zipper',
  };

  return icons[type] || 'fa-regular fa-file-lines';
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function flattenCategories(categories) {
  return categories.flatMap((category) =>
    (category.items || []).map((item) => {
      const normalizedTitle = normalizeText(item.title);
      const normalizedDescription = normalizeText(item.description);
      const normalizedCategory = normalizeText(category.label);
      const normalizedType = normalizeText(getFileBadge(item.type));
      const normalizedTags = normalizeText((item.tags || []).join(' '));

      return {
        ...item,
        categoryId: category.id,
        categoryLabel: category.label,
        categoryIcon: category.icon || 'fa-regular fa-folder',
        searchIndex: [
          normalizedTitle,
          normalizedDescription,
          normalizedCategory,
          normalizedType,
          normalizedTags,
        ].join(' '),
      };
    }),
  );
}

function compareText(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function debounce(callback, delay = 140) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}

function buildActionLinks(item, compact = false) {
  const viewLabel = compact ? 'Visualizar arquivo' : `Visualizar ${item.title}`;
  const downloadLabel = compact ? 'Baixar arquivo' : `Baixar ${item.title}`;

  return `
    <a
      class="drive-file-action"
      href="${escapeHtml(item.href)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${escapeHtml(viewLabel)}"
      title="Visualizar"
    >
      <i class="fa-regular fa-eye"></i>
      <span>Visualizar</span>
    </a>

    ${item.type === 'external'
      ? ''
      : `
      <a
        class="drive-file-action"
        href="${escapeHtml(item.href)}"
        download="${escapeHtml(item.downloadName || item.title)}"
        aria-label="${escapeHtml(downloadLabel)}"
        title="Baixar"
      >
        <i class="fa-solid fa-download"></i>
        <span>Baixar</span>
      </a>
    `}
  `;
}

function buildThumbnail(item, variant = 'list') {
  if (!item.thumbnail) {
    return `
      <div class="drive-file-icon ${variant === 'gallery' ? 'drive-file-icon-gallery' : ''}" aria-hidden="true">
        <i class="${escapeHtml(getFileIcon(item.type))}"></i>
      </div>
    `;
  }

  return `
    <div class="drive-thumb ${variant === 'gallery' ? 'drive-thumb-gallery' : 'drive-thumb-list'}" aria-hidden="true">
      <img
        class="drive-thumb-image"
        alt=""
        data-thumb="${escapeHtml(item.thumbnail)}"
        loading="lazy"
        decoding="async"
      />
      <div class="drive-thumb-fallback">
        <i class="${escapeHtml(getFileIcon(item.type))}"></i>
      </div>
    </div>
  `;
}

function buildListFiles(items) {
  if (items.length === 0) {
    return `
      <div class="drive-empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>Nenhum arquivo encontrado para essa busca.</p>
      </div>
    `;
  }

  return items
    .map(
      (item) => `
        <article class="drive-file-card drive-file-list" tabindex="0">
          <div class="drive-file-main">
            ${buildThumbnail(item, 'list')}

            <div class="drive-file-content">
              <div class="drive-file-header">
                <h3>${escapeHtml(item.title)}</h3>
                <span class="drive-file-badge">${escapeHtml(getFileBadge(item.type))}</span>
              </div>

              <p>${escapeHtml(item.description || 'Arquivo disponível para abertura ou download.')}</p>

              <div class="drive-file-meta">
                <span class="drive-file-category">
                  <i class="${escapeHtml(item.categoryIcon)}"></i>
                  ${escapeHtml(item.categoryLabel)}
                </span>
              </div>
            </div>
          </div>

          <div class="drive-file-actions">
            ${buildActionLinks(item)}
          </div>
        </article>
      `,
    )
    .join('');
}

function buildGalleryFiles(items) {
  if (items.length === 0) {
    return `
      <div class="drive-empty-state drive-empty-state-gallery">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>Nenhum arquivo encontrado para essa busca.</p>
      </div>
    `;
  }

  return items
    .map(
      (item) => `
        <article class="drive-file-card drive-file-gallery" tabindex="0">
          <div class="drive-gallery-top">
            ${buildThumbnail(item, 'gallery')}

            <div class="drive-gallery-actions">
              ${buildActionLinks(item, true)}
            </div>
          </div>

          <div class="drive-gallery-content">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="drive-file-meta compact">
              <span class="drive-file-category">
                <i class="${escapeHtml(item.categoryIcon)}"></i>
                ${escapeHtml(item.categoryLabel)}
              </span>
              <span class="drive-file-badge">${escapeHtml(getFileBadge(item.type))}</span>
            </div>
          </div>
        </article>
      `,
    )
    .join('');
}

export function setupDocumentsModal({ triggerSelector, modalRootSelector, categories }) {
  const trigger = document.querySelector(triggerSelector);
  const modalRoot = document.querySelector(modalRootSelector);
  const allItems = Array.isArray(categories) ? flattenCategories(categories) : [];

  if (!trigger || !modalRoot || allItems.length === 0) {
    return;
  }

  modalRoot.insertAdjacentHTML(
    'beforeend',
    `
      <div class="modal-overlay" id="documentsModal" aria-hidden="true">
        <div class="modal modal-library modal-drive" role="dialog" aria-modal="true" aria-labelledby="documentsModalTitle">
          <button class="modal-close" id="closeDocumentsModal" aria-label="Fechar modal">×</button>

          <h2 id="documentsModalTitle">Materiais e arquivos</h2>
          <p class="modal-subtitle">
            Busque, ordene e alterne entre lista e galeria para navegar pelos materiais disponíveis.
          </p>

          <div class="drive-toolbar">
            <div class="drive-search-group">
              <label class="sr-only" for="documentsSearch">Buscar arquivo</label>
              <i class="fa-solid fa-magnifying-glass drive-search-icon" aria-hidden="true"></i>
              <input id="documentsSearch" type="search" placeholder="Buscar por nome, tipo ou categoria" />
            </div>

            <div class="drive-controls">
              <div class="drive-sort-group">
                <label class="sr-only" for="documentsSort">Ordenar arquivos</label>
                <select id="documentsSort">
                  <option value="name">Ordenar por nome</option>
                  <option value="category">Ordenar por categoria</option>
                  <option value="type">Ordenar por tipo</option>
                </select>
              </div>

              <div class="drive-view-toggle" role="tablist" aria-label="Tipo de visualização">
                <button type="button" class="drive-view-button active" data-view="list" aria-pressed="true" title="Visualização em lista">
                  <i class="fa-solid fa-list"></i>
                  <span>Lista</span>
                </button>
                <button type="button" class="drive-view-button" data-view="gallery" aria-pressed="false" title="Visualização em galeria">
                  <i class="fa-solid fa-table-cells-large"></i>
                  <span>Galeria</span>
                </button>
              </div>
            </div>
          </div>

          <div class="drive-results-meta" id="documentsResultsMeta" aria-live="polite"></div>
          <div class="drive-files-grid" id="documentsFilesContainer"></div>
        </div>
      </div>
    `,
  );

  const modal = document.getElementById('documentsModal');
  const closeButton = document.getElementById('closeDocumentsModal');
  const searchInput = document.getElementById('documentsSearch');
  const sortSelect = document.getElementById('documentsSort');
  const filesContainer = document.getElementById('documentsFilesContainer');
  const resultsMeta = document.getElementById('documentsResultsMeta');
  const viewButtons = Array.from(modal.querySelectorAll('.drive-view-button'));

  let currentView = 'list';
  let renderFrame = null;
  let lastSignature = '';
  let isDirty = true;
  let thumbnailObserver = null;

  const filterCache = new Map();
  const sortCache = new Map();

  function updateResultsMeta(total) {
    const label = total === 1 ? 'arquivo encontrado' : 'arquivos encontrados';
    resultsMeta.textContent = `${total} ${label}`;
  }

  function getFilteredItems(searchValue) {
    const normalizedQuery = normalizeText(searchValue);

    if (filterCache.has(normalizedQuery)) {
      return filterCache.get(normalizedQuery);
    }

    const filteredItems = !normalizedQuery
      ? allItems
      : allItems.filter((item) => item.searchIndex.includes(normalizedQuery));

    filterCache.set(normalizedQuery, filteredItems);
    return filteredItems;
  }

  function getSortedItems(items, sortValue, searchValue) {
    const cacheKey = `${normalizeText(searchValue)}::${sortValue}`;

    if (sortCache.has(cacheKey)) {
      return sortCache.get(cacheKey);
    }

    const sorted = [...items].sort((first, second) => {
      if (sortValue === 'category') {
        const byCategory = compareText(first.categoryLabel, second.categoryLabel);
        if (byCategory !== 0) return byCategory;
        return compareText(first.title, second.title);
      }

      if (sortValue === 'type') {
        const byType = compareText(getFileBadge(first.type), getFileBadge(second.type));
        if (byType !== 0) return byType;
        return compareText(first.title, second.title);
      }

      return compareText(first.title, second.title);
    });

    sortCache.set(cacheKey, sorted);
    return sorted;
  }

  function destroyThumbnailObserver() {
    if (thumbnailObserver) {
      thumbnailObserver.disconnect();
      thumbnailObserver = null;
    }
  }

  function initLazyThumbnails() {
    destroyThumbnailObserver();

    const images = Array.from(filesContainer.querySelectorAll('.drive-thumb-image[data-thumb]'));

    if (images.length === 0) {
      return;
    }

    const loadImage = (image) => {
      const thumbUrl = image.dataset.thumb;
      if (!thumbUrl || image.dataset.loaded === 'true') {
        return;
      }

      image.src = thumbUrl;
      image.dataset.loaded = 'true';

      image.addEventListener(
        'load',
        () => {
          image.closest('.drive-thumb')?.classList.add('is-loaded');
        },
        { once: true },
      );

      image.addEventListener(
        'error',
        () => {
          image.closest('.drive-thumb')?.classList.add('is-error');
        },
        { once: true },
      );
    };

    if (!('IntersectionObserver' in window)) {
      images.forEach(loadImage);
      return;
    }

    thumbnailObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          loadImage(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        root: modal.querySelector('.modal'),
        rootMargin: '220px 0px',
        threshold: 0.01,
      },
    );

    images.forEach((image) => thumbnailObserver.observe(image));
  }

  function performRender() {
    renderFrame = null;

    const searchValue = searchInput.value;
    const sortValue = sortSelect.value;
    const filteredItems = getFilteredItems(searchValue);
    const sortedItems = getSortedItems(filteredItems, sortValue, searchValue);
    const signature = `${currentView}::${sortValue}::${normalizeText(searchValue)}::${sortedItems.map((item) => item.id || item.title).join('|')}`;

    if (!isDirty && signature === lastSignature) {
      return;
    }

    filesContainer.classList.toggle('gallery-mode', currentView === 'gallery');
    filesContainer.classList.toggle('list-mode', currentView !== 'gallery');
    filesContainer.innerHTML = currentView === 'gallery'
      ? buildGalleryFiles(sortedItems)
      : buildListFiles(sortedItems);

    initLazyThumbnails();
    updateResultsMeta(sortedItems.length);
    lastSignature = signature;
    isDirty = false;
  }

  function renderFiles() {
    if (renderFrame !== null) {
      window.cancelAnimationFrame(renderFrame);
    }

    renderFrame = window.requestAnimationFrame(performRender);
  }

  function setView(view) {
    if (currentView === view) {
      return;
    }

    currentView = view;
    isDirty = true;

    viewButtons.forEach((button) => {
      const isActive = button.dataset.view === view;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    renderFiles();
  }

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    isDirty = true;
    renderFiles();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    destroyThumbnailObserver();
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

  const debouncedSearch = debounce(() => {
    isDirty = true;
    renderFiles();
  });

  searchInput.addEventListener('input', debouncedSearch);
  sortSelect.addEventListener('change', () => {
    isDirty = true;
    renderFiles();
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setView(button.dataset.view || 'list');
    });
  });

  renderFiles();
}

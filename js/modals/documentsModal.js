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

function buildTabs(categories) {
  return categories
    .map(
      (category, index) => `
        <button
          class="library-tab ${index === 0 ? 'active' : ''}"
          type="button"
          role="tab"
          aria-selected="${index === 0 ? 'true' : 'false'}"
          data-library-tab="${escapeHtml(category.id)}"
        >
          <i class="${escapeHtml(category.icon || 'fa-regular fa-folder')}"></i>
          <span>${escapeHtml(category.label)}</span>
        </button>
      `,
    )
    .join('');
}

function buildPanels(categories) {
  return categories
    .map(
      (category, index) => `
        <section
          class="library-panel ${index === 0 ? 'active' : ''}"
          role="tabpanel"
          data-library-panel="${escapeHtml(category.id)}"
          ${index === 0 ? '' : 'hidden'}
        >
          <div class="library-grid">
            ${category.items
              .map(
                (item) => `
                  <article class="library-card">
                    <div class="library-card-top">
                      <div class="library-file-icon">
                        <i class="${item.type === 'external' ? 'fa-solid fa-arrow-up-right-from-square' : 'fa-regular fa-file-lines'}"></i>
                      </div>

                      <div class="library-card-body">
                        <div class="library-card-header">
                          <h3>${escapeHtml(item.title)}</h3>
                          <span class="library-badge">${escapeHtml(getFileBadge(item.type))}</span>
                        </div>
                        <p>${escapeHtml(item.description || 'Arquivo disponível para abertura ou download.')}</p>
                      </div>
                    </div>

                    <div class="library-card-actions">
                      <a
                        class="library-action secondary"
                        href="${escapeHtml(item.href)}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir
                      </a>

                      ${item.type === 'external'
                        ? ''
                        : `
                        <a
                          class="library-action"
                          href="${escapeHtml(item.href)}"
                          download="${escapeHtml(item.downloadName || item.title)}"
                        >
                          Baixar
                        </a>
                      `}
                    </div>
                  </article>
                `,
              )
              .join('')}
          </div>
        </section>
      `,
    )
    .join('');
}

export function setupDocumentsModal({ triggerSelector, modalRootSelector, categories }) {
  const trigger = document.querySelector(triggerSelector);
  const modalRoot = document.querySelector(modalRootSelector);

  if (!trigger || !modalRoot || !Array.isArray(categories) || categories.length === 0) {
    return;
  }

  modalRoot.insertAdjacentHTML(
    'beforeend',
    `
      <div class="modal-overlay" id="documentsModal" aria-hidden="true">
        <div class="modal modal-library" role="dialog" aria-modal="true" aria-labelledby="documentsModalTitle">
          <button class="modal-close" id="closeDocumentsModal" aria-label="Fechar modal">×</button>

          <h2 id="documentsModalTitle">Materiais e arquivos</h2>
          <p class="modal-subtitle">
            Abra o material em uma nova guia ou faça o download direto para o seu dispositivo.
          </p>

          <div class="library-tabs" role="tablist" aria-label="Categorias de materiais">
            ${buildTabs(categories)}
          </div>

          <div class="library-panels">
            ${buildPanels(categories)}
          </div>
        </div>
      </div>
    `,
  );

  const modal = document.getElementById('documentsModal');
  const closeButton = document.getElementById('closeDocumentsModal');
  const tabs = [...modal.querySelectorAll('[data-library-tab]')];
  const panels = [...modal.querySelectorAll('[data-library-panel]')];

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function activateTab(categoryId) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.libraryTab === categoryId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.libraryPanel === categoryId;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
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

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.libraryTab));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

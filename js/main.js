import { documentsLibrary } from './data/documentsData.js';
import { setupCalculatorModal } from './modals/calculatorModal.js';
import { setupDocumentsModal } from './modals/documentsModal.js';
import { setupVideosModal } from './modals/videosModal.js';

const guides = documentsLibrary.filter((item) => item.type !== 'video');
const videos = documentsLibrary.filter((item) => item.type === 'video');

setupCalculatorModal({
  triggerSelector: '#calculator',
  modalRootSelector: '#modal-root',
});

setupDocumentsModal({
  triggerSelector: '#guides',
  modalRootSelector: '#modal-root',
  documents: guides,
});

setupVideosModal({
  triggerSelector: '#videos',
  modalRootSelector: '#modal-root',
  videos,
});

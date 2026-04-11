import { documentsLibrary } from './data/documentsData.js';
import { setupCalculatorModal } from './modals/calculatorModal.js';
import { setupDocumentsModal } from './modals/documentsModal.js';

setupCalculatorModal({
  triggerSelector: '#calculator',
  modalRootSelector: '#modal-root',
});

setupDocumentsModal({
  triggerSelector: '#materials-library',
  modalRootSelector: '#modal-root',
  documents: documentsLibrary,
});

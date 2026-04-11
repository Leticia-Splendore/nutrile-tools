export function setupCalculatorModal({ triggerSelector, modalRootSelector }) {
  const trigger = document.querySelector(triggerSelector);
  const modalRoot = document.querySelector(modalRootSelector);

  modalRoot.innerHTML = `
    <div class="modal-overlay" id="calculatorModal" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="calculatorTitle">
        <button class="modal-close" id="closeCalculatorModal" aria-label="Fechar modal">×</button>

        <h2 id="calculatorTitle">Calculadora peso cru × peso cozido</h2>
        <p class="modal-subtitle">
          Informe o alimento, o peso cozido e quantas refeições deseja preparar.
        </p>

        <div class="calculator-form">
          <div class="form-group">
            <label for="foodType">Alimento</label>
            <select id="foodType">
              <option value="0.7">Carnes (todos os tipos)</option>
              <option value="2.5">Proteína de soja</option>
              <option value="2.4">Macarrão</option>
              <option value="2.8">Arroz</option>
              <option value="1.8">Leguminosas (feijão, lentilha, grão de bico)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="cookedWeight">Peso cozido por refeição (g)</label>
            <input type="number" id="cookedWeight" min="1" step="1" placeholder="Ex.: 65" />
          </div>

          <div class="form-group">
            <label for="mealCount">Número de refeições</label>
            <input type="number" id="mealCount" min="1" step="1" value="1" />
          </div>

          <button class="calculate-btn" id="calculateButton" type="button" disabled>
            Calcular
          </button>
        </div>

        <div class="result-card" id="resultCard" hidden>
          <p><strong>Quantidade crua por refeição:</strong> <span id="rawWeightPerMeal">-</span></p>
          <p><strong>Quantidade crua total:</strong> <span id="rawWeightTotal">-</span></p>
        </div>
      </div>
    </div>
  `;

  const modal = document.getElementById('calculatorModal');
  const closeButton = document.getElementById('closeCalculatorModal');
  const calculateButton = document.getElementById('calculateButton');
  const foodType = document.getElementById('foodType');
  const cookedWeight = document.getElementById('cookedWeight');
  const mealCount = document.getElementById('mealCount');
  const resultCard = document.getElementById('resultCard');
  const rawWeightPerMeal = document.getElementById('rawWeightPerMeal');
  const rawWeightTotal = document.getElementById('rawWeightTotal');

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function formatWeight(value) {
    return `${Math.ceil(value)}g`;
  }

  function validateForm() {
    const cooked = Number(cookedWeight.value);
    const meals = Number(mealCount.value);

    calculateButton.disabled = !(
      cooked > 0 &&
      meals > 0 &&
      foodType.value !== ''
    );
  }

  function calculateRawWeight() {
    const factor = Number(foodType.value);
    const cooked = Number(cookedWeight.value);
    const meals = Number(mealCount.value);

    const rawPerMeal = cooked / factor;
    const rawTotal = rawPerMeal * meals;
    const refeicaoLabel = meals === 1 ? 'refeição' : 'refeições';

    resultCard.hidden = false;
    rawWeightPerMeal.textContent = formatWeight(rawPerMeal);
    rawWeightTotal.textContent = `${formatWeight(rawTotal)} para ${meals} ${refeicaoLabel}`;
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
  });

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  cookedWeight.addEventListener('input', validateForm);
  mealCount.addEventListener('input', validateForm);
  foodType.addEventListener('change', validateForm);
  calculateButton.addEventListener('click', calculateRawWeight);
}

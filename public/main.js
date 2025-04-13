document.addEventListener('DOMContentLoaded', () => {
  // Existing variables
  const toggleSidebarButton = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  const generateButton = document.getElementById('generateButton');
  const primeGrid = document.getElementById('primeGrid');
  const primeSetsContainer = document.getElementById('primeSets');
  const shapeToggles = document.querySelectorAll('.shape-toggle');

  // New button variables
  const setMinMaxButton = document.getElementById('setMinMaxButton');
  const setInnerPrimesButton = document.getElementById('setInnerPrimesButton');

  let primes = []; // Stores all generated primes
  let selectedPrimes = new Set(); // Stores currently clicked primes in grid
  let activeShape = null; // Shape count if a shape button is active
  let primeSets = []; // Array to store ALL created sets (shape, minmax, inner)

  // --- Sidebar Toggle Functionality ---
  toggleSidebarButton.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      const icon = toggleSidebarButton.querySelector('i');
      icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
  });

  // --- Prime Number Functions ---
  function isPrime(num) { /* ... (no changes) ... */
      if (num < 2) return false;
      for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
          if (num % i === 0) return false;
      }
      return true;
  }
  function generatePrimes(count) { /* ... (no changes) ... */
      const result = [];
      let num = 2;
      while (result.length < count) {
          if (isPrime(num)) { result.push(num); }
          num++;
      }
      return result;
  }

  // --- Grid Display and Interaction ---
  function displayPrimes(primesToDisplay) { /* ... (no changes) ... */
      primeGrid.innerHTML = '';
      primesToDisplay.forEach(prime => {
          const primeElement = document.createElement('div');
          primeElement.textContent = prime;
          primeElement.dataset.prime = prime;
          primeElement.addEventListener('click', () => {
              togglePrimeSelection(primeElement, prime);
          });
          primeGrid.appendChild(primeElement);
      });
      const initialMsgGrid = primeGrid.querySelector('p');
      if (initialMsgGrid) initialMsgGrid.remove();
  }
  function togglePrimeSelection(element, prime) { /* ... (no changes) ... */
       if (selectedPrimes.has(prime)) {
          selectedPrimes.delete(prime);
          element.classList.remove('selected');
      } else {
          selectedPrimes.add(prime);
          element.classList.add('selected');
      }
  }
  function clearGridSelection() { /* ... (no changes) ... */
      document.querySelectorAll('#primeGrid div.selected').forEach(el => {
          el.classList.remove('selected');
      });
      selectedPrimes.clear();
  }

  // --- Event Listener for Generate Primes Button ---
  generateButton.addEventListener('click', () => { /* ... (no changes) ... */
      primes = generatePrimes(500);
      displayPrimes(primes);
      clearGridSelection();
      primeSets = [];
      renderPrimeSets();
      activeShape = null;
      shapeToggles.forEach(btn => btn.classList.remove('active'));
  });

  // --- Shape Toggle Logic ---
  shapeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
          const shapeSides = parseInt(toggle.dataset.sides);
          if (toggle.classList.contains('active')) {
               // Optional: Deactivate
               // toggle.classList.remove('active');
               // activeShape = null;
          } else {
               shapeToggles.forEach(btn => btn.classList.remove('active'));
               toggle.classList.add('active');
               activeShape = shapeSides;
               // Attempt to generate a SHAPE set *if* the correct number is selected
               generateShapeSet(activeShape);
          }
      });
  });

   // --- New Relation Button Listeners ---
  setMinMaxButton.addEventListener('click', () => {
      generateMinMaxSet();
  });

  setInnerPrimesButton.addEventListener('click', () => {
      generateInnerPrimesSet();
  });

  // --- Set Generation Functions ---

  // Generates set based on SHAPE COUNT
  function generateShapeSet(numSides) {
      if (!numSides || selectedPrimes.size !== numSides) {
           if (numSides && selectedPrimes.size > 0) {
               alert(`Shape requires ${numSides} primes, but ${selectedPrimes.size} are selected.`);
           }
          return; // Exit if wrong count or no shape active
      }
      const newSetArray = Array.from(selectedPrimes).sort((a, b) => a - b);
      addPrimeSet({ set: newSetArray, type: 'shape', shape: numSides });
      clearGridSelection();
       // Optional: Deactivate shape button after use
      // const activeButton = document.querySelector(`.shape-toggle[data-sides="${numSides}"]`);
      // if (activeButton) activeButton.classList.remove('active');
      // activeShape = null;
  }

  // Generates set from MIN/MAX of current selection
  function generateMinMaxSet() {
      if (selectedPrimes.size < 2) {
          alert("Please select at least 2 primes to define Min/Max.");
          return;
      }
      const selectedArray = Array.from(selectedPrimes);
      const minP = Math.min(...selectedArray);
      const maxP = Math.max(...selectedArray);
      addPrimeSet({ set: [minP, maxP], type: 'minmax', sourceSetSize: selectedPrimes.size });
      clearGridSelection();
  }

  // Generates set of primes BETWEEN min/max of current selection
  function generateInnerPrimesSet() {
      if (selectedPrimes.size < 2) {
          alert("Please select at least 2 primes to define a range.");
          return;
      }
      if (primes.length === 0) {
           alert("Please generate primes first.");
           return;
      }
      const selectedArray = Array.from(selectedPrimes);
      const minP = Math.min(...selectedArray);
      const maxP = Math.max(...selectedArray);
      const innerPrimes = primes.filter(p => p > minP && p < maxP).sort((a, b) => a - b);

      if (innerPrimes.length === 0) {
          alert(`No generated primes found between ${minP} and ${maxP}.`);
          return;
      }
      addPrimeSet({ set: innerPrimes, type: 'inner', bounds: [minP, maxP], sourceSetSize: selectedPrimes.size });
      clearGridSelection();
  }

  // Helper function to add sets (avoids duplicates if needed)
  function addPrimeSet(newSetData) {
       // Simple duplicate check based on type and stringified set content
       const newSetString = JSON.stringify(newSetData.set);
       const exists = primeSets.some(ps => ps.type === newSetData.type && JSON.stringify(ps.set) === newSetString);

       if (!exists) {
          primeSets.push(newSetData);
          renderPrimeSets(); // Update the sidebar display
       } else {
           alert(`This exact set of type "${newSetData.type}" already exists.`);
       }
  }

  // --- Prime Set Rendering (UPDATED) ---
  function renderPrimeSets() {
      primeSetsContainer.innerHTML = ''; // Clear previous list
      if (primeSets.length === 0) {
           primeSetsContainer.innerHTML = '<p class="empty-sets-message" style="font-size: 0.8em; padding: 5px;">Select primes and click a shape or relation button.</p>';
           return;
      }

      // Sort sets perhaps? (Optional, e.g., by type then first number)
      // primeSets.sort((a, b) => { /* ... */ });

      primeSets.forEach((primeSetData, index) => {
          const setDiv = document.createElement('div');
          setDiv.classList.add('prime-set');
          setDiv.dataset.index = index;
          setDiv.dataset.setType = primeSetData.type; // Add type attribute for potential styling

          let label = '';
          let title = `Set: ${primeSetData.set.join(', ')}`; // Base title

          // Determine label based on type
          switch (primeSetData.type) {
              case 'shape':
                  label = `Shape ${primeSetData.shape}: `;
                  title = `Shape: ${primeSetData.shape}, ${title}`;
                  break;
              case 'minmax':
                  label = `Min/Max (from ${primeSetData.sourceSetSize}): `;
                  title = `Min/Max from ${primeSetData.sourceSetSize} selected primes. ${title}`;
                  break;
              case 'inner':
                  label = `Inner (${primeSetData.bounds[0]}-${primeSetData.bounds[1]}): `;
                  title = `Inner primes between ${primeSetData.bounds[0]} and ${primeSetData.bounds[1]} (from ${primeSetData.sourceSetSize} selected). ${title}`;
                  break;
              default:
                  label = 'Set: ';
          }

          // Limit displayed numbers for long inner sets
          const maxDisplayedNumbers = 10;
          let displayNumbers = primeSetData.set.join(', ');
          if (primeSetData.set.length > maxDisplayedNumbers) {
              displayNumbers = primeSetData.set.slice(0, maxDisplayedNumbers).join(', ') + '...';
              title += ` (${primeSetData.set.length} total)`; // Add count to title
          }


          setDiv.innerHTML = `
              <div class="prime-set-numbers" title="${title}"><strong>${label}</strong>${displayNumbers}</div>
              <div class="prime-set-actions">
                  <button class="copy-button" title="Copy Set JSON"><i class="fas fa-copy"></i></button>
                  <button class="json-button" title="Download JSON"><i class="fas fa-file-download"></i></button>
                  <button class="delete-button" title="Delete Set"><i class="fas fa-trash-alt"></i></button>
              </div>
          `;

          // Attach event listeners
          const copyButton = setDiv.querySelector('.copy-button');
          const jsonButton = setDiv.querySelector('.json-button');
          const deleteButton = setDiv.querySelector('.delete-button');

          copyButton.addEventListener('click', (e) => { e.stopPropagation(); copySetToClipboard(index, copyButton); });
          jsonButton.addEventListener('click', (e) => { e.stopPropagation(); downloadSetAsJson(index); });
          deleteButton.addEventListener('click', (e) => { e.stopPropagation(); deletePrimeSet(index); });
          setDiv.addEventListener('click', () => { toggleSetDetails(setDiv, index); });

          primeSetsContainer.appendChild(setDiv);
      });
  }

  // --- Delete Prime Set ---
  function deletePrimeSet(index) { /* ... (no changes needed, maybe update confirm message) ... */
      if (index < 0 || index >= primeSets.length) return;
      if (confirm(`Delete Set: [${primeSets[index].set.slice(0, 5).join(', ')}...]?`)) {
          primeSets.splice(index, 1);
          renderPrimeSets();
      }
  }

  // --- Set Actions (Copy, JSON, Details) ---
  function copySetToClipboard(index, buttonElement) { /* ... (no changes) ... */
      if (index < 0 || index >= primeSets.length) return;
      const primeSet = primeSets[index].set; // Copy just the array of numbers
      navigator.clipboard.writeText(JSON.stringify(primeSet))
          .then(() => { /*...feedback...*/ })
          .catch(err => { /*...error...*/ });
  }
  function downloadSetAsJson(index) { /* ... (no changes, filename could be improved) ... */
      if (index < 0 || index >= primeSets.length) return;
      const primeSetData = primeSets[index]; // Download the whole object (set, type, etc.)
      const jsonData = JSON.stringify(primeSetData, null, 2);
      // Generate filename based on type
      let baseName = `prime_set_${primeSetData.type}`;
      if (primeSetData.shape) baseName += `_${primeSetData.shape}`;
      if (primeSetData.bounds) baseName += `_${primeSetData.bounds[0]}-${primeSetData.bounds[1]}`;
      const filename = `${baseName}_${index + 1}.json`;

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a);
      a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
 function toggleSetDetails(setDiv, index) { /* ... (minor update to display details based on type) ... */
      if (index < 0 || index >= primeSets.length) return;
      let detailsDiv = setDiv.querySelector('.prime-set-details');
      const isExpanding = !setDiv.classList.contains('expanded');
      setDiv.classList.toggle('expanded', isExpanding);

      if (isExpanding) {
          if (!detailsDiv) {
              detailsDiv = document.createElement('div');
              detailsDiv.classList.add('prime-set-details');
              setDiv.appendChild(detailsDiv);
          }
          const setData = primeSets[index];
          const primeSet = setData.set;
          const count = primeSet.length;
          const sum = count > 0 ? primeSet.reduce((a, b) => a + b, 0) : 0;
          const avg = count > 0 ? (sum / count).toFixed(2) : 'N/A';
          const min = count > 0 ? primeSet[0] : 'N/A'; // Assumes sorted inner primes
          const max = count > 0 ? primeSet[count - 1] : 'N/A'; // Assumes sorted inner primes

          let typeInfo = `Type: ${setData.type}<br>`;
          if (setData.shape) typeInfo += `Shape Count: ${setData.shape}<br>`;
          if (setData.bounds) typeInfo += `Range: ${setData.bounds[0]} - ${setData.bounds[1]}<br>`;
          if (setData.sourceSetSize) typeInfo += `Source Selection Size: ${setData.sourceSetSize}<br>`;

          detailsDiv.innerHTML = `
              ${typeInfo}
              Count: ${count}<br>
              Sum: ${sum}<br>
              Average: ${avg}<br>
              Min: ${min}, Max: ${max}
          `;
      } else {
          if (detailsDiv) { detailsDiv.remove(); }
      }
  }

  // --- Initial Setup ---
  primeGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Click "Generate Primes" to start.</p>';
  renderPrimeSets(); // Render initial empty state

});
document.addEventListener('DOMContentLoaded', () => {
  const toggleSidebarButton = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  const generateButton = document.getElementById('generateButton');
  const primeGrid = document.getElementById('primeGrid');
  const primeSetsContainer = document.getElementById('primeSets');
  const shapeToggles = document.querySelectorAll('.shape-toggle');

  let primes = [];
  let selectedPrimes = new Set();
  let activeShape = null;
  let primeSets = []; // Array to store the created sets [{set: [p1, p2,...], shape: N}, ...]

  // --- Sidebar Toggle Functionality ---
  toggleSidebarButton.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed'); // Toggle and check state
      const icon = toggleSidebarButton.querySelector('i');

      if (isCollapsed) {
          icon.classList.remove('fa-chevron-left');
          icon.classList.add('fa-chevron-right');
      } else {
          icon.classList.remove('fa-chevron-right');
          icon.classList.add('fa-chevron-left');
      }
      // No direct manipulation of main content width needed
  });

  // --- Prime Number Functions ---
  function isPrime(num) {
      if (num < 2) return false;
      // Optimization: Check divisibility up to the square root
      for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
          if (num % i === 0) return false;
      }
      return true;
  }

  function generatePrimes(count) {
      const result = [];
      let num = 2;
      while (result.length < count) {
          if (isPrime(num)) {
              result.push(num);
          }
          num++;
      }
      return result;
  }

  // --- Grid Display and Interaction ---
  function displayPrimes(primesToDisplay) {
      primeGrid.innerHTML = ''; // Clear previous grid
      primesToDisplay.forEach(prime => {
          const primeElement = document.createElement('div');
          primeElement.textContent = prime;
          primeElement.dataset.prime = prime; // Store prime value in data attribute

          // Add click listener for selection
          primeElement.addEventListener('click', () => {
              togglePrimeSelection(primeElement, prime);
          });

          primeGrid.appendChild(primeElement);
      });
       // Remove initial message if present
      const initialMsgGrid = primeGrid.querySelector('p');
      if (initialMsgGrid) initialMsgGrid.remove();
  }

  function togglePrimeSelection(element, prime) {
       if (selectedPrimes.has(prime)) {
          selectedPrimes.delete(prime);
          element.classList.remove('selected');
      } else {
          selectedPrimes.add(prime);
          element.classList.add('selected');
      }
      // Optional: Check immediately if the current selection matches the active shape
      // if (activeShape && selectedPrimes.size === activeShape) {
      //     generatePrimeSetForShape(activeShape);
      // }
  }

  function clearGridSelection() {
      document.querySelectorAll('#primeGrid div.selected').forEach(el => {
          el.classList.remove('selected');
      });
      selectedPrimes.clear();
  }


  // --- Event Listener for Generate Primes Button ---
  generateButton.addEventListener('click', () => {
      primes = generatePrimes(500); // Generate primes
      displayPrimes(primes);
      clearGridSelection(); // Clear selections from previous grid
      primeSets = []; // Clear existing sets when new primes are generated
      renderPrimeSets(); // Update sidebar display
      activeShape = null; // Reset active shape filter
      shapeToggles.forEach(btn => btn.classList.remove('active')); // Deactivate shape buttons
  });

  // --- Shape Toggle Logic ---
  shapeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
          const shapeSides = parseInt(toggle.dataset.sides);
          if (toggle.classList.contains('active')) {
              // Optional: Clicking active toggle deactivates it
              // toggle.classList.remove('active');
              // activeShape = null;
          } else {
               shapeToggles.forEach(btn => btn.classList.remove('active'));
               toggle.classList.add('active');
               activeShape = shapeSides;
               // Attempt to generate a set *if* the correct number is selected
               generatePrimeSetForShape(activeShape);
          }
      });
  });

  // --- Prime Set Generation and Rendering ---
  function generatePrimeSetForShape(numSides) {
      if (!numSides) return; // No active shape selected

      if (selectedPrimes.size === numSides) {
          // Create the new set, sort numbers for consistency
          const newSetArray = Array.from(selectedPrimes).sort((a, b) => a - b);

           // Check if this exact set already exists
           const setExists = primeSets.some(ps =>
               ps.shape === numSides &&
               ps.set.length === newSetArray.length &&
               ps.set.every((val, idx) => val === newSetArray[idx])
           );

           if (!setExists) {
               primeSets.push({ set: newSetArray, shape: numSides }); // Store set and shape type
               renderPrimeSets(); // Update the sidebar display
               clearGridSelection(); // Clear selection in the grid
               // Optional: Deactivate shape button
               // const activeButton = document.querySelector(`.shape-toggle[data-sides="${numSides}"]`);
               // if (activeButton) activeButton.classList.remove('active');
               // activeShape = null;
           } else {
               alert(`The set [${newSetArray.join(', ')}] already exists.`);
               clearGridSelection(); // Still clear selection
           }

      } else if (selectedPrimes.size > 0) { // Only alert if trying to form a set
          alert(`Please select exactly ${numSides} prime number(s) to form a set for the selected shape. You have selected ${selectedPrimes.size}.`);
      }
  }

  function renderPrimeSets() {
      primeSetsContainer.innerHTML = ''; // Clear previous list
      if (primeSets.length === 0) {
           primeSetsContainer.innerHTML = '<p class="empty-sets-message" style="font-size: 0.8em; padding: 5px;">Select primes and click a shape button to create sets.</p>';
           return;
      }

      primeSets.forEach((primeSetData, index) => {
          const setDiv = document.createElement('div');
          setDiv.classList.add('prime-set');
          setDiv.dataset.index = index; // Store index for reference

          setDiv.innerHTML = `
              <div class="prime-set-numbers" title="Shape: ${primeSetData.shape}, Set: ${primeSetData.set.join(', ')}">${primeSetData.set.join(', ')}</div>
              <div class="prime-set-actions">
                  <button class="copy-button" title="Copy Set"><i class="fas fa-copy"></i></button>
                  <button class="json-button" title="Download JSON"><i class="fas fa-file-download"></i></button>
                  <button class="delete-button" title="Delete Set"><i class="fas fa-trash-alt"></i></button>
              </div>
          `;

          // Attach event listeners AFTER innerHTML is set
          const copyButton = setDiv.querySelector('.copy-button');
          const jsonButton = setDiv.querySelector('.json-button');
          const deleteButton = setDiv.querySelector('.delete-button');

          copyButton.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent set details from toggling
              copySetToClipboard(index, copyButton);
          });

          jsonButton.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent set details from toggling
              downloadSetAsJson(index);
          });

          deleteButton.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent set details from toggling
              deletePrimeSet(index);
          });


          // Add click listener to the *whole* setDiv for toggling details
          setDiv.addEventListener('click', () => {
              toggleSetDetails(setDiv, index);
          });


          primeSetsContainer.appendChild(setDiv);
      });
  }

  // --- Delete Prime Set ---
  function deletePrimeSet(index) {
      if (index < 0 || index >= primeSets.length) return; // Bounds check
      // Optional: Confirmation dialog
      if (confirm(`Are you sure you want to delete the set: [${primeSets[index].set.join(', ')}]?`)) {
          primeSets.splice(index, 1); // Remove the set from the array
          renderPrimeSets(); // Re-render the list
      }
  }


  // --- Set Actions (Copy, JSON, Details) ---
  function copySetToClipboard(index, buttonElement) {
      if (index < 0 || index >= primeSets.length) return; // Bounds check
      const primeSet = primeSets[index].set;
      navigator.clipboard.writeText(JSON.stringify(primeSet))
          .then(() => {
              // Provide visual feedback on the button itself
              const originalIcon = buttonElement.innerHTML;
              buttonElement.innerHTML = '<i class="fas fa-check"></i>'; // Checkmark icon
              buttonElement.classList.add('copied');
              setTimeout(() => {
                  // Check if the button still exists before restoring icon
                  if(buttonElement) {
                     buttonElement.innerHTML = originalIcon; // Restore icon
                     buttonElement.classList.remove('copied');
                  }
              }, 1500);
          })
          .catch(err => {
              console.error('Failed to copy set: ', err);
              alert('Failed to copy set to clipboard.');
          });
  }

  function downloadSetAsJson(index) {
      if (index < 0 || index >= primeSets.length) return; // Bounds check
      const primeSetData = primeSets[index];
      const jsonData = JSON.stringify(primeSetData, null, 2); // Pretty print JSON
      const filename = `prime_set_shape_${primeSetData.shape}_${index + 1}.json`;
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a); // Append link to body
      a.click(); // Simulate click to trigger download
      document.body.removeChild(a); // Remove link
      URL.revokeObjectURL(url); // Free up memory
  }

 function toggleSetDetails(setDiv, index) {
      if (index < 0 || index >= primeSets.length) return; // Bounds check

      // Find if a details div already exists within this setDiv
      let detailsDiv = setDiv.querySelector('.prime-set-details');
      const isExpanding = !setDiv.classList.contains('expanded'); // Check if we are about to expand

      setDiv.classList.toggle('expanded', isExpanding); // Toggle the class

      if (isExpanding) {
          if (!detailsDiv) { // If details div doesn't exist, create it
              detailsDiv = document.createElement('div');
              detailsDiv.classList.add('prime-set-details');
              setDiv.appendChild(detailsDiv); // Append it inside the setDiv
          }
          // Populate details (example)
          const setData = primeSets[index];
          const primeSet = setData.set;
          const sum = primeSet.reduce((a, b) => a + b, 0);
          const avg = primeSet.length > 0 ? (sum / primeSet.length).toFixed(2) : 'N/A';
          detailsDiv.innerHTML = `
              Shape: ${setData.shape}<br>
              Count: ${primeSet.length}<br>
              Sum: ${sum}<br>
              Average: ${avg}<br>
              Min: ${primeSet.length > 0 ? primeSet[0] : 'N/A'}, Max: ${primeSet.length > 0 ? primeSet[primeSet.length - 1] : 'N/A'}
          `; // Example details
      } else {
          if (detailsDiv) { // If details div exists and we are collapsing, remove it
              detailsDiv.remove();
          }
      }
  }


  // --- Initial Setup ---
  primeGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Click "Generate Primes" to start.</p>';
  renderPrimeSets(); // Render initial empty state for sets

});
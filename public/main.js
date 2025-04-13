document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const toggleSidebarButton = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const generateButton = document.getElementById('generateButton');
    const primeGrid = document.getElementById('primeGrid');
    const primeSetsContainer = document.getElementById('primeSets');
    const shapeToggles = document.querySelectorAll('.shape-toggle');
    const setMinMaxButton = document.getElementById('setMinMaxButton');
    const setInnerPrimesButton = document.getElementById('setInnerPrimesButton');
    const baseInput = document.getElementById('baseInput');
    const applyBaseButton = document.getElementById('applyBaseButton');
    const primeCountInput = document.getElementById('primeCountInput');

    // State Variables
    let primes = [];
    let selectedPrimes = new Set();
    let activeShape = null;
    let primeSets = [];
    let currentBase = 10;

    // --- Sidebar Toggle Functionality ---
    toggleSidebarButton.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        const icon = toggleSidebarButton.querySelector('i');
        icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    });

    // --- Prime Number Generation Logic ---
    function isPrime(num) {
        if (num < 2) return false;
        // Optimization: Check up to sqrt(num)
        for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
            if (num % i === 0) return false;
        }
        return true;
    }

    function generatePrimes(count) {
        // Basic prime generation loop
        // Note: Performance degrades significantly for very high counts
        console.time(`generatePrimes(${count})`); // Start performance timer
        const result = [];
        let num = 2;
        while (result.length < count) {
            if (isPrime(num)) {
                result.push(num);
            }
            num++;
            // Add a safety break for extremely large numbers in case of unexpected loop
            if (num > count * 20 && count > 1000) { // Heuristic safety break
                 console.warn(`generatePrimes safety break triggered at num=${num} for count=${count}`);
                 break;
            }
        }
        console.timeEnd(`generatePrimes(${count})`); // End performance timer
        return result;
    }

    // --- Grid Display and Interaction ---
    function displayPrimes(primesToDisplay) {
        console.time(`displayPrimes(${primesToDisplay.length})`);
        primeGrid.innerHTML = ''; // Clear previous grid
        // Using DocumentFragment for potentially better performance with large counts
        const fragment = document.createDocumentFragment();
        primesToDisplay.forEach(prime => {
            const primeElement = document.createElement('div');
            primeElement.textContent = prime.toString(currentBase).toUpperCase();
            primeElement.dataset.prime = prime; // Store base-10 value
            primeElement.title = `Base 10: ${prime}`; // Tooltip

            primeElement.addEventListener('click', () => {
                togglePrimeSelection(primeElement, prime);
            });
            fragment.appendChild(primeElement);
        });
        primeGrid.appendChild(fragment); // Append fragment once
        console.timeEnd(`displayPrimes(${primesToDisplay.length})`);

        const initialMsgGrid = primeGrid.querySelector('p');
        if (initialMsgGrid) initialMsgGrid.remove();
    }

    function togglePrimeSelection(element, primeValue) {
        if (selectedPrimes.has(primeValue)) {
            selectedPrimes.delete(primeValue);
            element.classList.remove('selected');
        } else {
            selectedPrimes.add(primeValue);
            element.classList.add('selected');
        }
    }

    function clearGridSelection() {
        document.querySelectorAll('#primeGrid div.selected').forEach(el => {
            el.classList.remove('selected');
        });
        selectedPrimes.clear();
    }

    // --- Base Input Handling ---
    function handleBaseChange() {
        const newBase = parseInt(baseInput.value, 10);
        const minBase = parseInt(baseInput.min, 10) || 2;
        const maxBase = parseInt(baseInput.max, 10) || 36;

        if (isNaN(newBase) || newBase < minBase || newBase > maxBase) {
            alert(`Invalid Base. Please enter a number between ${minBase} and ${maxBase}.`);
            baseInput.value = currentBase;
            return false;
        }

        if (newBase !== currentBase) {
            currentBase = newBase;
            console.log("Base changed to:", currentBase);
            // If primes exist, only redisplay them with the new base
            if (primes.length > 0) {
                console.time(`redisplay Base Change ${primes.length}`);
                displayPrimes(primes); // Update display with new base
                renderPrimeSets();    // Update sidebar sets display
                console.timeEnd(`redisplay Base Change ${primes.length}`);
            }
        }
        return true;
    }

    // --- Central Function to Generate/Regenerate Primes ---
    function triggerPrimeGeneration() {
        // 1. Get and Validate Prime Count
        const countValue = primeCountInput.value;
        let primeCount = parseInt(countValue, 10);
        const minCount = parseInt(primeCountInput.min, 10) || 10;
        const maxCount = parseInt(primeCountInput.max, 10) || 25000; // Use updated max

        if (isNaN(primeCount) || primeCount < minCount || primeCount > maxCount) {
            // Update validation message
            alert(`Invalid Prime Count. Please enter a number between ${minCount} and ${maxCount}.`);
            primeCountInput.value = Math.max(minCount, Math.min(maxCount, parseInt(primeCountInput.defaultValue, 10) || 100));
            return; // Stop if count is invalid
        }

        // Add a console warning for potentially slow operations
        if (primeCount > 15000) {
             console.warn(`Requesting ${primeCount} primes. Displaying this many elements might be slow.`);
        }

        // Base (currentBase) should be up-to-date
        console.log(`Generating ${primeCount} primes... (Display Base: ${currentBase})`);

        // 2. Generate Primes
        primes = generatePrimes(primeCount); // Generate base-10 primes

        // 3. Display and Reset State
        displayPrimes(primes); // Display uses currentBase
        clearGridSelection();
        primeSets = [];
        renderPrimeSets(); // Render uses currentBase for display
        activeShape = null;
        shapeToggles.forEach(btn => btn.classList.remove('active'));
        console.log(`Generated ${primes.length} Primes (Base 10):`, primes.slice(0,10));
    }


    // --- Event Listeners ---
    applyBaseButton.addEventListener('click', handleBaseChange);
    baseInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBaseChange(); // Only handle base change, don't regenerate primes here
        }
    });
    // Use 'change' which fires on blur or Enter if value changed
    baseInput.addEventListener('change', handleBaseChange);

    // Generate Button triggers full regeneration
    generateButton.addEventListener('click', () => {
        // Base should already be handled by its own listeners,
        // just trigger the prime generation which uses the current state.
        triggerPrimeGeneration();
    });

    shapeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const shapeSides = parseInt(toggle.dataset.sides);
            if (toggle.classList.contains('active')) {
                toggle.classList.remove('active');
                activeShape = null;
            } else {
                shapeToggles.forEach(btn => btn.classList.remove('active'));
                toggle.classList.add('active');
                activeShape = shapeSides;
                generateShapeSet(activeShape); // Attempt set creation immediately
            }
        });
    });

    setMinMaxButton.addEventListener('click', generateMinMaxSet);
    setInnerPrimesButton.addEventListener('click', generateInnerPrimesSet);


    // --- Set Generation Functions ---
    function generateShapeSet(numSides) {
        if (!numSides) return;
        if (selectedPrimes.size !== numSides) {
             if (selectedPrimes.size > 0) {
                 alert(`Shape requires ${numSides} primes, but ${selectedPrimes.size} are selected.`);
             }
            return;
        }
        const newSetArray = Array.from(selectedPrimes).sort((a, b) => a - b);
        addPrimeSet({ set: newSetArray, type: 'shape', shape: numSides });
        clearGridSelection();
        const activeButton = document.querySelector(`.shape-toggle[data-sides="${numSides}"]`);
        if (activeButton) activeButton.classList.remove('active');
        activeShape = null;
    }

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
            alert(`No generated primes found between ${minP.toString(currentBase).toUpperCase()} and ${maxP.toString(currentBase).toUpperCase()} (Base ${currentBase}).`);
            return;
        }
        addPrimeSet({ set: innerPrimes, type: 'inner', bounds: [minP, maxP], sourceSetSize: selectedPrimes.size });
        clearGridSelection();
    }

    function addPrimeSet(newSetData) {
        const newSetString = JSON.stringify(newSetData.set);
        const exists = primeSets.some(ps => ps.type === newSetData.type && JSON.stringify(ps.set) === newSetString);

        if (!exists) {
            primeSets.push(newSetData);
            renderPrimeSets();
        } else {
            alert(`This exact set of type "${newSetData.type}" already exists.`);
        }
    }

    // --- Prime Set Rendering in Sidebar ---
    function renderPrimeSets() {
        primeSetsContainer.innerHTML = '';
        if (primeSets.length === 0) {
            primeSetsContainer.innerHTML = '<p class="empty-sets-message" style="font-size: 0.8em; padding: 5px;">Select primes and click a shape or relation button.</p>';
            return;
        }

        primeSets.forEach((primeSetData, index) => {
            const setDiv = document.createElement('div');
            setDiv.classList.add('prime-set');
            setDiv.dataset.index = index;
            setDiv.dataset.setType = primeSetData.type;

            const base10Set = primeSetData.set;
            const displaySet = base10Set.map(p => p.toString(currentBase).toUpperCase());

            let label = '';
            let baseTitle = `Set (Base ${currentBase}): ${displaySet.join(', ')}`;
            let base10Title = `Set (Base 10): ${base10Set.join(', ')}`;

            switch (primeSetData.type) {
                case 'shape':
                    label = `Shape ${primeSetData.shape}: `;
                    baseTitle = `Shape: ${primeSetData.shape}, ${baseTitle}`;
                    break;
                case 'minmax':
                    label = `Min/Max (from ${primeSetData.sourceSetSize}): `;
                    baseTitle = `Min/Max from ${primeSetData.sourceSetSize} selected. ${baseTitle}`;
                    break;
                case 'inner':
                    const minBoundStr = primeSetData.bounds[0].toString(currentBase).toUpperCase();
                    const maxBoundStr = primeSetData.bounds[1].toString(currentBase).toUpperCase();
                    label = `Inner (${minBoundStr}-${maxBoundStr}): `;
                    baseTitle = `Inner primes between ${minBoundStr} and ${maxBoundStr} (from ${primeSetData.sourceSetSize} selected). ${baseTitle}`;
                    break;
                default:
                    label = 'Set: ';
            }

            const maxDisplayedNumbers = 10;
            let displayNumbersStr = displaySet.join(', ');
            if (displaySet.length > maxDisplayedNumbers) {
                displayNumbersStr = displaySet.slice(0, maxDisplayedNumbers).join(', ') + '...';
                baseTitle += ` (${displaySet.length} total)`;
                base10Title += ` (${base10Set.length} total)`;
            }

            const fullTitle = `${baseTitle}\n${base10Title}`;

            setDiv.innerHTML = `
                <div class="prime-set-numbers" title="${fullTitle}"><strong>${label}</strong>${displayNumbersStr}</div>
                <div class="prime-set-actions">
                    <button class="copy-button" title="Copy Base ${currentBase} Set Array"><i class="fas fa-copy"></i></button>
                    <button class="json-button" title="Download Set Data (JSON)"><i class="fas fa-file-download"></i></button>
                    <button class="delete-button" title="Delete Set"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;

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
    function deletePrimeSet(index) {
        if (index < 0 || index >= primeSets.length) return;
        const displaySet = primeSets[index].set.map(p => p.toString(currentBase).toUpperCase());
        if (confirm(`Delete Set: [${displaySet.slice(0, 5).join(', ')}...]?`)) {
            primeSets.splice(index, 1);
            renderPrimeSets();
        }
    }

    // --- Set Actions (Copy, JSON, Details) ---
    function copySetToClipboard(index, buttonElement) {
        if (index < 0 || index >= primeSets.length) return;
        const primeSetBase10 = primeSets[index].set;
        const primeSetCurrentBaseStrings = primeSetBase10.map(p => p.toString(currentBase).toUpperCase());
        navigator.clipboard.writeText(JSON.stringify(primeSetCurrentBaseStrings))
            .then(() => {
                buttonElement.classList.add('copied');
                const icon = buttonElement.querySelector('i');
                const originalIconClass = icon.className;
                icon.className = 'fas fa-check';
                setTimeout(() => {
                    buttonElement.classList.remove('copied');
                    icon.className = originalIconClass;
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy set: ', err);
                alert('Failed to copy set to clipboard.');
            });
    }

    function downloadSetAsJson(index) {
        if (index < 0 || index >= primeSets.length) return;
        const primeSetData = primeSets[index];
        const jsonData = JSON.stringify(primeSetData, null, 2);

        let baseName = `prime_set_${primeSetData.type}`;
        if (primeSetData.shape) baseName += `_${primeSetData.shape}`;
        if (primeSetData.bounds) baseName += `_${primeSetData.bounds[0]}-${primeSetData.bounds[1]}`;
        const filename = `${baseName}_${index + 1}.json`;

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function toggleSetDetails(setDiv, index) {
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
            const primeSetBase10 = setData.set;
            const count = primeSetBase10.length;
            const sum = count > 0 ? primeSetBase10.reduce((a, b) => a + b, 0) : 0;
            const avg = count > 0 ? (sum / count).toFixed(2) : 'N/A';
            const minBase10 = count > 0 ? primeSetBase10[0] : NaN;
            const maxBase10 = count > 0 ? primeSetBase10[count - 1] : NaN;
            const minDisplay = !isNaN(minBase10) ? minBase10.toString(currentBase).toUpperCase() : 'N/A';
            const maxDisplay = !isNaN(maxBase10) ? maxBase10.toString(currentBase).toUpperCase() : 'N/A';

            let typeInfo = `Type: ${setData.type}<br>`;
            typeInfo += `Display Base: ${currentBase}<br>`;
            if (setData.shape) typeInfo += `Shape Count: ${setData.shape}<br>`;
            if (setData.bounds) {
                 const minBoundStr = setData.bounds[0].toString(currentBase).toUpperCase();
                 const maxBoundStr = setData.bounds[1].toString(currentBase).toUpperCase();
                 typeInfo += `Range (bounds): ${minBoundStr} - ${maxBoundStr}<br>`;
            }
             if (setData.sourceSetSize) typeInfo += `Source Selection Size: ${setData.sourceSetSize}<br>`;

            detailsDiv.innerHTML = `
                ${typeInfo}
                Count: ${count}<br>
                Sum (Base 10): ${sum}<br>
                Average (Base 10): ${avg}<br>
                Min (Base ${currentBase}): ${minDisplay}, Max (Base ${currentBase}): ${maxDisplay}
            `;
        } else {
            if (detailsDiv) {
                detailsDiv.remove();
            }
        }
    }

    // --- Initial Setup on Page Load ---
    primeGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Set Base (2-36) and Count (10-25000), then click "Generate Primes".</p>';
    currentBase = parseInt(baseInput.value, 10); // Initialize currentBase from default input value
    renderPrimeSets(); // Render initial empty state for the sidebar

});
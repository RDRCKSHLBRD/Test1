// Function to check if a number is prime
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Function to generate the first 500 prime numbers
function generatePrimes(count) {
  const primes = [];
  let num = 2;
  while (primes.length < count) {
    if (isPrime(num)) {
      primes.push(num);
    }
    num++;
  }
  return primes;
}

// Event listener for the button
document.getElementById('testButton').addEventListener('click', () => {
  const primes = generatePrimes(1000);

  // Create a container for the grid
  const gridContainer = document.createElement('div');
  gridContainer.id = 'primeGrid';
  gridContainer.style.display = 'flex';
  gridContainer.style.flexWrap = 'wrap';
  gridContainer.style.gap = '10px';
  gridContainer.style.padding = '20px';

  // Create square elements for each prime number
  primes.forEach(prime => {
    const square = document.createElement('div');
    square.textContent = prime;
    square.style.width = '50px';
    square.style.height = '50px';
    square.style.display = 'flex';
    square.style.alignItems = 'center';
    square.style.justifyContent = 'center';
    square.style.backgroundColor = '#617068';
    square.style.color = '#e1e5d6';
    square.style.border = '1px solid #59584F';
    square.style.fontSize = '14px';
    square.style.borderRadius = '2px';
    gridContainer.appendChild(square);
  });

  // Clear previous content and add the grid to the body
  const existingGrid = document.getElementById('primeGrid');
  if (existingGrid) {
    existingGrid.remove();
  }
  document.body.appendChild(gridContainer);
});

// Initialize variables to prevent reference errors
let targetValue = 0;
let currentValue = 0;

// Changed output=csv to output=tsv to fix European comma issues
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_2HnnsUQRQThPMyRnGgiEf3hvzp6wMRZLUwAe2yOuhMuJTtR0Pjf0ajuXXvNI8mC1mjBPlU1flaPp/pub?gid=0&single=true&output=tsv';

async function start() {
  try {
    const response = await fetch(sheetUrl);
    const tsvText = await response.text();

    // Split by new line
    const rows = tsvText.split('\n');

    // Check if the sheet has at least 22 rows
    if (rows.length >= 22) {
      // Split by TAB instead of comma
      const row22 = rows[21].split('\t');

      // Helper function to safely read German formatted numbers
      const parseNum = (str) => {
        if (!str) return 0;
        const cleaned = str.replace(/"/g, '').replace(/\./g, '');
        return parseFloat(cleaned.replace(/[^0-9.-]/g, '')) || 0;
      };

      const sheetTarget = parseNum(row22[2]); // Column C
      const sheetCurrent = parseNum(row22[8]); // Column I

      // Only overwrite backups if valid numbers exist
      if (sheetTarget > 0) targetValue = sheetTarget;
      if (sheetCurrent >= 0) currentValue = sheetCurrent;
    }
  } catch (error) {
    console.error("Error loading sheet data", error);
  }

  // Proceed to update screen whether sheet succeeded or failed
  updateDisplaysAndAnimate(targetValue, currentValue);
}

function updateDisplaysAndAnimate(targetValue, currentValue) {
  // 1. Calculate remaining amount
  const remainingValue = targetValue - currentValue;

  // 2. Update the Text Displays on the screen
  const amountText = document.getElementById('amountText');
  const remainingAmountsNumber = document.querySelector('.remaining-amounts .number');

  if (amountText) {
    amountText.textContent = currentValue.toLocaleString('en-US') + "€ / " + targetValue.toLocaleString('en-US') + "€";
  }
  if (remainingAmountsNumber) {
    remainingAmountsNumber.textContent = remainingValue.toLocaleString('en-US');
  }

  // 3. Start the Progress Bar Animation
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const donationImages = document.querySelectorAll('.qr-item img');
  const duration = 2000;

  let currentAnimValue = 0;
  const increment = currentValue / 100;
  const stepTime = duration / 100;

  // Prevent division by zero if current value is 0
  if (currentValue === 0) {
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    progressBar.classList.add('flash-red');
    donationImages.forEach(img => img.classList.add('pulse-scale'));
    return;
  }

  const interval = setInterval(() => {
    currentAnimValue += increment;

    if (currentAnimValue >= currentValue) {
      currentAnimValue = currentValue;
      clearInterval(interval);

      if (currentValue < targetValue) {
        progressBar.classList.add('flash-red');
        donationImages.forEach(img => img.classList.add('pulse-scale'));
      }
    }

    const percentage = (currentAnimValue / targetValue) * 100;
    const displayPercentage = Math.min(percentage, 100);

    progressBar.style.width = displayPercentage + '%';
    progressText.textContent = Math.round(displayPercentage) + '%';
  }, stepTime);
}

window.onload = start;
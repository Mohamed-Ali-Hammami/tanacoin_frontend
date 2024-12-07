function updateTime() {
    const currentTimeElement = document.getElementById('current-time');
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function showTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tabContent => {
        tabContent.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

function copyToClipboard() {
    const btcAddressInput = document.getElementById('btc_address');
    btcAddressInput.select();
    document.execCommand('copy');
    alert('Adresse BTC copiée!');
}

function calculatePrice() {
    const jetons = document.getElementById('jetons').value;
    const prixJeton = 0.09;
    const montantTotalEur = jetons * prixJeton;
    const montantTotalBtc = (montantTotalEur / 20000).toFixed(8);

    document.getElementById('montant_total_eur').textContent = montantTotalEur.toFixed(2) + ' EUR';
    document.getElementById('montant_total_btc').textContent = montantTotalBtc + ' BTC';
}

function startCountdown() {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.style.display = 'block';

    const btcAddress = document.getElementById('btc_address').value;
    QRCode.toDataURL(btcAddress, function(err, url) {
        document.getElementById('qrCode').src = url;
    });

    const countdownElement = document.getElementById('countdown');
    let countdownTime = 2700;

    const interval = setInterval(function() {
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        countdownElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        countdownTime--;
        if (countdownTime < 0) {
            clearInterval(interval);
            alert('Le temps est écoulé.');
        }
    }, 1000);
}

function fetchTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            const transactionsList = document.getElementById('transactionsList');
            transactionsList.innerHTML = '';
            data.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.id}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.amount_btc}</td>
                    <td>${transaction.status}</td>
                `;
                transactionsList.appendChild(row);
            });
        });
}

setInterval(updateTime, 1000);
fetchTransactions();

document.addEventListener('DOMContentLoaded', function () {
    const scanButton = document.getElementById('scan-btn');
    const scanning = document.getElementById('scanning');
    const scanResults = document.getElementById('scan-results'); 
    const thirdPartyDomainsList = document.getElementById('third-party-domains');
    const firstPartyCookiesList = document.getElementById('first-party-cookies');
    const thirdPartyCookiesList = document.getElementById('third-party-cookies');
    const localStorageList = document.getElementById('local-storage-list');
    const hookHijackStatus = document.getElementById('hook-hijack-status');
    const canvasFingerprintStatus = document.getElementById('canvas-fingerprint-status');
    const securityStatus = document.getElementById('security-status');

    scanButton.addEventListener('click', function () {
        scanButton.style.display = 'none';
        scanning.style.display = 'block';

        chrome.tabs.executeScript(null, {
            file: "scan_script.js",
        }, function() {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { msg: "scan" }, function(response) {
                    if (response && response.status === "completed") {
                        scanResults.style.display = 'block';
                    }
                });
            });
        });
    });

    // Ouve mensagens do background script
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === 'scanResult') {  
            scanButton.style.display = 'block';
            scanning.style.display = 'none';

            // Preenche a lista de domínios de terceira parte
            thirdPartyDomainsList.innerHTML = '';
            message.thirdPartyDomains.forEach(domain => {
                let li = document.createElement('li');
                li.textContent = domain;
                thirdPartyDomainsList.appendChild(li);
            });

            // Preenche cookies de primeira parte
            firstPartyCookiesList.innerHTML = '';
            if (message.firstPartyCookies !== 'Nenhum cookie de primeira parte detectado.') {
            message.firstPartyCookies.forEach(cookie => {
                let li = document.createElement('li');
                li.textContent = cookie;
                firstPartyCookiesList.appendChild(li);
            });
            } else {
                let li = document.createElement('li');
                li.textContent = 'Nenhum cookie de primeira parte detectado.';
                firstPartyCookiesList.appendChild(li);
            }

            // Preenche cookies de terceira parte
            thirdPartyCookiesList.innerHTML = '';
            if (message.thirdPartyCookies !== 'Nenhum cookie de terceiros detectado.') {
                message.thirdPartyCookies.forEach(cookie => {
                    let li = document.createElement('li');
                    li.textContent = cookie;
                    thirdPartyCookiesList.appendChild(li);
                });
            } else {
                let li = document.createElement('li');
                li.textContent = 'Nenhum cookie de terceiros detectado.';
                thirdPartyCookiesList.appendChild(li);
            }

            // Preenche o localStorage
            localStorageList.innerHTML = '';
            if (message.localStorageDetected !== 'Nada encontrado no armazenamento local.')
                message.localStorageDetected.forEach(item => {
                    let li = document.createElement('li');
                    li.textContent = item;
                    localStorageList.appendChild(li);
                });
            else {
                let li = document.createElement('li');
                li.textContent = 'Nada encontrado no armazenamento local.';
                localStorageList.appendChild(li);
            }

            // Preenche o status de Hooking ou Hijacking
            hookHijackStatus.textContent = message.hijackingDetected;

            // Preenche o status de Canvas Fingerprinting
            canvasFingerprintStatus.textContent = message.canvasFingerprintDetected;

            // Atualiza o status de segurança geral
            if (message.hijackingDetected.includes('Detectado') || message.canvasFingerprintDetected.includes('Detectada')) {
                securityStatus.textContent = 'O site não é seguro, e potencialmente contém ameaças (Canvas Fingerprinting ou Hijacking).';
                securityStatus.style.color = 'red';
            } else if (message.thirdPartyDomains.length > 0 || message.thirdPartyCookies.length > 0) {
                securityStatus.textContent = 'O site é seguro, mas contém rastreadores de terceiros (Requisições à Domínios ou Cookies de Terceiros).';
                securityStatus.style.color = 'orange';
            } else {
                securityStatus.textContent = 'O site é seguro!';
                securityStatus.style.color = 'green';
            }
        }
    });
});
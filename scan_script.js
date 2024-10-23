chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {  
    if (request.msg === "scan") {
        console.log("Iniciando a verificação de segurança...");

        let thirdPartyDomains = [];

        let hijackingDetected = false;
        let canvasFingerprintDetected = false;

        let localStorage = [];

        let firstPartyCookies = [];
        let thirdPartyCookies = [];

  
      function thirdPartyDomainsDetection() {
        const requests = performance.getEntriesByType('resource');
        
        requests.forEach((request) => {
          const url = new URL(request.name);
          if (url.hostname !== window.location.hostname && !thirdPartyDomains.includes(url.hostname)) {
            thirdPartyDomains.push(url.hostname);
          }
        });

        console.log("Domínios de terceira parte:", thirdPartyDomains);
      }
  
      function hijackingDetection() {
        if (window.top !== window.self) {
          hijackingDetected = true;
        }
        console.log("Highjacking Detectado!");
      }

        // Salvar o localStorage em uma variável
        function localStorageCheck() {
            for (let i = 0; i < localStorage.length; i++) {
                localStorage.push(localStorage.key(i));
            }
            console.log("Armazenamento Local:", localStorage);
        }
    
      function canvasFingerprintDetection() {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function () {
          canvasFingerprintDetected = true;
          console.log("Canvas Fingerprinting Detectado!");
          return originalToDataURL.apply(this, arguments);
        };
      }

      function cookiedDetection() {
        const allCookies = document.cookie.split(';');
  
        allCookies.forEach((cookie) => {
          if (cookie.includes(window.location.hostname)) {
            firstPartyCookies.push(cookie);
          } else {
            thirdPartyCookies.push(cookie);
          }
        });

        console.log("First-party cookies:", firstPartyCookies, "Third-party cookies:", thirdPartyCookies);
      }

      console.log("Verificação de segurança iniciadaaaaa...");
      thirdPartyDomainsDetection();
      hijackingDetection();
      localStorageCheck();
      canvasFingerprintDetection();
      cookiedDetection();
      console.log("Verificação de segurança concluída!");

      setTimeout(() => {
        chrome.runtime.sendMessage({
            type: "scanResult",
            thirdPartyDomains: thirdPartyDomains.length > 0 ? thirdPartyDomains : 'Nenhum domínio de terceiros detectado.',
            hijackingDetected: hijackingDetected ? 'Hijacking Detectado' : 'Nenhuma ameaça de Hijacking detectada.',
            localStorageDetected: localStorage.length > 0 ? localStorage : 'Nada encontrado no armazenamento local.',
            canvasFingerprintDetected: canvasFingerprintDetected ? 'Ameaça de Canvas Fingerprinting detectada!' : 'Nenhuma ameaça de Canvas Fingerprinting detectada.',
            firstPartyCookies: firstPartyCookies.length > 0 ? firstPartyCookies : 'Nenhum cookie de primeira parte detectado.',
            thirdPartyCookies: thirdPartyCookies.length > 0 ? thirdPartyCookies : 'Nenhum cookie de terceiros detectado.'
        });
    
        sendResponse({ status: "completed" });
    }, 3000);    
  
      return true;
    }
});
const isLocal = window.location.hostname === 'localhost';
const apiBaseURL = isLocal
  ? 'http://localhost:8000/api' // Sviluppo locale
  : 'https://distinctive-ermina-randomcodestudio-ed635444.koyeb.app/api'; // Produzione

// Funzione per loggare solo in modalità di sviluppo
function log(message) {
  if (isLocal) {
    console.log(message);
  }
}

const pageviewsCount = document.getElementById('pageviews-count');
const visitsCount = document.getElementById('visits-count');

// Recupera i dati salvati in localStorage
const savedData = JSON.parse(localStorage.getItem('counterData')) || {};

// Imposta i contatori nel front-end con i valori salvati (se presenti)
if (savedData.pageviews !== undefined) {
  pageviewsCount.textContent = savedData.pageviews || 0;
}
if (savedData.visits !== undefined) {
  visitsCount.textContent = savedData.visits || 0;
}

// Controlla lo stato della visita
checkSession();

async function checkSession() {
  log('Controllando la sessione...');

  // Verifica se l'utente ha già visitato il sito (tracciato tramite un cookie)
  const visitCookie = getCookie('visited');

  if (!visitCookie) {
    log('Prima visita rilevata. Aggiorno contatore visite.');
    await updateCounter('type=visit-pageview'); // Incrementa le visite
    setCookie('visited', 'true', 365); // Imposta il cookie per evitare conteggi successivi
  } else {
    log('Visitatore di ritorno. Non aggiorno subito il contatore delle visualizzazioni.');
    // Se è un visitatore di ritorno, non incrementiamo subito
    // Iniziamo il timer per incrementare le visualizzazioni dopo 5 secondi
    startPageviewTimer();
  }
}

// Funzione per aggiornare i contatori
async function updateCounter(type) {
  try {
    const res = await fetch(`${apiBaseURL}?${type}`);
    if (!res.ok) {
      throw new Error('Errore nella risposta del server: ' + res.statusText);
    }

    const data = await res.json();

    log('Dati ricevuti dal server:', data);

    // Se i dati sono validi, aggiorna i contatori
    if (data.pageviews !== undefined && data.pageviews !== 0) {
      const currentData = JSON.parse(localStorage.getItem('counterData')) || {};

      // Aggiorna i contatori solo se i valori sono cambiati
      if (
        currentData.pageviews !== data.pageviews ||
        currentData.visits !== data.visits
      ) {
        pageviewsCount.textContent = data.pageviews || 0;
        visitsCount.textContent = data.visits || 0;

        // Salva i nuovi dati in localStorage
        localStorage.setItem('counterData', JSON.stringify(data));
        log('Contatori aggiornati con nuovi valori');
      } else {
        log('I valori dei contatori non sono cambiati');
      }
    } else {
      log('Contatori non aggiornati: valore pageviews è 0');
    }
  } catch (error) {
    console.error('Errore fetch:', error);
  }
}

// Funzione per iniziare il timer per incrementare le visualizzazioni
function startPageviewTimer() {
  if (!sessionStorage.getItem('pageviewTimerStarted')) {
    sessionStorage.setItem('pageviewTimerStarted', 'true');
    
    const timer = setTimeout(async () => {
      log('5 secondi trascorsi, aggiorno il contatore delle visualizzazioni.');
      await updateCounter('type=pageview'); // Incrementa solo le visualizzazioni
    }, 5000); // 5000 millisecondi = 5 secondi

    // Salva il timer in sessionStorage per fermarlo se necessario
    sessionStorage.setItem('pageviewTimer', timer);
  } else {
    log('Il timer è già stato avviato per questa sessione.');
  }
}

// Funzione per ottenere un cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Funzione per impostare un cookie
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}

// Funzione per fermare il timer (se l'utente lascia la pagina prima dei 5 secondi)
window.addEventListener('beforeunload', () => {
  const timer = sessionStorage.getItem('pageviewTimer');
  if (timer) {
    clearTimeout(timer); // Cancella il timer se l'utente sta per lasciare la pagina
    log('Timer cancellato, l\'utente sta per lasciare la pagina.');
  }
});

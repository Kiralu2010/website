

const isLocal = window.location.hostname === 'localhost';
const apiBaseURL = isLocal
  ? 'http://localhost:8000/api' // Sviluppo locale
  : 'https://distinctive-ermina-randomcodestudio-ed635444.koyeb.app/api'; // Produzione

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

// Verifica se è un nuovo utente o un visitatore di ritorno
let isNewUser = !localStorage.getItem('userId');
if (isNewUser) {
  const userId = generateUUID();
  localStorage.setItem('userId', userId);
  debug_log('Nuovo utente rilevato:', userId);
}

// Gestisci la sessione e aggiorna i contatori
checkSession();

async function checkSession() {
  debug_log('Controllando la sessione...');
  const isNewVisit = !localStorage.getItem('visit');

  if (isNewVisit) {
    debug_log('Prima visita rilevata. Aggiorno contatore visit-pageview.');
    await updateCounter('type=visit-pageview'); // Incrementa visite e visualizzazioni
    localStorage.setItem('visit', 'true'); // Segna l'utente come "visitato"
  } else {
    debug_log('Visitatore di ritorno. Aspetto per incrementare pageview.');
    setTimeout(async () => {
      debug_log('5 secondi trascorsi. Aggiorno contatore pageview.');
      await updateCounter('type=pageview'); // Incrementa solo le visualizzazioni
    }, 5000); // Attendi 5 secondi prima di aggiornare le visualizzazioni
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

    debug_log('Dati ricevuti dal server:', data);

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
        debug_log('Contatori aggiornati con nuovi valori');
      } else {
        debug_log('I valori dei contatori non sono cambiati');
      }
    } else {
      debug_log('Contatori non aggiornati: valore pageviews è 0');
    }
  } catch (error) {
    console.error('Errore fetch:', error);
  }
}

// Funzione per generare un UUID univoco per ogni utente
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function debug_log(string) {
  if (isLocal) {
    console.log(string);
  }
}
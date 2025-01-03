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

// Controlla lo stato della visita
checkSession();

async function checkSession() {
  console.log('Controllando la sessione...');

  // Controlla se è la prima visita dell'utente
  const isNewVisit = !localStorage.getItem('visit');
  
  if (isNewVisit) {
    console.log('Prima visita rilevata. Aggiorno contatore visit-pageview.');
    await updateCounter('type=visit-pageview'); // Incrementa visite e visualizzazioni
    localStorage.setItem('visit', 'true'); // Segna l'utente come "visitato"
  } else {
    console.log('Visitatore di ritorno. Aggiorno contatore pageview.');
    await updateCounter('type=pageview'); // Incrementa solo le visualizzazioni
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

    console.log('Dati ricevuti dal server:', data);

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
        console.log('Contatori aggiornati con nuovi valori');
      } else {
        console.log('I valori dei contatori non sono cambiati');
      }
    } else {
      console.log('Contatori non aggiornati: valore pageviews è 0');
    }
  } catch (error) {
    console.error('Errore fetch:', error);
  }
}

const pageviewsCount = document.getElementById('pageviews-count');
const visitsCount = document.getElementById('visits-count');

// Verifica se la sessione è già stata trattata
var viewCounterWasSet = sessionStorage.getItem('viewCounterWasSet');
var counterData = JSON.parse(sessionStorage.getItem('value')); // Recupera i dati se esistono

// Imposta i contatori nel front-end se sono già stati salvati nella sessione
if (counterData) {
  pageviewsCount.textContent = counterData.pageviews || 0;
  visitsCount.textContent = counterData.visits || 0;
}

// Se non è stato impostato il contatore o la sessione non è ancora stata trattata
if (viewCounterWasSet !== 'true') {
  checkSession();
}

async function checkSession() {
  // Log per il controllo
  console.log('Controllando la sessione...');

  // Controllo della sessione per la prima visita
  if (!sessionStorage.getItem('visit')) {
    console.log('Prima visita rilevata. Aggiorno contatore visit-pageview.');
    await updateCounter('type=visit-pageview');  // Aggiungi una visita e una visualizzazione
    sessionStorage.setItem('visit', 'x'); // Imposta una sola volta per la visita
  } else {
    console.log('Visitatore di ritorno. Aggiorno contatore pageview.');
    await updateCounter('type=pageview');  // Aggiungi solo una visualizzazione
  }
}

// Funzione per aggiornare i contatori
async function updateCounter(type) {
  try {
    const res = await fetch('http://127.0.0.1:3002/api?' + type);
    if (!res.ok) {
      throw new Error('Errore nella risposta del server: ' + res.statusText);
    }

    const data = await res.json();

    // Log per vedere i dati ricevuti dal server
    console.log('Dati ricevuti dal server:', data);

    // Se la risposta è valida e i valori sono cambiati, aggiorna i contatori
    if (data.pageviews !== undefined && data.pageviews !== 0) {
      // Confronta i valori salvati con quelli appena ricevuti
      const savedData = JSON.parse(sessionStorage.getItem('value')) || {};

      // Se i valori sono diversi, aggiorna i contatori
      if (savedData.pageviews !== data.pageviews || savedData.visits !== data.visits) {
        pageviewsCount.textContent = data.pageviews || 0;
        visitsCount.textContent = data.visits || 0;

        // Salva i nuovi valori nel sessionStorage
        sessionStorage.setItem('value', JSON.stringify(data));

        // Imposta il flag per non chiamare più la funzione
        sessionStorage.setItem('viewCounterWasSet', 'true');
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

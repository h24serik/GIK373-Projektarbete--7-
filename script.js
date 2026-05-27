// NAVIGERING
const navLinks = document.querySelectorAll(".nav-link-custom");
const pages = document.querySelectorAll(".page");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((l) => l.classList.remove("active"));
    pages.forEach((p) => p.classList.remove("active"));
    link.classList.add("active");
    document.getElementById("page-" + link.getAttribute("data-page")).classList.add("active");
  });
});

// HAMBURGARE NAVIGERING
const hamburgerButton = document.getElementById('hamburger');
const navMeny = document.getElementById('navLinks');

hamburgerButton.addEventListener('click', () => {
  navMeny.classList.toggle('open');
});


// KAN SVERIGE NÅ TRANSPORTMÅLEN 2030?
// LINJEDIAGRAM ÖVER TID HUR UTSLÄPPEN SER UT

const urlTransportutsläpp = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0107/MI0107InTranspNN';

const queryTransportutsläpp = {
  "query": [
    { "code": "Vaxthusgaser", "selection": { "filter": "item", "values": ["CO2-ekv."] } },
    { "code": "Transportslag", "selection": { "filter": "item", "values": ["8.0"] } },
    { "code": "Bransleslag", "selection": { "filter": "item", "values": ["0"] } }
  ],
  "response": { "format": "JSON" }
};

fetch(urlTransportutsläpp, {
  method: 'POST',
  body: JSON.stringify(queryTransportutsläpp)
}).then((res) => res.json())
  .then((data) => {
    printTransport(data, 'transportLine');
    printTransport(data, 'transportLineHem');
  });

function printTransport(dataTransportSCB, id) {
  const allData = dataTransportSCB.data;
  
  const fran2007 = allData.filter((row) => parseInt(row.key[3]) >= 2007);
  
  const labels = fran2007.map((row) => row.key[3]);
  labels.push('2025', '2026', '2027', '2028', '2029', '2030', '2031');

  const data = fran2007.map((row) => parseFloat(row.values[0]));
  const senasteVarde = data[data.length - 1];

  const faktiskData = [...data, ...Array(6).fill(null)];

  const mal2030 = 6300;
  const steg = (senasteVarde - mal2030) / 6;
  const malData = [
      ...Array(data.length - 1).fill(null), 
      senasteVarde,
      Math.round(senasteVarde - steg),
      Math.round(senasteVarde - steg * 2),
      Math.round(senasteVarde - steg * 3),
      Math.round(senasteVarde - steg * 4),
      Math.round(senasteVarde - steg * 5),
      mal2030
  ];

  new Chart(document.getElementById(id), {
      type: 'line',
      data: {
          labels: labels,
          datasets: [
              {
                  label: 'Faktiska utsläpp (kt CO₂)',
                  data: faktiskData,
                  borderColor: '#2d6a4f',
                  backgroundColor: 'rgba(45, 106, 79, 0.12)',
                  fill: true,
                  tension: 0.4,
                  pointRadius: 2,
                  borderWidth: 2.5
              },
              {
                  label: 'Klimatmål 2030',
                  data: malData,
                  borderColor: '#e63946',
                  borderDash: [6, 4],
                  borderWidth: 2,
                  pointRadius: 0,
                  fill: false
              }
          ]
      },
      options: {
          scales: {
              x: { title: { display: true, text: 'År', color: '#1a3a2a', font: { weight: 'bold' } } },
              y: { title: { display: true, text: 'kt CO₂-ekv.', color: '#1a3a2a', font: { weight: 'bold' } }, min: 4000 }
          },
          plugins: { legend: { display: true } }
      }
  });
}




// VILKET TRANSPORTSLAG SLÄPPER UT MEST?
// STAPELDIAGRAM

const urlTransportslag = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0107/MI0107InTranspNN";

const queryTransportslag = {
  "query": [
    { "code": "Vaxthusgaser", "selection": { "filter": "item", "values": ["CO2-ekv."] } },
    { "code": "Transportslag", "selection": { "filter": "item", "values": ["8.1", "8.2", "8.4", "8.5"] } },
    { "code": "Bransleslag", "selection": { "filter": "item", "values": ["0"] } }
  ],
  "response": { "format": "JSON" }
};

fetch(urlTransportslag, {
  method: 'POST',
  body: JSON.stringify(queryTransportslag)
}).then((res) => res.json())
  .then((data) => printTransportslag(data));

function printTransportslag(data) {
  const senasteAr = data.data.filter((row) => row.key[3] === '2023');

  const transportslagName = {
    '8.1': 'Flyg',
    '8.2': 'Järnväg',
    '8.4': 'Sjöfart',
    '8.5': 'Vägtrafik'
  };

  const labels = senasteAr.map((row) => transportslagName[row.key[1]]);
  const values = senasteAr.map((row) => parseFloat(row.values[0]));

  new Chart(document.getElementById('transportslagChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Utsläpp 2023 (kt CO2-ekv.)',
        data: values,
        backgroundColor: ['#52b788', '#2d6a4f', '#95d5b2', '#1a3a2a'],
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Transportslag',
            color: '#1a3a2a',
            font: {weight: 'bold'}
          }
        },
        y: {
          title: {
            display: true,
            text: 'kt C02-ekv.',
            color: '#1a3a2a',
            font: {weight: 'bold'}
          }
        }
      }
    }
  });
}


// TRANSPORTUTSLÄPP VÄGTRAFIK

const urlVagtrafik = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0107/MI0107InTranspNN";

const queryVagtrafik = {
  "query": [
    { "code": "Vaxthusgaser", "selection": { "filter": "item", "values": ["CO2-ekv."] } },
    { "code": "Transportslag", "selection": { "filter": "item", "values": ["8.5.1", "8.5.11", "8.5.2", "8.5.3", "8.5.4", "8.5.7"] } },
    { "code": "Bransleslag", "selection": { "filter": "item", "values": ["0"] } }
  ],
  "response": { "format": "JSON" }
};

fetch(urlVagtrafik, {
  method: 'POST',
  body: JSON.stringify(queryVagtrafik)
}).then((res) => res.json())
  .then((data) => printVagtrafik(data));

function printVagtrafik(data) {
  const senasteAr = data.data.filter((row) => row.key[3] === '2023');

  const transportslagName = {
    '8.5.1': 'Personbilar',
    '8.5.11': 'Mopeder och motorcyklar',
    '8.5.2': 'Bussar',
    '8.5.3': 'Lätta lastbilar',
    '8.5.4': 'Tunga lastbilar',
    '8.5.7': 'A-traktorer'
  };

  const labels = senasteAr.map((row) => transportslagName[row.key[1]]);
  const values = senasteAr.map((row) => parseFloat(row.values[0]));

  new Chart(document.getElementById('vagtrafikChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Utsläpp 2023 (kt CO2-ekv.)',
        data: values,
        backgroundColor: ['#52b788', '#2d6a4f', '#95d5b2', '#1a3a2a'],
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Transportslag',
            color: '#1a3a2a',
            font: {weight: 'bold'}
          }
        },
        y: {
          title: {
            display: true,
            text: 'kt C02-ekv.',
            color: '#1a3a2a',
            font: {weight: 'bold'}
          }
        }
      }
    }
  });
}


// HUR STOR DEL AV SVERIGES KLIMATUTSLÄPP KOMMER FRÅN TRANSPORTER?
// DONUTDIAGRAM

const urlTotalt = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0107/TotaltUtslappN";

const queryTotalt = {
  "query": [
    { "code": "Vaxthusgaser", "selection": { "filter": "item", "values": ["CO2-ekv."] } },
    { "code": "Sektor", "selection": { "filter": "item", "values": ["0.1"] } }
  ],
  "response": { "format": "JSON" }
};

async function beraknaTransportAndel() {
  const dataTotalt = await fetch(urlTotalt, {
    method: 'POST',
    body: JSON.stringify(queryTotalt)
  }).then((res) => res.json());

  const dataTransport = await fetch(urlTransportutsläpp, {
    method: 'POST',
    body: JSON.stringify(queryTransportutsläpp)
  }).then((res) => res.json());

  const totaltValues = dataTotalt.data.map((row) => row.values[0]);
  const transportValues = dataTransport.data.map((row) => row.values[0]);

  const totalt = parseFloat(totaltValues[totaltValues.length - 1]);
  const transport = parseFloat(transportValues[transportValues.length - 1]);
  const ovrigt = totalt - transport;

  createDonut(transport, ovrigt);
}
beraknaTransportAndel();

function createDonut(transport, ovrigt) {
  new Chart(document.getElementById('transportDonut'), {
    type: 'doughnut',
    data: {
      labels: ['Transporter', 'Övriga utsläpp'],
      datasets: [{
        data: [transport, ovrigt],
        backgroundColor: ['#2d6a4f', '#d8f3dc'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// LÄS MER KNAPP PÅ FRAMSIDAN
function visaStatistikLasMer() {
  visaSida('statistik');
  
  setTimeout(() => {
      const diagram = document.getElementById('transportLine');
      diagram.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const lasMerKnapp = diagram.closest('.diagram-card').querySelector('.las-mer-knapp');
      if (lasMerKnapp) lasMer(lasMerKnapp);
  }, 300);
}

// TILL TOPPEN KNAPP
const toTopButton = document.getElementById('tillToppen');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    toTopButton.style.display = 'flex';
  } else {
    toTopButton.style.display = 'none';
  }
});

toTopButton.addEventListener('click', () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});


// VISA SIDA FRÅN KNAPP
function visaSida(pageId) {
  pages.forEach((p) => p.classList.remove('active'));
  navLinks.forEach((l) => l.classList.remove('active'));

  document.getElementById('page-' + pageId).classList.add('active');

  const aktivLank = document.querySelector('[data-page="' + pageId + '"]');
  if (aktivLank) aktivLank.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// LÄS MER FUNKTION
function lasMer(knapp) {
  const innehall = knapp.nextElementSibling;

  if (innehall.style.display === 'none') {
      innehall.style.display = 'block';
      knapp.innerHTML ='<i class="bi bi-chevron-up -me-1"></i>Läs mindre';
  } else {
      innehall.style.display = 'none';
      knapp.innerHTML ='<i class="bi bi-chevron-down me-1"></i>Läs mer';
  }
}
// VISA KÄLLOR
function visaKallor(knapp) {
  const innehall = knapp.nextElementSibling;

  if (innehall.style.display === 'none') {
      innehall.style.display = 'block';
      knapp.innerHTML ='<i class="bi bi-chevron-up -me-1"></i>Källor & referenser';
  } else {
      innehall.style.display = 'none';
      knapp.innerHTML ='<i class="bi bi-chevron-down me-1"></i>Källor & referenser';
  }
}

// KORTEN UNDER HERO
document.querySelectorAll('.info-wrap').forEach((kort) => {
  kort.addEventListener('click', () => {
      kort.classList.toggle('aktiv');
  });
});

// ÖPPNA NY LÄNK
function öppnaLänk(url) {
  if (confirm('Du kommer lämna sidan. Vill du öppna länken i en ny flik?')) {
    window.open(url, '_blank');
  }
}

// KARTAN
const urlKarta =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_air_gge?format=JSON&lang=en&src_crf=CRF1A3&unit=THS_T&airpol=GHG&time=2022';

async function visaKarta() {
  const data = await fetch(urlKarta).then((res) => res.json());
  console.log(data);

  const geoIndex = data.dimension.geo.category.index;
  const geoLabels = data.dimension.geo.category.label;
  const values = data.value;

  const lander = Object.keys(geoIndex);
  const utslapp = lander.map((land) => values[geoIndex[land]] || 0);
  const landerNamn = lander.map((land) => geoLabels[land]);

  const kartaData = [{
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: lander.map((land) => landKod(land)),
    z: utslapp,
    text: landerNamn,
    colorscale: [
      [0, '#f0faf2'],
      [0.1, '#95d5b2'],
      [0.3, '#52b788'],
      [0.6, '#2d6a4f'],
      [1, '#1a3a2a']
    ],
    zmin: 0,
    zmax: 150000,
    colorbar: {
      title: 'kt CO₂-ekv.'
    }
  }];

  const layout = {
    geo: {
      scope: 'europe',
    },
    height: 600,
    autosize: true,
  }
  
  Plotly.newPlot('kartaDiagram', kartaData, layout, { responsive: true});
}

function landKod(kod2) {
  const koder = {
    'AT': 'AUT', 'BE': 'BEL', 'BG': 'BGR', 'CY': 'CYP',
    'CZ': 'CZE', 'DE': 'DEU', 'DK': 'DNK', 'EE': 'EST',
    'EL': 'GRC', 'ES': 'ESP', 'FI': 'FIN', 'FR': 'FRA',
    'HR': 'HRV', 'HU': 'HUN', 'IE': 'IRL', 'IT': 'ITA',
    'LT': 'LTU', 'LU': 'LUX', 'LV': 'LVA', 'MT': 'MLT',
    'NL': 'NLD', 'PL': 'POL', 'PT': 'PRT', 'RO': 'ROU',
    'SE': 'SWE', 'SI': 'SVN', 'SK': 'SVK', 'NO': 'NOR',
    'IS': 'ISL', 'LI': 'LIE'
  };
  return koder[kod2] || kod2;
}

visaKarta();
// One-off: convert food-data.js single image query (q) to a 3-query array (qs)
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../app/src/food-data.js', import.meta.url);
let c = readFileSync(path, 'utf8');

const map = new Map([
  ["q: 'Marennes Oléron oysters'", "qs: ['Marennes Oléron oysters', 'oyster farming Charente-Maritime', 'huitres cabane ostréicole']"],
  ["q: 'La Tupina Bordeaux restaurant'", "qs: ['confit de canard', 'Bordeaux Saint-Michel', 'cuisine du Sud-Ouest']"],
  ["q: 'Capbreton port oysters'", "qs: ['Capbreton port', 'Capbreton estacade', 'moules frites']"],
  ["q: 'Bayonne restaurant terrace'", "qs: ['Bayonne Nive', 'Petit Bayonne', 'jambon de Bayonne']"],
  ["q: 'Les Halles Biarritz market'", "qs: ['Les Halles Biarritz', 'Biarritz Grande Plage', 'côte de boeuf grillée']"],
  ["q: 'Saint-Jean-de-Luz port grilled sardines'", "qs: ['Saint-Jean-de-Luz port', 'grilled sardines', 'Saint-Jean-de-Luz houses']"],
  ["q: 'San Sebastian pintxos bar'", "qs: ['pintxos San Sebastian', 'Parte Vieja San Sebastian', 'tortilla de patatas']"],
  ["q: 'La Viña San Sebastian cheesecake'", "qs: ['Basque burnt cheesecake', 'cheesecake slice', 'Parte Vieja San Sebastian street']"],
  ["q: 'Arzak restaurant San Sebastian'", "qs: ['Arzak', 'nueva cocina vasca', 'San Sebastian Gros']"],
  ["q: 'sagardotegi cider house Basque'", "qs: ['sagardotegia', 'Basque cider txotx', 'sidra natural']"],
  ["q: 'Orio grilled fish asador'", "qs: ['Orio Gipuzkoa', 'besugo a la parrilla', 'Orio river']"],
  ["q: 'Elkano Getaria turbot'", "qs: ['Getaria Gipuzkoa', 'turbot', 'Getaria port']"],
  ["q: 'Asador Etxebarri Axpe'", "qs: ['Asador Etxebarri', 'Axpe Atxondo', 'Anboto']"],
  ["q: 'Larrabetzu Bizkaia'", "qs: ['Larrabetzu', 'txakoli vineyard', 'Bizkaia countryside']"],
  ["q: 'Puerto Viejo Algorta'", "qs: ['Puerto Viejo Algorta', 'Getxo coast', 'txakoli pouring']"],
  ["q: 'La Vieja Bodega Casalarreina'", "qs: ['Casalarreina', 'Rioja wine cellar barrels', 'La Rioja vineyards']"],
  ["q: 'chuletillas al sarmiento Rioja'", "qs: ['chuletillas al sarmiento', 'Haro La Rioja', 'lamb chops grill']"],
  ["q: 'Echaurren Ezcaray'", "qs: ['Ezcaray', 'croquetas', 'Ezcaray plaza']"],
  ["q: 'Casa Masip Ezcaray'", "qs: ['Ezcaray Rio Oja', 'Ezcaray street', 'menu del dia Spain']"],
]);

let missing = 0;
for (const [from, to] of map) {
  if (!c.includes(from)) { console.log('NOT FOUND:', from); missing++; continue; }
  c = c.replace(from, to);
}
writeFileSync(path, c, 'utf8');
console.log(`done, ${map.size - missing}/${map.size} replaced`);

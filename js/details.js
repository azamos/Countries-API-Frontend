
const genAndAttachSpan = (anchor,statKey,statVal) => {
  const statSpan = document.createElement('span');
  statSpan.innerText = `${statKey}: ${statVal}`;
  anchor.appendChild(statSpan);
}

const genAndAttachImg = (anchor,imageURL) => {
  const flagImage = document.createElement('img');
  flagImage.src = imageURL;
  anchor.appendChild(flagImage);
}

const populateLeftCol = (leftCol,name,population,region,subregion,capital) => {
  genAndAttachSpan(leftCol,'Native name',name);
  genAndAttachSpan(leftCol,'Population',formatInteger(population));
  genAndAttachSpan(leftCol,'Region',region);
  genAndAttachSpan(leftCol,'Subregion',subregion);
  genAndAttachSpan(leftCol,'Capital',capital);
}

const populateRightCol = (rightCol,TLD,Currencies,Languages) => {
  genAndAttachSpan(rightCol,'Top Level Domain',TLD);
  genAndAttachSpan(rightCol,'Currencies',Currencies);
  genAndAttachSpan(rightCol,'Languages',Languages);
}

const populateFields = (
  name,population,region,capital,imageURL,nativeName,subregion,TLD,
  borders,currencies,languages
) => {
  document.getElementsByClassName("loader")[0].classList.add("close");

  const countryDetailsContainer =
    document.getElementsByClassName("country-details")[0];

  const countryDiv = document.createElement('div');
  countryDiv.className = "display-flex flex-row";

  const flagDiv = document.createElement('div');
  flagDiv.className = "country-flag";
  genAndAttachImg(flagDiv,imageURL);
  countryDiv.appendChild(flagDiv);

  const detailsDiv = document.createElement('div');
  detailsDiv.className = " display-flex flex-col spaced";
  const h1 = document.createElement('h1');
  h1.innerText = name;
  const h1Div = document.createElement('div');
  h1Div.appendChild(h1);
  detailsDiv.appendChild(h1Div);

  const leftCol = document.createElement('div');
  leftCol.className = "display-flex flex-col";
  populateLeftCol(leftCol,nativeName,population,region,subregion,capital);

  const rightCol = document.createElement('div');
  rightCol.className = "display-flex flex-col";
  populateRightCol(rightCol,TLD,currencies,languages);

  const subDiv = document.createElement('div');
  subDiv.className = "display-flex";
  subDiv.appendChild(leftCol);
  subDiv.appendChild(rightCol);

  detailsDiv.appendChild(subDiv);

  const borderDiv = document.createElement('div');
  borderDiv.className = "display-flex";

  const strongBorder = document.createElement('strong');
  strongBorder.innerText = "Border Countries:";
  const bordering = document.createElement('div');
  bordering.className="display-flex";

  borders.forEach(border=>{
    let p = document.createElement('button');
    p.className = "btn";
    p.innerText = border;
    bordering.appendChild(p);
  })

  borderDiv.appendChild(strongBorder);
  borderDiv.appendChild(bordering);
  detailsDiv.appendChild(borderDiv);

  countryDiv.appendChild(detailsDiv);

  countryDetailsContainer.appendChild(countryDiv);
};

const CODES_URL = "https://restcountries.com/v3.1/alpha?codes="

const initialize = async() => {
  setThemeIfNeeded();
  const bordersCodes = getParameterByName("borders");
  const codesURLWithValues = CODES_URL + bordersCodes +"&fields=name";
  let borders;
  if(bordersCodes.length){
    borders = await fetch(codesURLWithValues).then(_=>_.json());
    borders = borders.map(border=>border.name.common);
  }
  else{
    borders = [];
  }
  const name = getParameterByName("name");
  const population = getParameterByName("population");
  const region = getParameterByName("region");
  const capital = getParameterByName("capital");
  const imageURL = getParameterByName("flag");
  const nativeName = getParameterByName("nativeName");
  const subregion = getParameterByName("subregion");
  const TLD = getParameterByName("TLD");
  const currencies = getParameterByName("currencies");
  const languages = getParameterByName("languages");
  populateFields(name,population,region,capital,imageURL,
    nativeName,subregion,TLD,borders,currencies,languages);
}

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

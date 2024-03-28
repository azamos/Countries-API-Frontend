const relevantFields =
  "tld,name,capital,flags,population,region,subregion,currencies,languages,borders";

const getRelevantURL = (url) => `${url}?fields=${relevantFields}`;

const freeChildren = (
  container = document.getElementById("countries-container")
) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

const addInfoLi = (infoType, infoValue) => {
  const li = document.createElement("li");
  const strong = document.createElement("strong");
  strong.innerText = `${infoType}: `;
  li.appendChild(strong);
  const p = document.createElement("p");
  if (!infoValue) {
    infoValue = "N/A";
  }
  p.innerText = infoValue.toString();
  li.appendChild(p);
  return li;
};

const addFlagDiv = (src) => {
  const imageDiv = document.createElement("div");
  imageDiv.className = "country-flag";
  const flagImage = document.createElement("img");
  flagImage.src = src;
  imageDiv.appendChild(flagImage);
  return imageDiv;
};

const addCountryInfo = (commonName, population, region, capital) => {
  const countryInfoDiv = document.createElement("div");
  countryInfoDiv.className = "country-info";
  const h2 = document.createElement("h2");
  h2.className = "country-title";
  h2.innerHTML = commonName;
  countryInfoDiv.appendChild(h2);

  const ul = document.createElement("ul");
  ul.className = "country-brief";
  const population_li = addInfoLi("population", formatInteger(population));
  const region_li = addInfoLi("region", region);
  const capital_li = addInfoLi("capital", capital);
  ul.appendChild(population_li);
  ul.appendChild(region_li);
  ul.appendChild(capital_li);
  countryInfoDiv.appendChild(ul);
  return countryInfoDiv;
};

const arrayToString = arr => {
  let strResult = "";
  if(arr && arr.length){
    strResult = arr.join(',');
  }
  return strResult;
}

const buildQueryStr = queryData => {
  const {commonName,capital,population,region,svg,nativeName,subregion,TLD,
  borders,currencies,languages} = queryData;
  const hrefP1 = `./details.html?name=${commonName}&capital=${capital}&population=${population}&region=${region}&flag=${svg}`;
  const hrefP2 = `&nativeName=${nativeName}&subregion=${subregion}&TLD=${TLD}`;
  const borderStr = arrayToString(borders);
  const currecnyStr = arrayToString(Object.keys(currencies).map(key=>currencies[key].name));
  const langStr = arrayToString(Object.keys(languages).map(key=>languages[key]));
  return`${hrefP1}&${hrefP2}&borders=${borderStr}&currencies=${currecnyStr}&languages=${langStr}`;

}

const addCountryHTML = (countryData) => {
  const {
    flags,
    capital,
    name,
    population,
    region,
    subregion,
    currencies,
    languages,
    borders,
    tld,
  } = countryData;

  const commonName = name.common;

  let nativeName = name.nativeName;
  const firstKey = Object.keys(nativeName)[0];
  nativeName = firstKey && nativeName[firstKey] ? nativeName[firstKey].common : commonName;

  const TLD = tld[0];
  
  const { svg } = flags;

  const newHTML = document.createElement("a");

  newHTML.href = buildQueryStr({commonName,capital,population,region,svg,nativeName,subregion,TLD,
    borders,currencies,languages});

  newHTML.className = "country scale-effect";
  newHTML.setAttribute("data-country-name", commonName);

  newHTML.appendChild(addFlagDiv(svg));
  newHTML.appendChild(addCountryInfo(commonName, population, region, capital));

  document.getElementById("countries-container").appendChild(newHTML);
};

const allURL = "https://restcountries.com/v3.1/all";
const COUNTRIES_KEY = "Countries";

const resetAndFetchAll = async () => {
  localStorage.clear();
  fetchAll();
}

const fetchAll = async () => {
  freeChildren();
  const fromLs = localStorage.getItem(COUNTRIES_KEY);
  let countriesArr;
  if (!fromLs) {
    countriesArr = await fetch(getRelevantURL(allURL)).then((_) => _.json());
    let stringed = JSON.stringify(countriesArr);
    localStorage.setItem(COUNTRIES_KEY, stringed);
  } else {
    countriesArr = JSON.parse(fromLs);
  }
  countriesArr.forEach((countryInfo) => addCountryHTML(countryInfo));
}

const intialise = async () => {
  setThemeIfNeeded();
  fetchAll();
};

const regionURL = "https://restcountries.com/v3.1/region";
const searchByRegion = async (region) => {
  const thisRegionURL = `${regionURL}/${region}`;
  freeChildren();
  regionCountires = await fetch(getRelevantURL(thisRegionURL))
    .then((_) => _.json())
    .catch((e) => console.log(e));
  regionCountires.forEach((cInReg) => addCountryHTML(cInReg));
  localStorage.setItem(COUNTRIES_KEY,JSON.stringify(regionCountires));
};

const nameURL = "https://restcountries.com/v3.1/name";

const fetchAutoComSuggestions = async (partialMatch) => {
  const thisNameURL = `${nameURL}/${partialMatch.trim()}`;
  try {
    let matches = await fetch(getRelevantURL(thisNameURL)).then((_) =>
      _.json()
    );
    if (matches.length) {
      freeChildren();
      matches.forEach((p) => addCountryHTML(p));
      localStorage.setItem(COUNTRIES_KEY,JSON.stringify(matches));
    }
  } catch (err) {
    console.error(err);
  }
};

const searchDelay = 300;
let autoCompleteTimer = null;

const searchInputChanged = async (e) => {
  if (autoCompleteTimer) {
    clearTimeout(autoCompleteTimer);
  }
  const { value } = e.target;
  if (value.trim()) {
    autoCompleteTimer = setTimeout(
      async () => await fetchAutoComSuggestions(value.trim()),
      searchDelay
    );
  } else {
    resetAndFetchAll();
  }
};

const openDropDown = () => {
  const dd = document.getElementById("dropdown-wrapper");
  dd.classList.toggle("open");
};

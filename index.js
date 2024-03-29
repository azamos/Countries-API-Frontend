const RELEVANT_FIELDS =
  "tld,name,capital,flags,population,region,subregion,currencies,languages,borders";

const getRelevantURL = (url) => `${url}?fields=${RELEVANT_FIELDS}`;

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

const ALL_URL = "https://restcountries.com/v3.1/all";
const ALL_COUNTRIES = "all";
const AFRICA = "africa";
const AMERICAS = "americas";
const ASIA = "asia";
const EUROPE = "europe";
const OCEANIA = "oceania";

const THOUSAND = 1000;
const SECS_PER_MIN = 60;
const MINS_PER_HR = 60;
const HRS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const HOURLY_REFRESH = THOUSAND * SECS_PER_MIN * MINS_PER_HR; 
const DAILY_REFRESH = HOURLY_REFRESH * HRS_PER_DAY; 
const WEEKLY_REFRESH = DAILY_REFRESH * DAYS_PER_WEEK;
const getCurrentDate = () => new Date(Date.now());

const loadFromCacheOrAPI = async (key,url,refreshRate = HOURLY_REFRESH) => {
  let result =  JSON.parse(localStorage.getItem(key));
  if(!result || result.expirationDate < getCurrentDate()){
    const countriesArray = await fetch(url).then(_=>_.json());
    const currentTime = new Date().getTime();
    const expirationDate = new Date(currentTime+refreshRate).getTime();
    result = {};
    result.expirationDate = expirationDate;
    result.payload = countriesArray;
    localStorage.setItem(key,JSON.stringify(result));
  }
  return result.payload;
}

const fetchAll = async () => {
  freeChildren();
  const countriesArr = await loadFromCacheOrAPI(ALL_COUNTRIES,getRelevantURL(ALL_URL));
  countriesArr.forEach((countryInfo) => addCountryHTML(countryInfo));
}

let cache;

const intialise = async () => {
  cache = new AutoCompleteCache();
  setThemeIfNeeded();
  fetchAll();
};

const REGION_URL = "https://restcountries.com/v3.1/region";

const searchByRegion = async (region) => {
  const thisRegionURL = `${REGION_URL}/${region}`;
  freeChildren();
  const regionCountries = await loadFromCacheOrAPI(region,getRelevantURL(thisRegionURL));
  regionCountries.forEach((cInReg) => addCountryHTML(cInReg));
};

const NAME_URL = "https://restcountries.com/v3.1/name";

const fetchAutoComSuggestions = async (partialMatch) => {
  partialMatch = partialMatch.trim();
  let matches=[];
  if(partialMatch in cache.storedSuggestions){
    matches = cache.storedSuggestions[partialMatch];
  }
  else{
    const thisNameURL = `${NAME_URL}/${partialMatch}`;
    try {
      matches = await fetch(getRelevantURL(thisNameURL)).then((_) =>
        _.json()
      );
      cache.storeInCache(partialMatch,matches);
    } catch (err) {
      console.error(err);
    }
  }
  if (matches.length) {
    freeChildren();
    matches.forEach((p) => addCountryHTML(p));
  }
};

const SEARCH_DELAY = 300;
let autoCompleteTimer = null;

const searchInputChanged = async (e) => {
  if (autoCompleteTimer) {
    clearTimeout(autoCompleteTimer);
  }
  const { value } = e.target;
  if (value.trim()) {
    autoCompleteTimer = setTimeout(
      async () => await fetchAutoComSuggestions(value.trim()),
      SEARCH_DELAY
    );
  } else {
    fetchAll();
  }
};

const openDropDown = () => {
  const dd = document.getElementById("dropdown-wrapper");
  dd.classList.toggle("open");
};

const SUGGESTIONS_LIMIT = 32;
class AutoCompleteCache{
  constructor(){
    this.size = 0 ;
    this.keys = new Array(SUGGESTIONS_LIMIT);
    this.storedSuggestions = {};
  }
  storeInCache(key,value){
    if(this.size == SUGGESTIONS_LIMIT){
      const oldestKey = this.keys[0];
      delete this.storedSuggestions[oldestKey];
      this.keys[0] = key;
    }
    else{
      this.keys[this.size++] = key; 
    }
    this.storedSuggestions[key] = value;
  }
}
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';
import { fetchCountries } from './fetchCountries';

const refs = {
  input: document.querySelector('#search-box'),
  list: document.querySelector('.country-list'),
  info: document.querySelector('.country-info'),
};
const DEBOUNCE_DELAY = 300;

refs.input.addEventListener('input', debounce(onCurrentInput, DEBOUNCE_DELAY));

function onCurrentInput(event) {
  event.preventDefault();
  const dataInput = event.target;
  const inputValue = event.target.value.trim();

  fetchCountries(inputValue)
    .then(countries => {
      if (countries.length > 10) {
        Notify.info('Too many matches found. Please enter a more specific name.');
      } else if (countries.length > 2 && countries.length <= 10) {
        const markup = countries.reduce((markup, country) => markup + listCountries(country), '');
        refs.info.innerHTML = '';
        updateListCountries(markup);
      } else if (countries.length === 1) {
        const markup = countries.reduce((markup, country) => renderCountriesCard(country), '');
        refs.list.innerHTML = '';
        updateCountriesCard(markup);
      }
      return;
    })
    .catch(onFetchError);
}

function listCountries({ flags, name }) {
  return `<li class="country__item">
            <img class="country__image" src="${flags.svg}" alt="${
    flags.alt || `The flag of ${name.official}`
  }"/>
            <p class="country__name"> ${name.common}</p>
        </li>`;
}

function updateListCountries(markup) {
  refs.list.innerHTML = markup;
}

function renderCountriesCard({ name, capital, population, flags, languages }) {
  return `<h2 class="country-title">${name.common}</h2>
                <img class="country__image" src="${flags.svg}" alt="${
    flags.alt || `The flag of ${name.official}`
  }"/>
        <p class="country__text">Capital: ${capital}</p>
        <p class="country__text">Population: ${population}</p>
        <p class="country__text">Languages: ${Object.values(languages)}</p>`;
}

function updateCountriesCard(markup) {
  refs.info.innerHTML = markup;
}

function onFetchError(error) {
  if (!error.status) {
    refs.list.innerHTML = '';
    refs.info.innerHTML = '';
    Notify.failure('Oops, there is no country with that name');
  }
}

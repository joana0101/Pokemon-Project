// ==================== CONSTANTS ====================
const MAX_POKEMON = 200;

const typeColors = {
  normal: "#e2e204",
  fire: "#c93116",
  water: "#0875e3",
  fairy: "#c888c1",
  grass: "#63b244",
  electric: "#fbc932",
  dragon: "#4a0870",
  poison: "#a40b86",
  ground: "#7c692e",
  flying: "#697df0",
  rock: "#634d07",
  psychic: "#ef3e85",
  bug: "#8e970b",
  ice: "#0ea3ed",
  ghost: "#4b4ba3",
  dark: "#6e4e3f",
  steel: "#929292",
  fighting: "#aa4431"
};

// ==================== GLOBAL STATE ====================
let allPokemons = [];

// ==================== DOM ELEMENTS ====================
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");
const searchCloseIcon = document.querySelector("#search-close-icon");
const sortWrapper = document.querySelector(".sort-wrapper");

// ==================== POKEMON LIST PAGE ====================

// Initialize - Fetch all Pokemon data
if (listWrapper) {
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
    .then(response => response.json())
    .then(data => {
      allPokemons = data.results;
      displayPokemons(allPokemons);
    })
    .catch(error => console.error("Failed to fetch Pokemon list:", error));
}

// Display Pokemon cards
function displayPokemons(pokemon) {
  if (!listWrapper) return;
  
  listWrapper.innerHTML = "";

  pokemon.forEach((poke) => {
    const pokemonID = poke.url.split("/")[6];
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts">#${pokemonID}</p>
      </div>
      <div class="img-wrap">
        <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" 
             alt="${poke.name}" />
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${poke.name}</p>
      </div>
    `;

    listItem.addEventListener("click", () => {
      window.location.href = `./detail.html?id=${pokemonID}`;
    });

    listWrapper.appendChild(listItem);
  });
}

// ==================== SEARCH FUNCTIONALITY ====================

if (searchInput) {
  searchInput.addEventListener("keyup", handleSearch);
  searchInput.addEventListener("input", handleInputChange);
}

if (searchCloseIcon) {
  searchCloseIcon.addEventListener("click", clearSearch);
}

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons;

  if (numberFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  } else {
    filteredPokemons = allPokemons;
  }

  displayPokemons(filteredPokemons);

  // Show/hide "not found" message
  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}

function clearSearch() {
  searchInput.value = "";
  displayPokemons(allPokemons);
  notFoundMessage.style.display = "none";
  searchCloseIcon.classList.remove("search-close-icon-visible");
}

function handleInputChange() {
  if (searchInput.value !== "") {
    searchCloseIcon.classList.add("search-close-icon-visible");
  } else {
    searchCloseIcon.classList.remove("search-close-icon-visible");
  }
}

// ==================== FILTER/SORT TOGGLE ====================

if (sortWrapper) {
  sortWrapper.addEventListener("click", toggleFilterWrapper);
}

function toggleFilterWrapper() {
  document.querySelector(".filter-wrapper").classList.toggle("filter-wrapper-open");
  document.querySelector("body").classList.toggle("filter-wrapper-overlay");
}

// ==================== TYPE FILTER ====================

const typeButtons = document.querySelectorAll(".type-buttons button");
typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedType = btn.dataset.type;

    if (selectedType === "all") {
      displayPokemons(allPokemons);
    } else {
      filterByType(selectedType);
    }
  });
});

async function filterByType(type) {
  if (!listWrapper) return;
  
  listWrapper.innerHTML = "Loading...";
  notFoundMessage.style.display = "none";

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await response.json();

    const typePokemons = data.pokemon
      .map((entry) => entry.pokemon)
      .filter((p) => allPokemons.some((ap) => ap.name === p.name));

    if (typePokemons.length === 0) {
      notFoundMessage.style.display = "block";
    }

    displayPokemons(typePokemons);
  } catch (error) {
    console.error("Failed to fetch Pokémon by type:", error);
    notFoundMessage.style.display = "block";
  }
}

// ==================== DETAIL PAGE ====================

const params = new URLSearchParams(window.location.search);
const pokemonId = params.get("id");

// Fetch and display Pokemon details
async function fetchPokemonData(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json())
    ]);

    updatePokemonDetails(pokemon, pokemonSpecies);
    return true;
  } catch (error) {
    console.error("Failed to fetch Pokemon data:", error);
    return false;
  }
}

function updatePokemonDetails(pokemon, pokemonSpecies) {
  // Update name
  const nameElement = document.querySelector(".pokemon-name");
  if (nameElement) {
    nameElement.textContent = pokemon.name;
  }

  // Update ID
  const idElement = document.querySelector(".pokemon-id");
  if (idElement) {
    idElement.textContent = `#${String(pokemon.id).padStart(3, "0")}`;
  }

  // Update image
  const imageElement = document.querySelector(".pokemon-image");
  if (imageElement) {
    imageElement.src = 
      pokemon.sprites.other.dream_world.front_default || 
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default;
    imageElement.alt = pokemon.name;
  }

  // Update type badges
  const typeBadgesWrapper = document.querySelector(".type-badges-wrapper");
  if (typeBadgesWrapper) {
    typeBadgesWrapper.innerHTML = "";
    pokemon.types.forEach((typeInfo) => {
      const typeSpan = document.createElement("span");
      typeSpan.className = `type-badge ${typeInfo.type.name}`;
      typeSpan.textContent = typeInfo.type.name;
      typeSpan.style.backgroundColor = typeColors[typeInfo.type.name] || "#777";
      typeBadgesWrapper.appendChild(typeSpan);
    });
  }

  // Update weight
  const weightElement = document.querySelector(".weight");
  if (weightElement) {
    weightElement.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
  }

  // Update height
  const heightElement = document.querySelector(".height");
  if (heightElement) {
    heightElement.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  }

  // Update moves (first 3)
  const movesElement = document.querySelector(".move");
  if (movesElement) {
    movesElement.innerHTML = "";
    const moves = pokemon.moves.slice(0, 3);
    moves.forEach((moveInfo) => {
      const moveP = document.createElement("p");
      moveP.textContent = moveInfo.move.name.replace("-", " ");
      movesElement.appendChild(moveP);
    });
  }

  // Update description
  const descriptionElement = document.querySelector(".pokemon-description");
  if (descriptionElement && pokemonSpecies.flavor_text_entries) {
    const flavorText = pokemonSpecies.flavor_text_entries.find(
      (entry) => entry.language.name === "en"
    );
    if (flavorText) {
      descriptionElement.textContent = flavorText.flavor_text.replace(/\f/g, " ");
    }
  }

  // Update header background with type color
  const primaryType = pokemon.types[0].type.name;
  const headerDetail = document.querySelector(".header-detail");
  if (headerDetail) {
    const typeColor = typeColors[primaryType] || "#292929";
    headerDetail.style.background = `linear-gradient(135deg, ${typeColor}22 0%, var(--grayscale-dark) 100%)`;
  }
}

// Setup navigation arrows
function setupNavigation() {
  const leftArrow = document.getElementById("leftArrow");
  const rightArrow = document.getElementById("rightArrow");
  const currentId = parseInt(pokemonId);

  if (leftArrow) {
    if (currentId <= 1) {
      leftArrow.classList.add("hidden");
    } else {
      leftArrow.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `./detail.html?id=${currentId - 1}`;
      });
    }
  }

  if (rightArrow) {
    if (currentId >= MAX_POKEMON) {
      rightArrow.classList.add("hidden");
    } else {
      rightArrow.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `./detail.html?id=${currentId + 1}`;
      });
    }
  }
}

// Initialize detail page
if (pokemonId) {
  fetchPokemonData(pokemonId).then((success) => {
    if (success) {
      setupNavigation();
    } else {
      console.error("Failed to load Pokemon data");
    }
  });
}
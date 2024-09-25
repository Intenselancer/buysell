// ----------------------------------------- form ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".input").forEach((input) => {
    input.addEventListener("click", function () {
      const dropdownId = this.id + "Dropdown";
      const dropdown = document.getElementById(dropdownId);
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });
  });

  // Hide dropdown when selecting an option
  window.selectOption = function (value, inputId) {
    document.getElementById(inputId).value = value;
    document.getElementById(inputId + "Dropdown").style.display = "none";
  };

  // Hide dropdown when clicking anywhere outside
  window.addEventListener("click", function (event) {
    const target = event.target;
    // Check if the click was outside the inputs and dropdowns
    if (!target.matches(".input") && !target.closest(".input-dropdown")) {
      document.querySelectorAll(".form-dropdown").forEach((dropdown) => {
        dropdown.style.display = "none";
      });
    }
  });
});

// ----------------------------------------- location ---------------------------------------------------------

// Fetch the locations from the JSON file
fetch("locations.json")
  .then(response => response.json())
  .then(locationData => {
    setupLocationSearch(locationData);
  })
  .catch(error => console.error("Error loading JSON:", error));

// Function to setup search with debounce
function setupLocationSearch(locationData) {
  const locationInput = document.getElementById('location-input');
  const locationDropdown = document.querySelector('.location-dropdown');

  // Handle input and debounce the search with 1500ms
  locationInput.addEventListener('input', debounce(function (e) {
    const searchValue = e.target.value.toLowerCase();

    // If input is empty, hide the dropdown
    if (searchValue.trim() === '') {
      locationDropdown.style.display = 'none';
      return;
    }

    const filteredLocations = filterLocations(locationData, searchValue);

    // Log the json which will be sent to backend
    const logData = {
      input: searchValue,
    };

    // Log the JSON object
    console.log('Log Data:', logData);

    // Update dropdown with matched locations
    updateLocationDropdown(filteredLocations);
  }, 1500)); // Set debounce delay to 1500ms
}

// Separate function to filter locations based on search value
function filterLocations(data, searchValue) {
  const selectedPlace = data.filter(item => item.location.toLowerCase().includes(searchValue));
  return selectedPlace;
}

// Function to update the dropdown
function updateLocationDropdown(filteredLocations) {
  const locationDropdown = document.querySelector('.location-dropdown');
  locationDropdown.innerHTML = '';

  // If no match found, display "No results"
  if (filteredLocations.length === 0) {
    locationDropdown.style.display = 'block';
    locationDropdown.innerHTML = '<div class="loc"><p>No Results Found</p></div>';
    return;
  }

  // Show the dropdown and populate with results
  locationDropdown.style.display = 'block';
  let locationHTML = filteredLocations.map(item => `
    <div class="loc" onclick="selectLocation('${item.location}')">
      <img src="./assests/svgs/map.svg" alt="map">
      <p>${item.location}</p>
    </div>
  `).join('');

  locationDropdown.innerHTML = locationHTML;
}

// Function to handle selecting a location
function selectLocation(location) {
  const mapTxt = document.querySelector('.map-txt p');
  mapTxt.textContent = location;

  // Hide the map overlay
  const mapOverlay = document.getElementById('map-overlay');
  mapOverlay.style.display = 'none';
}


// ----------------------------------------- searchbar ---------------------------------------------------------

// // Debounce function to limit the number of function executions
function debounce(func, delay) {
  let debounceTimer;
  return function (...args) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function setupSearch(cardData) {
  const searchInput = document.querySelector('.search-input');
  const searchIcon = document.querySelector('.search-icon');
  const selectedCategoryElement = document.querySelector('.selected-option span');

  // On search icon click, search for matching names and categories in cardData
  searchIcon.addEventListener('click', function () {
    const searchValue = searchInput.value.toLowerCase();
    const selectedCategory = selectedCategoryElement.innerText.toLowerCase();

    // Search for matching card names and filter by category
    const filteredCards = cardData.filter(card => {
      const isMatchingTitle = card.title.toLowerCase().includes(searchValue);
      const isCategoryMatch = selectedCategory === "all" || card.category.toLowerCase() === selectedCategory;
      return isMatchingTitle && isCategoryMatch;
    });

    // Log the search value and matched card data as a JSON object
    const searchData = {
      input: searchValue,
      category: selectedCategory,
    };
    console.log('Search Data:', searchData);

    // Clear the card container and re-render with filtered cards only
    createCards(filteredCards);
  });
}

// ----------------------------------------- card image slider ---------------------------------------------------------

// fetch the JSON data from the cards.json file or use any json fetched from backend
fetch("cards.json")
  .then((response) => response.json())
  .then((cardData) => {
    createCards(cardData);
    setupSearch(cardData);
  })
  .catch((error) => console.error("Error loading JSON:", error));


// create cards and put them inside card-container class defined in index.html
function createCards(cardData) {
  const cardContainer = document.getElementById("card-container");

  cardContainer.innerHTML = '';

  // Check if there are any cards to display
  if (cardData.length === 0) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('not-found');
    errorDiv.innerHTML = `
      <i class="bi bi-emoji-dizzy"></i>
      <p>Ad not found</p>
    `;
    cardContainer.appendChild(errorDiv);
    return;
  }

  // iterate over all the cards and create a new div with class as card
  cardData.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    // check if there are multiple images available for a single card
    const hasMultipleImages = card.images.length > 1;
    if (hasMultipleImages) {
      cardElement.classList.add("has-multiple-images");
    }

    // html contents inside the card and slider functionality for multiple pages
    cardElement.innerHTML = `
        <div class="slider" id="slider-${index}">
          <img src="${card.images[0]}" alt="${card.title}" class="slider-image">
          <i class="bi bi-heart" onclick={toggleFavorite(this)}></i>
          ${hasMultipleImages
        ? `
              <div class="slider-controls">
                <button onclick="prevImage(${index})">&#10094;</button>
                <button onclick="nextImage(${index})">&#10095;</button>
              </div>
            `
        : ""
      }
            <div class="author">
              <div class="authorImg">
                  <img src="${card.authorImg}" alt="${card.authorName}" >
              </div>
              <p class="authorName">${card.authorName}</p>
            </div>
        </div>
        <div class="cardDetails">
              <h3>${card.title}</h3>
              <h4>${card.place}</h4>
              <h4>${card.distance} miles away</h4>
              <div class="cardStats">
                  <p>${card.reviews} reviews</p>
                  <span></span>
                  <div class="cardRatings">
                      <p>${card.ratings}</p>
                      <img src="./assests/svgs/star.png" alt="rating" class="star">
                  </div>
                  <span></span>
                  <div class="cardRatings">
                      <p>${card.views}</p>
                      <img src="./assests/svgs/eye.svg" alt="rating" class="star">
                  </div>
              </div>
        </div>
        
      `;
    cardContainer.appendChild(cardElement);
  });
}

const currentImageIndex = {};

// function to show the next image in the slider
function nextImage(cardIndex) {
  if (!currentImageIndex[cardIndex]) {
    currentImageIndex[cardIndex] = 0;
  }

  fetch("cards.json")
    .then((response) => response.json())
    .then((cardData) => {
      const images = cardData[cardIndex].images;
      currentImageIndex[cardIndex] =
        (currentImageIndex[cardIndex] + 1) % images.length;
      const imgElement = document.querySelector(
        `#slider-${cardIndex} .slider-image`
      );
      imgElement.src = images[currentImageIndex[cardIndex]];
    })
    .catch((error) => console.error("Error loading JSON for slider:", error));
}

// function to show the previous image in the slider
function prevImage(cardIndex) {
  if (!currentImageIndex[cardIndex]) {
    currentImageIndex[cardIndex] = 0;
  }

  fetch("cards.json")
    .then((response) => response.json())
    .then((cardData) => {
      const images = cardData[cardIndex].images;
      currentImageIndex[cardIndex] =
        (currentImageIndex[cardIndex] - 1 + images.length) % images.length;
      const imgElement = document.querySelector(
        `#slider-${cardIndex} .slider-image`
      );
      imgElement.src = images[currentImageIndex[cardIndex]];
    })
    .catch((error) => console.error("Error loading JSON for slider:", error));
}

// Function to toggle the favorite icon
function toggleFavorite(element) {
  // Check if the heart icon is already marked as favorite
  if (element.classList.contains("bi-heart")) {
    element.classList.remove("bi-heart");
    element.classList.add("bi-heart-fill");
  } else {
    element.classList.remove("bi-heart-fill");
    element.classList.add("bi-heart");
  }
}

// ----------------------------------------- services slider ---------------------------------------------------------

fetch("./services.json")
  .then((services) => services.json())
  .then((servicesData) => {
    // pass the fetched card data to the createCards function
    createServices(servicesData);
    createDropdown(servicesData);
    document.querySelector(".add").addEventListener("click", function () {
      openMenuOverlay(servicesData);
    });
  })
  .catch((error) => console.error("Error loading JSON:", error));

function createServices(servicesData) {
  // create cards and put them inside services-slider class defined in index.html
  const serviceContainer = document.getElementById("services-slider");

  // iterate over all the cards and create a new div with class as card
  servicesData.forEach((service, index) => {
    const serviceElement = document.createElement("div");
    serviceElement.classList.add("service");

    // html contents inside the card and slider functionality for multiple pages
    serviceElement.innerHTML = `
            <div class="service-stamp">
              <img src="${service.logo}" alt="${service.name}">
              <h3>${service.name}</h3>
            </div>
          `;

    serviceElement.addEventListener("click", function () {
      // remove the 'selected' border from all other cards
      const allServices = document.querySelectorAll(".service");
      allServices.forEach((item) => item.classList.remove("active"));

      // add the 'selected' border to the clicked card
      this.classList.add("active");
    });
    serviceContainer.appendChild(serviceElement);
  });
}

// track the current slide index
let currentIndex = 0;
// width of each service card, adjust based on your design
const sliderWidth = 90;

function updateSlider() {
  const serviceContainer = document.getElementById("services-slider");
  const services = document.querySelectorAll(".service");
  const containerWidth = serviceContainer.offsetWidth;

  // Calculate how many slides fit in the visible container
  const visibleSlides = Math.floor(containerWidth / sliderWidth) - 1;

  // Ensure the correct slide index is displayed based on visible slides
  serviceContainer.scrollTo({
    left: currentIndex * sliderWidth,
    behavior: "smooth",
  });

  // Hide left button if first element is displayed
  if (currentIndex === 0) {
    document.querySelector(".left-click").style.display = "none";
  } else {
    document.querySelector(".left-click").style.display = "block";
  }

  // Hide right button if the last set of visible slides are displayed
  if (currentIndex >= services.length - visibleSlides) {
    document.querySelector(".right-click").style.display = "none";
  } else {
    document.querySelector(".right-click").style.display = "block";
  }
}

// Function to hide buttons for screens above 1400px
function toggleButtonsBasedOnScreenSize() {
  if (window.innerWidth > 1000) {
    document.querySelector(".left-click").style.display = "none";
    document.querySelector(".right-click").style.display = "none";
  } else {
    updateSlider();
  }
}

// function for clicking on the next button
function nextSlide() {
  const services = document.querySelectorAll(".service");
  const serviceContainer = document.getElementById("services-slider");
  const containerWidth = serviceContainer.offsetWidth;

  // Calculate how many slides are visible based on container width
  const visibleSlides = Math.floor(containerWidth / sliderWidth) - 1;

  // Check if we can still move forward
  if (currentIndex < services.length - visibleSlides) {
    currentIndex++;
    updateSlider();
  }
}

// function for clicking on the previous button
function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
    updateSlider();
  }
}

// Call this function on window resize to dynamically hide/show buttons
window.addEventListener("resize", toggleButtonsBasedOnScreenSize);

// Call on DOMContentLoaded to set initial slider state
document.addEventListener("DOMContentLoaded", () => {
  toggleButtonsBasedOnScreenSize();
  updateSlider();
});

// ----------------------------------------- dropdown ---------------------------------------------------------

document
  .querySelector(".selected-option")
  .addEventListener("click", function (event) {
    const dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("active");
    event.stopPropagation();
  });

// close the dropdown when clicking on any dropdown-element or outside
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdown");

  if (event.target.closest(".dropdown-element")) {
    const clickedElement = event.target.closest(".dropdown-element");
    const selectedImageSrc = clickedElement.querySelector("img").src;
    const selectedServiceName = clickedElement.querySelector("li").innerText;
    document.querySelector(".selected-option img").src = selectedImageSrc;
    document.querySelector(".selected-option span").innerText = selectedServiceName;
    dropdown.classList.remove("active");
  }

  if (
    !event.target.closest("#dropdown") &&
    !event.target.closest(".selected-option")
  ) {
    dropdown.classList.remove("active");
  }
});

function createDropdown(servicesData) {
  const searchBar = document.getElementById("dropdown");

  // iterate over all the services and create a new div with class as dropdown-element
  servicesData.forEach((service, index) => {
    const dropdownElement = document.createElement("div");
    dropdownElement.classList.add("dropdown-element");

    // HTML contents inside the dropdown
    dropdownElement.innerHTML = `
              <img src="${service.logo}" class="dropdown-img" alt="${service.name}">
              <li>${service.name}</li>
          `;

    // Add event listener to hide the dropdown when a dropdown element is clicked
    dropdownElement.addEventListener("click", function () {
      const dropdown = document.getElementById("dropdown");
      dropdown.classList.remove("active");
    });

    searchBar.appendChild(dropdownElement);
  });
}

// ----------------------------------------- overlay menu ---------------------------------------------------------

function openMenuOverlay(servicesData) {
  // Create the overlay div
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  // Create the list of services with hover and click events
  const servicesList = servicesData
    .map(
      (service) => `
          <div class="service-item" data-img="${service.img}">
              <img src="${service.logo}" alt="service-img">
              <p>${service.name}</p>
          </div>
      `
    )
    .join("");

  overlay.innerHTML = `
          <div class="service-container">
              <div class="service-list">
                  ${servicesList}
              </div>
              <button class="close">
                  <img src="./assests/svgs/close.svg" alt="close">
              </button>
          </div>
      `;

  document.body.appendChild(overlay);

  // Add click event listener to the close button
  document.querySelector(".close").addEventListener("click", function () {
    // Simply remove the overlay when the close button is clicked
    document.body.removeChild(overlay);
  });
}

// Function to trigger overlay on button click
function showOverlayButton(servicesData) {
  const button = document.querySelector(".open-overlay-button");
  button.addEventListener("click", function () {
    openMenuOverlay(servicesData);
  });
}

// ----------------------------------------- map ---------------------------------------------------------

document.querySelector(".map-btn").addEventListener("click", () => {
  document.getElementById("map-overlay").style.display = "flex";
});

document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("map-overlay").style.display = "none";
});

// --------------------------------- subscription onclick ----------------------------------------------------------------

function selectSubscription(selectedCard) {
  const allSubscriptions = document.querySelectorAll('.subscription');

  // Remove 'active' class from all subscription cards
  allSubscriptions.forEach((card) => {
    card.classList.remove('active');
  });

  // Add 'active' class to the clicked subscription card
  selectedCard.classList.add('active');
}

// ---------------------------------burgermenutoggle----------------------------------------------------

function burgerMenuToggle() {
  const icon = document.querySelector('.hamburger-menu i');
  const burgerMenuLast = document.querySelector('.last');

  if (icon.classList.contains('bi-list')) {
    icon.classList.remove('bi-list');
    icon.classList.add('bi-x-lg');
    burgerMenuLast.style.right = '0px';
  } else {
    icon.classList.remove('bi-x-lg');
    icon.classList.add('bi-list');
    burgerMenuLast.style.right = '-300px';
  }
}

// -------------------------------------------------togglenotification------------------------------------------------

function toggleNotification() {
  const notificationicon = document.querySelector('.notification');

  if (notificationicon.classList.contains('bi-bell')) {
    notificationicon.classList.remove('bi-bell');
    notificationicon.classList.add('bi-bell-fill');
  } else {
    notificationicon.classList.remove('bi-bell-fill');
    notificationicon.classList.add('bi-bell');
  }
}

// -------------------------------------------------usermenutoggle------------------------------------------------

function toggleUserMenu() {
  const usermenu = document.getElementById('user-menu');
  usermenu.style.display = usermenu.style.display === 'none' || usermenu.style.display === '' ? 'flex' : 'none';
  usermenu.addEventListener('mouseleave', () => {
    usermenu.style.display = 'none';
  });
}

document.addEventListener('click', function(event) {
  const usermenu = document.getElementById('user-menu');
  const menuicon = document.getElementById('user-menu-icon');

  if (usermenu.style.display === 'flex' && !usermenu.contains(event.target) && !menuicon.contains(event.target)) {
    usermenu.style.display = 'none';
  }
});


// --------------------------------------------------mailbox------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.last');
  const toggleIcon = document.querySelector('.bi-envelope');

  // Create a mailbox wrapper inside the container
  const mailboxWrapper = document.createElement('div');
  mailboxWrapper.classList.add('mailbox');
  mailboxWrapper.style.display = 'none';
  container.appendChild(mailboxWrapper);

  // Fetch the JSON data and append divs to mailbox wrapper
  fetch('./mails.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(mail => {
        const mailbox = document.createElement('div');
        mailbox.innerHTML = `
        <a><div class="mail">
          <img src=${mail.image} alt="mail-icon">
          <p>${mail.title}</p>
        </div></a>
        `;
        mailboxWrapper.appendChild(mailbox);
      });
      const button = document.createElement('button');
      button.textContent = 'view all mails';
      button.classList.add('form-submit');
      mailboxWrapper.appendChild(button);
    })
    .catch(error => {
      console.error('Error fetching the JSON file:', error);
    });

  toggleIcon.addEventListener('click', (e) => {
    e.stopPropagation();

    if (mailboxWrapper.style.display === 'none') {
      mailboxWrapper.style.display = 'flex';
    } else {
      mailboxWrapper.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (mailboxWrapper.style.display === 'flex' && !mailboxWrapper.contains(e.target) && !toggleIcon.contains(e.target)) {
      mailboxWrapper.style.display = 'none';
    }
  });

  mailboxWrapper.addEventListener('mouseleave', () => {
    mailboxWrapper.style.display = 'none';
  });
  
});

// --------------------------------------------------wishlistbox------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.last');
  const toggleIcon = document.querySelector('.wishlist-btn');

  // Create a wishlist wrapper inside the container
  const wishlistWrapper = document.createElement('div');
  wishlistWrapper.classList.add('mailbox');
  wishlistWrapper.style.display = 'none';
  container.appendChild(wishlistWrapper);

  // Fetch the JSON data and append divs to wishlist wrapper
  fetch('./wishlist.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(fav => {
        const wishlistbox = document.createElement('div');
        wishlistbox.innerHTML = `
        <a><div class="mail">
          <img src=${fav.image} alt="mail-icon">
          <p>${fav.title}</p>
        </div></a>
        `;
        wishlistWrapper.appendChild(wishlistbox);
      });

      // Append a button to view all favorites
      const button = document.createElement('button');
      button.textContent = 'view all favorites';
      button.classList.add('form-submit');
      wishlistWrapper.appendChild(button);
    })
    .catch(error => {
      console.error('Error fetching the JSON file:', error);
    });

  // Toggle wishlist visibility on icon click
  toggleIcon.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from propagating to document-level event
    if (wishlistWrapper.style.display === 'none') {
      wishlistWrapper.style.display = 'flex';
    } else {
      wishlistWrapper.style.display = 'none';
    }
  });

  // Hide wishlistWrapper when clicking outside it or the toggle icon
  document.addEventListener('click', (e) => {
    if (wishlistWrapper.style.display === 'flex' && !wishlistWrapper.contains(e.target) && !toggleIcon.contains(e.target)) {
      wishlistWrapper.style.display = 'none';
    }
  });

  wishlistWrapper.addEventListener('mouseleave', () => {
    wishlistWrapper.style.display = 'none';
  });
});

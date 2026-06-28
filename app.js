import restaurants from "../data/restaurants.json" assert { type: "json" };

const categories = {
  ri: "RI Chowder",
  ne: "New England Chowder",
  manhattan: "Manhattan Chowder",
  cakes: "Clam Cakes"
};

const reviewDimensions = {
  ri: ["Flavor", "Clam Quantity", "Broth Quality", "Freshness", "Value", "Worth The Drive"],
  ne: ["Flavor", "Clam Quantity", "Creaminess", "Freshness", "Value", "Worth The Drive"],
  manhattan: ["Flavor", "Clam Quantity", "Tomato Broth", "Freshness", "Value", "Worth The Drive"],
  cakes: ["Flavor", "Crispiness", "Clam Distribution", "Texture", "Freshness", "Worth The Drive"]
};

const els = {
  rankGrid: document.querySelector("#rankGrid"),
  featuredCards: document.querySelector("#featuredCards"),
  regionSelect: document.querySelector("#regionSelect"),
  categorySelect: document.querySelector("#categorySelect"),
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  restaurantList: document.querySelector("#restaurantList"),
  reviewRestaurant: document.querySelector("#reviewRestaurant"),
  reviewCategory: document.querySelector("#reviewCategory"),
  reviewForm: document.querySelector("#reviewForm"),
  reviewerName: document.querySelector("#reviewerName"),
  reviewNotes: document.querySelector("#reviewNotes"),
  sliders: document.querySelector("#sliders"),
  savedFeedback: document.querySelector("#savedFeedback")
};

function hash(value) {
  return [...value].reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
}

function baseScore(restaurant, category) {
  return Math.min(9.8, Math.max(4.1, 4.4 + (Math.abs(hash(restaurant.slug + category)) % 8) / 10));
}

function getFeedback() {
  try {
    return JSON.parse(localStorage.getItem("cq-v1-feedback") || "[]");
  } catch {
    return [];
  }
}

function setFeedback(feedback) {
  localStorage.setItem("cq-v1-feedback", JSON.stringify(feedback));
}

function score(restaurant, category) {
  const feedback = getFeedback().filter((item) => item.slug === restaurant.slug && item.category === category);
  if (!feedback.length) return baseScore(restaurant, category);
  const feedbackAverage = feedback.reduce((sum, item) => sum + item.average, 0) / feedback.length;
  return (baseScore(restaurant, category) * 3 + feedbackAverage * feedback.length) / (3 + feedback.length);
}

function restaurantServes(restaurant, category) {
  return Boolean(restaurant[category]);
}

function renderRankings() {
  const ranked = restaurants
    .filter((restaurant) => restaurantServes(restaurant, "ri"))
    .map((restaurant) => ({ ...restaurant, currentScore: score(restaurant, "ri") }))
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, 5);

  els.rankGrid.innerHTML = ranked
    .map((restaurant, index) => `
      <article class="rank-card">
        <span class="rank-number">${index + 1}</span>
        <h3>${restaurant.name}</h3>
        <p>${restaurant.town}<br>RI Clam Chowder</p>
        <div class="stars">★★★★★ <small>(${178 + index * 41})</small></div>
      </article>
    `)
    .join("");
}

function renderFeatured() {
  els.featuredCards.innerHTML = restaurants
    .slice(0, 4)
    .map((restaurant) => `
      <article class="restaurant-card">
        <div class="restaurant-photo">${restaurant.icon}</div>
        <div class="restaurant-card-body">
          <h3>${restaurant.name}</h3>
          <p>${restaurant.town}, RI</p>
          <div class="stars">★★★★☆ ${score(restaurant, "ri").toFixed(1)}</div>
        </div>
      </article>
    `)
    .join("");
}

function renderRegions() {
  const regions = [...new Set(restaurants.map((restaurant) => restaurant.region))].sort();
  els.regionSelect.innerHTML = '<option value="">All Locations</option>' + regions.map((region) => `<option>${region}</option>`).join("");
  els.reviewRestaurant.innerHTML = restaurants
    .map((restaurant) => `<option value="${restaurant.slug}">${restaurant.name} — ${restaurant.town}</option>`)
    .join("");
}

function renderRestaurantList() {
  const search = els.searchInput.value.trim().toLowerCase();
  const region = els.regionSelect.value;
  const category = els.categorySelect.value;

  const filtered = restaurants.filter((restaurant) => {
    const matchesSearch = [restaurant.name, restaurant.town, restaurant.region, restaurant.status]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesRegion = !region || restaurant.region === region;
    const matchesCategory = !category || restaurantServes(restaurant, category);
    return matchesSearch && matchesRegion && matchesCategory;
  });

  els.restaurantList.innerHTML = filtered
    .map((restaurant) => `
      <article class="restaurant-row">
        <div>
          <strong>${restaurant.icon} ${restaurant.name}</strong><br>
          <small>${restaurant.town} · ${restaurant.region} · ${restaurant.status}</small>
        </div>
        <div>
          ${Object.entries(categories)
            .filter(([key]) => restaurantServes(restaurant, key))
            .map(([, label]) => `<span class="food-tag">${label}</span>`)
            .join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderSliders() {
  const dimensions = reviewDimensions[els.reviewCategory.value];
  els.sliders.innerHTML = dimensions
    .map((dimension) => `
      <div class="slider">
        <label><span>${dimension}</span><output>8</output></label>
        <input type="range" name="${dimension}" min="1" max="10" value="8" />
      </div>
    `)
    .join("");

  els.sliders.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".slider").querySelector("output").textContent = input.value;
    });
  });
}

function renderSavedFeedback() {
  const feedback = getFeedback();
  if (!feedback.length) {
    els.savedFeedback.innerHTML = "<p>No feedback saved on this device yet.</p>";
    return;
  }

  els.savedFeedback.innerHTML = feedback
    .slice()
    .reverse()
    .map((item) => {
      const restaurant = restaurants.find((candidate) => candidate.slug === item.slug);
      return `
        <div class="saved-item">
          <strong>${item.name}</strong> rated ${categories[item.category]} at ${restaurant?.name ?? "Unknown"}:
          <strong>${item.average.toFixed(1)}</strong><br>
          <small>${item.notes || "No note provided."}</small>
        </div>
      `;
    })
    .join("");
}

function bindEvents() {
  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      els.categorySelect.value = button.dataset.category;
      renderRestaurantList();
      document.querySelector("#explore").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-region]").forEach((button) => {
    button.addEventListener("click", () => {
      els.regionSelect.value = button.dataset.region;
      renderRestaurantList();
      document.querySelector("#explore").scrollIntoView({ behavior: "smooth" });
    });
  });

  [els.searchInput, els.regionSelect, els.categorySelect].forEach((input) => {
    input.addEventListener("input", renderRestaurantList);
  });

  els.searchButton.addEventListener("click", renderRestaurantList);
  els.reviewCategory.addEventListener("change", renderSliders);

  els.reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const sliderValues = [...els.sliders.querySelectorAll("input[type='range']")].map((input) => Number(input.value));
    const average = sliderValues.reduce((sum, value) => sum + value, 0) / sliderValues.length;

    const item = {
      slug: els.reviewRestaurant.value,
      category: els.reviewCategory.value,
      name: els.reviewerName.value.trim(),
      notes: els.reviewNotes.value.trim(),
      average,
      createdAt: new Date().toISOString()
    };

    setFeedback([...getFeedback(), item]);
    els.reviewForm.reset();
    renderSliders();
    renderSavedFeedback();
    renderRankings();
    renderFeatured();
    alert("Saved locally for prototype testing.");
  });
}

renderRegions();
renderRankings();
renderFeatured();
renderRestaurantList();
renderSliders();
renderSavedFeedback();
bindEvents();

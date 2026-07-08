import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://ztntlynbvjdwdimyxyde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bnRseW5idmpkd2RpbXl4eWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjExNzIsImV4cCI6MjA5ODIzNzE3Mn0.p6pbSCfoVv9tXgABnN4-oJgno6NCH-VG3XSvqTqGJrQ"
);

let restaurants = [];
const categories = {
  ri: "RI Chowder",
  ne: "New England Chowder",
  manhattan: "Manhattan Chowder",
  cakes: "Clam Cakes",
  lobster: "Lobster Rolls"
};

const categoryFields = {
  ri: ["ri", "has_ri_chowder"],
  ne: ["ne", "has_ne_chowder"],
  manhattan: ["manhattan", "has_manhattan_chowder"],
  cakes: ["cakes", "has_clam_cakes"],
  lobster: ["lobster", "has_lobster_roll"]
};

const REVIEW_SCORE_FIELDS = ["flavor", "clam_quantity", "freshness", "value_score", "portion", "worth_the_drive"];
const NEW_RESTAURANT_VALUE = "__new_restaurant__";
const liveRatings = new Map();
const driveRatings = new Map();
const categoryDriveRatings = new Map();

const preparationLabels = {
  cold_mayo: "Cold with mayo",
  hot_butter: "Hot with butter"
};

function restaurantIcon(restaurant) {
  return restaurant.icon?.trim() || "🥣";
}

function verificationLabel(restaurant) {
  const labels = {
    verified: "✓ Verified",
    needs_update: "⚑ Needs confirmation",
    unverified: "Unverified"
  };

  return labels[restaurant.verification_status] || labels.unverified;
}

const reviewDimensions = [
  { name: "flavor", label: "Flavor" },
  { name: "clam_quantity", label: "Clam Quantity" },
  { name: "freshness", label: "Freshness" },
  { name: "value_score", label: "Value" },
  { name: "portion", label: "Portion" },
  { name: "worth_the_drive", label: "Cross the Bridge Score" }
];

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
  preparationField: document.querySelector("#preparationField"),
  reviewPreparation: document.querySelector("#reviewPreparation"),
  newRestaurantFields: document.querySelector("#newRestaurantFields"),
  suggestedRestaurantName: document.querySelector("#suggestedRestaurantName"),
  suggestedRestaurantTown: document.querySelector("#suggestedRestaurantTown"),
  suggestedRestaurantWebsite: document.querySelector("#suggestedRestaurantWebsite"),
  reviewForm: document.querySelector("#reviewForm"),
  reviewerName: document.querySelector("#reviewerName"),
  reviewNotes: document.querySelector("#reviewNotes"),
  reviewSubmit: document.querySelector("#reviewSubmit"),
  sliders: document.querySelector("#sliders"),
  reviewStatus: document.querySelector("#reviewStatus"),
  latestReview: document.querySelector("#latest-review"),
  recentReviews: document.querySelector("#recentReviews"),
  driveCategory: document.querySelector("#driveCategory"),
  driveMap: document.querySelector("#driveMap")
};

let driveMap;
let driveMarkers;

function renderDriveMap() {
  if (!els.driveMap || typeof window.L === "undefined") return;

  if (!driveMap) {
    driveMap = window.L.map(els.driveMap, { scrollWheelZoom: false }).setView([41.58, -71.48], 9);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(driveMap);
    driveMarkers = window.L.featureGroup().addTo(driveMap);
  }

  driveMarkers.clearLayers();
  const activeDriveCategory = els.driveCategory?.value || "";
  const mappedRestaurants = restaurants.filter((restaurant) => {
    if (restaurant.latitude === null || restaurant.longitude === null) return false;
    if (activeDriveCategory && !restaurantServes(restaurant, activeDriveCategory)) return false;

    const latitude = Number(restaurant.latitude);
    const longitude = Number(restaurant.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      && latitude >= 41.1 && latitude <= 42.1
      && longitude >= -72 && longitude <= -70.8;
  });

  mappedRestaurants.forEach((restaurant) => {
    const driveRating = activeDriveCategory
      ? categoryDriveRatings.get(`${restaurant.id}:${activeDriveCategory}`)
      : driveRatings.get(restaurant.id);
    const categoryLabel = activeDriveCategory ? categories[activeDriveCategory] : "";
    const link = document.createElement("a");
    link.href = `./restaurant.html?slug=${encodeURIComponent(restaurant.slug)}${activeDriveCategory ? `&category=${encodeURIComponent(activeDriveCategory)}` : ""}`;
    link.textContent = activeDriveCategory ? `View ${categoryLabel} reviews` : "View restaurant & reviews";

    const name = document.createElement("strong");
    name.textContent = restaurant.name;

    const location = document.createElement("span");
    location.textContent = `${restaurant.town}, RI`;

    const rating = document.createElement("span");
    rating.className = driveRating ? "drive-popup-rating" : "drive-popup-pending";
    if (driveRating) {
      const reviewLabel = `${driveRating.reviewCount} ${driveRating.reviewCount === 1 ? "review" : "reviews"}`;
      const scoreLabel = activeDriveCategory ? `${categoryLabel} Cross the Bridge Score` : "Restaurant-wide Cross the Bridge Score";
      rating.textContent = `${scoreLabel}: ${driveRating.value.toFixed(1)}/10 · ${reviewLabel}`;
      rating.setAttribute("aria-label", `${scoreLabel} ${driveRating.value.toFixed(1)} out of 10 from ${reviewLabel}`);
    } else {
      rating.textContent = activeDriveCategory
        ? `${categoryLabel} Cross the Bridge Score: Not yet rated`
        : "Restaurant-wide Cross the Bridge Score: Not yet rated";
    }

    const popup = document.createElement("div");
    popup.className = "drive-popup";
    popup.append(name, location, rating, link);

    window.L.marker([Number(restaurant.latitude), Number(restaurant.longitude)], {
      alt: restaurant.name,
      title: restaurant.name
    })
      .bindPopup(popup)
      .addTo(driveMarkers);
  });

  if (mappedRestaurants.length) {
    driveMap.fitBounds(driveMarkers.getBounds(), { padding: [24, 24], maxZoom: 12 });
  } else {
    driveMap.setView([41.58, -71.48], 9);
  }
}

function score(restaurant, category) {
  return liveRatings.get(`${restaurant.slug}:${category}`) ?? null;
}

function ratingStars(value) {
  const filled = Math.round(value / 2);
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}

function ratingMarkup(rating) {
  if (!rating) {
    return '<div class="rating-pending">Not rated yet</div>';
  }

  const label = `${rating.reviewCount} ${rating.reviewCount === 1 ? "review" : "reviews"}`;

  return `<div class="stars" aria-label="${rating.value.toFixed(1)} out of 10, ${label}">
    <span aria-hidden="true">${ratingStars(rating.value)}</span>
    <strong>${rating.value.toFixed(1)}/10</strong>
    <small>· ${label}</small>
  </div>`;
}

function restaurantServes(restaurant, category) {
  return categoryFields[category]?.some((field) => Boolean(restaurant[field])) ?? false;
}

function renderRankings() {
  const ranked = restaurants
    .filter((restaurant) => restaurantServes(restaurant, "ri"))
    .map((restaurant) => ({ ...restaurant, rating: score(restaurant, "ri") }))
    .filter((restaurant) => restaurant.rating)
    .sort((a, b) => b.rating.value - a.rating.value)
    .slice(0, 5);

  if (!ranked.length) {
    els.rankGrid.innerHTML = '<p class="empty-state">Rankings begin when the first field reports arrive.</p>';
    return;
  }

  els.rankGrid.innerHTML = ranked
    .map((restaurant, index) => `
      <article class="rank-card">
        <span class="rank-number">${index + 1}</span>
        <h3>${restaurant.name}</h3>
        <p>${restaurant.town}<br>RI Clam Chowder</p>
        ${ratingMarkup(restaurant.rating)}
      </article>
    `)
    .join("");
}

function renderFeatured() {
  const featured = restaurants
    .slice()
    .sort((a, b) => Number(Boolean(score(b, "ri"))) - Number(Boolean(score(a, "ri"))))
    .slice(0, 4);
  els.featuredCards.innerHTML = featured.map((restaurant) => {
      const rating = score(restaurant, "ri");
      return `
      <a class="restaurant-card" href="./restaurant.html?slug=${encodeURIComponent(restaurant.slug)}">
        <div class="restaurant-photo" aria-hidden="true">${restaurantIcon(restaurant)}</div>
        <div class="restaurant-card-body">
          <h3>${restaurant.name}</h3>
          <p>${restaurant.town}, RI</p>
          ${ratingMarkup(rating)}
        </div>
      </a>
    `;
    })
    .join("");
}

function renderRegions() {
  const regions = [...new Set(restaurants.map((restaurant) => restaurant.region))].sort();
  els.regionSelect.innerHTML = '<option value="">All Locations</option>' + regions.map((region) => `<option>${region}</option>`).join("");
  els.reviewRestaurant.replaceChildren();

  const prompt = document.createElement("option");
  prompt.value = "";
  prompt.textContent = "Choose a restaurant";
  prompt.disabled = true;
  prompt.selected = true;
  els.reviewRestaurant.append(prompt);

  restaurants.forEach((restaurant) => {
    const option = document.createElement("option");
    option.value = restaurant.slug;
    option.textContent = `${restaurant.name} — ${restaurant.town}`;
    els.reviewRestaurant.append(option);
  });

  const suggestion = document.createElement("option");
  suggestion.value = NEW_RESTAURANT_VALUE;
  suggestion.textContent = "Restaurant not listed — suggest one";
  els.reviewRestaurant.append(suggestion);
  updateReviewFormMode();
}

function populateReviewCategories(restaurant = null) {
  const previousCategory = els.reviewCategory.value;
  els.reviewCategory.replaceChildren();

  const prompt = document.createElement("option");
  prompt.value = "";
  prompt.textContent = restaurant ? "Choose what you tried" : "Choose a category";
  prompt.disabled = true;
  prompt.selected = true;
  els.reviewCategory.append(prompt);

  Object.entries(categories).forEach(([key, label]) => {
    if (restaurant && !restaurantServes(restaurant, key)) return;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    els.reviewCategory.append(option);
  });

  if ([...els.reviewCategory.options].some((option) => option.value === previousCategory)) {
    els.reviewCategory.value = previousCategory;
  }
  updatePreparationField();
}

function updatePreparationField() {
  const isLobster = els.reviewCategory.value === "lobster";
  els.preparationField.hidden = !isLobster;
  els.reviewPreparation.required = isLobster;
  els.reviewPreparation.disabled = !isLobster;
  if (!isLobster) els.reviewPreparation.value = "";
}

function updateReviewFormMode() {
  const selectedSlug = els.reviewRestaurant.value;
  const isSuggestion = selectedSlug === NEW_RESTAURANT_VALUE;
  const restaurant = restaurants.find((item) => item.slug === selectedSlug) ?? null;

  els.newRestaurantFields.hidden = !isSuggestion;
  [els.suggestedRestaurantName, els.suggestedRestaurantTown].forEach((input) => {
    input.required = isSuggestion;
  });
  [els.suggestedRestaurantName, els.suggestedRestaurantTown, els.suggestedRestaurantWebsite].forEach((input) => {
    input.disabled = !isSuggestion;
  });

  els.sliders.hidden = isSuggestion;
  els.sliders.querySelectorAll("input").forEach((input) => {
    input.disabled = isSuggestion;
  });

  els.reviewSubmit.textContent = isSuggestion ? "⚓ Suggest Restaurant" : "⚓ Submit Review";

  populateReviewCategories(isSuggestion ? null : restaurant);
}

function renderRestaurantList() {
  const search = els.searchInput.value.trim().toLowerCase();
  const region = els.regionSelect.value;
  const category = els.categorySelect.value;

  const filtered = restaurants.filter((restaurant) => {
    const matchesSearch = [restaurant.name, restaurant.town, restaurant.region, verificationLabel(restaurant)]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesRegion = !region || restaurant.region === region;
    const matchesCategory = !category || restaurantServes(restaurant, category);
    return matchesSearch && matchesRegion && matchesCategory;
  });

  if (!filtered.length) {
    els.restaurantList.innerHTML = '<p class="empty-state">No restaurants match those filters.</p>';
    return;
  }

  els.restaurantList.innerHTML = filtered
    .map((restaurant) => `
      <article class="restaurant-row">
        <div>
          <strong>${restaurantIcon(restaurant)} <a class="restaurant-link" href="./restaurant.html?slug=${encodeURIComponent(restaurant.slug)}">${restaurant.name}</a></strong><br>
          <small>${[restaurant.town, restaurant.region, verificationLabel(restaurant)].join(" · ")}</small>
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
  els.sliders.innerHTML = reviewDimensions
    .map((dimension) => `
      <div class="slider">
        <label for="review-${dimension.name}"><span>${dimension.label}</span><output>8</output></label>
        <input id="review-${dimension.name}" type="range" name="${dimension.name}" min="1" max="10" value="8" />
      </div>
    `)
    .join("");

  els.sliders.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".slider").querySelector("output").textContent = input.value;
    });
  });
}

async function submitReview(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector("button[type='submit']");

  const selectedSlug = String(formData.get("restaurant_slug") || "");
  const category = String(formData.get("category") || "");
  const isSuggestion = selectedSlug === NEW_RESTAURANT_VALUE;

  submitButton.disabled = true;
  setReviewStatus(isSuggestion ? "Sending your restaurant suggestion…" : "Saving your review…");

  if (isSuggestion) {
    const website = String(formData.get("suggested_restaurant_website") || "").trim();
    const { error } = await supabase.from("restaurant_suggestions").insert({
      name: String(formData.get("suggested_restaurant_name") || "").trim(),
      town: String(formData.get("suggested_restaurant_town") || "").trim(),
      website_url: website || null,
      suggested_category: category,
      suggested_by: String(formData.get("reviewer_name") || "").trim(),
      notes: String(formData.get("comments") || "").trim() || null
    });

    if (error) {
      setReviewStatus("That suggestion didn't save. Please try again.", "error");
      console.error(error);
      submitButton.disabled = false;
      return;
    }

    form.reset();
    renderSliders();
    renderRegions();
    submitButton.disabled = false;
    setReviewStatus("Suggestion received! We’ll verify it before adding it publicly.", "success");
    return;
  }

  const restaurant = restaurants.find((item) => item.slug === selectedSlug);
  if (!restaurant || !restaurantServes(restaurant, category)) {
    setReviewStatus("Choose a valid restaurant and category.", "error");
    submitButton.disabled = false;
    return;
  }

  const { error } = await supabase.from("reviews").insert({
    restaurant_id: restaurant.id,
    reviewer_name: formData.get("reviewer_name"),
    category,
    preparation: category === "lobster" ? formData.get("preparation") : null,
    flavor: Number(formData.get("flavor")),
    clam_quantity: Number(formData.get("clam_quantity")),
    freshness: Number(formData.get("freshness")),
    value_score: Number(formData.get("value_score")),
    portion: Number(formData.get("portion")),
    worth_the_drive: Number(formData.get("worth_the_drive")),
    comments: formData.get("comments")
  });

  if (error) {
    setReviewStatus("Your review didn't save. Please try again.", "error");
    console.error(error);
    submitButton.disabled = false;
    return;
  }

  form.reset();
  renderSliders();
  renderRegions();
  submitButton.disabled = false;
  setReviewStatus("Review saved! Your report is now live.", "success");
  await loadDirectory();
}

function setReviewStatus(message, state = "") {
  els.reviewStatus.textContent = message;
  if (state) {
    els.reviewStatus.dataset.state = state;
  } else {
    delete els.reviewStatus.dataset.state;
  }
}

function reviewAverage(review) {
  const scores = REVIEW_SCORE_FIELDS
    .filter((field) => review[field] !== null && review[field] !== undefined)
    .map((field) => Number(review[field]))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 10);
  return scores.length ? scores.reduce((total, value) => total + value, 0) / scores.length : null;
}

function reviewDetailParts(review, restaurant) {
  const detailParts = [categories[review.category] || "Review"];
  if (review.category === "lobster" && preparationLabels[review.preparation]) {
    detailParts.push(preparationLabels[review.preparation]);
  }
  if (restaurant?.town) detailParts.push(`${restaurant.town}, RI`);
  return detailParts;
}

function renderLatestReview(review, restaurant) {
  els.latestReview.replaceChildren();

  if (!review || !restaurant) {
    const empty = document.createElement("p");
    empty.textContent = "No field reports yet. Be the first inspector to file one.";
    els.latestReview.append(empty);
    return;
  }

  const card = document.createElement("article");
  card.className = "latest-review";

  const average = reviewAverage(review);
  if (average !== null) {
    const score = document.createElement("p");
    score.className = "latest-review-score";
    score.textContent = `${ratingStars(average)} ${average.toFixed(1)}/10`;
    score.setAttribute("aria-label", `${average.toFixed(1)} out of 10`);
    card.append(score);
  }

  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = `./restaurant.html?slug=${encodeURIComponent(restaurant.slug)}${review.category ? `&category=${encodeURIComponent(review.category)}` : ""}`;
  link.textContent = restaurant.name;
  heading.append(link);
  card.append(heading);

  const details = document.createElement("p");
  details.className = "latest-review-details";
  details.textContent = reviewDetailParts(review, restaurant).join(" · ");
  card.append(details);

  const byline = document.createElement("strong");
  byline.textContent = review.reviewer_name || "Anonymous inspector";
  card.append(byline);

  if (review.created_at) {
    const date = document.createElement("small");
    date.textContent = ` · ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(review.created_at))}`;
    card.append(date);
  }

  if (review.comments?.trim()) {
    const notes = document.createElement("blockquote");
    notes.textContent = `“${review.comments.trim()}”`;
    card.append(notes);
  }

  els.latestReview.append(card);
}

function renderRecentReviews(reviews, restaurantById) {
  els.recentReviews.replaceChildren();

  const recentReviews = reviews
    .filter((review) => restaurantById.has(review.restaurant_id))
    .slice(0, 4);

  if (!recentReviews.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Recent reviews will appear here once inspectors file their reports.";
    els.recentReviews.append(empty);
    return;
  }

  recentReviews.forEach((review) => {
    const restaurant = restaurantById.get(review.restaurant_id);
    const card = document.createElement("article");
    card.className = "recent-review-card";

    const average = reviewAverage(review);
    if (average !== null) {
      const score = document.createElement("p");
      score.className = "recent-review-score";
      score.textContent = `${ratingStars(average)} ${average.toFixed(1)}/10`;
      score.setAttribute("aria-label", `${average.toFixed(1)} out of 10`);
      card.append(score);
    }

    const heading = document.createElement("h3");
    const link = document.createElement("a");
    link.href = `./restaurant.html?slug=${encodeURIComponent(restaurant.slug)}${review.category ? `&category=${encodeURIComponent(review.category)}` : ""}`;
    link.textContent = restaurant.name;
    heading.append(link);
    card.append(heading);

    const details = document.createElement("p");
    details.className = "recent-review-details";
    details.textContent = reviewDetailParts(review, restaurant).join(" · ");
    card.append(details);

    if (review.comments?.trim()) {
      const quote = document.createElement("blockquote");
      quote.textContent = `“${review.comments.trim()}”`;
      card.append(quote);
    }

    const cite = document.createElement("cite");
    cite.textContent = `— ${review.reviewer_name || "Anonymous inspector"}`;
    card.append(cite);

    els.recentReviews.append(card);
  });
}

async function loadDirectory() {
  els.featuredCards.innerHTML = '<p class="empty-state">Loading featured restaurants…</p>';
  els.restaurantList.innerHTML = '<p class="empty-state">Loading Rhode Island restaurants…</p>';

  const [restaurantsResult, reviewsResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("reviews")
      .select("restaurant_id, category, preparation, reviewer_name, flavor, clam_quantity, freshness, value_score, portion, worth_the_drive, comments, created_at")
      .order("created_at", { ascending: false })
  ]);

  if (restaurantsResult.error || reviewsResult.error) {
    const error = restaurantsResult.error || reviewsResult.error;
    els.featuredCards.innerHTML = '<p class="empty-state error-state">Featured restaurants are unavailable right now.</p>';
    els.restaurantList.innerHTML = '<p class="empty-state error-state">The restaurant directory is unavailable right now.</p>';
    els.rankGrid.innerHTML = '<p class="empty-state error-state">Rankings are unavailable right now.</p>';
    els.latestReview.textContent = "Latest review unavailable right now.";
    els.recentReviews.innerHTML = '<p class="empty-state error-state">Recent reviews are unavailable right now.</p>';
    els.reviewForm.querySelector("button[type='submit']").disabled = true;
    console.error(error);
    return;
  }

  restaurants = restaurantsResult.data;
  const reviews = reviewsResult.data;
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const groupedScores = new Map();
  const groupedDriveScores = new Map();
  const groupedCategoryDriveScores = new Map();
  liveRatings.clear();
  driveRatings.clear();
  categoryDriveRatings.clear();

  reviews.forEach((review) => {
    const restaurant = restaurantById.get(review.restaurant_id);
    const average = reviewAverage(review);
    if (!restaurant) return;

    const driveScore = Number(review.worth_the_drive);
    if (Number.isFinite(driveScore) && driveScore >= 1 && driveScore <= 10) {
      const driveScores = groupedDriveScores.get(restaurant.id) ?? [];
      driveScores.push(driveScore);
      groupedDriveScores.set(restaurant.id, driveScores);

      if (review.category) {
        const categoryDriveKey = `${restaurant.id}:${review.category}`;
        const categoryDriveScores = groupedCategoryDriveScores.get(categoryDriveKey) ?? [];
        categoryDriveScores.push(driveScore);
        groupedCategoryDriveScores.set(categoryDriveKey, categoryDriveScores);
      }
    }

    if (average === null || !review.category) return;

    const key = `${restaurant.slug}:${review.category}`;
    const scores = groupedScores.get(key) ?? [];
    scores.push(average);
    groupedScores.set(key, scores);
  });

  groupedScores.forEach((scores, key) => {
    liveRatings.set(key, {
      value: scores.reduce((total, value) => total + value, 0) / scores.length,
      reviewCount: scores.length
    });
  });

  groupedDriveScores.forEach((scores, restaurantId) => {
    driveRatings.set(restaurantId, {
      value: scores.reduce((total, value) => total + value, 0) / scores.length,
      reviewCount: scores.length
    });
  });

  groupedCategoryDriveScores.forEach((scores, key) => {
    categoryDriveRatings.set(key, {
      value: scores.reduce((total, value) => total + value, 0) / scores.length,
      reviewCount: scores.length
    });
  });

  renderRegions();
  renderRankings();
  renderFeatured();
  renderRestaurantList();
  renderDriveMap();
  const latestReview = reviews.find((review) => restaurantById.has(review.restaurant_id));
  renderLatestReview(latestReview ?? null, latestReview ? restaurantById.get(latestReview.restaurant_id) : null);
  renderRecentReviews(reviews, restaurantById);
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

  els.driveCategory?.addEventListener("input", renderDriveMap);
  els.searchButton.addEventListener("click", renderRestaurantList);
  els.reviewRestaurant.addEventListener("change", updateReviewFormMode);
  els.reviewCategory.addEventListener("change", updatePreparationField);
  els.reviewForm.addEventListener("submit", submitReview);
}

renderSliders();
bindEvents();
loadDirectory();

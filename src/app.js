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
  cakes: "Clam Cakes"
};

const categoryFields = {
  ri: ["ri", "has_ri_chowder"],
  ne: ["ne", "has_ne_chowder"],
  manhattan: ["manhattan", "has_manhattan_chowder"],
  cakes: ["cakes", "has_clam_cakes"]
};

const FIRST_BOWL_SLUG = "flos-middletown";
const FIRST_BOWL_SCORE_FIELDS = ["flavor", "clam_quantity", "freshness", "value_score", "portion", "worth_the_drive"];
const liveRatings = new Map();

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
  { name: "worth_the_drive", label: "Worth The Drive" }
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
  reviewForm: document.querySelector("#reviewForm"),
  reviewerName: document.querySelector("#reviewerName"),
  reviewNotes: document.querySelector("#reviewNotes"),
  sliders: document.querySelector("#sliders"),
  reviewStatus: document.querySelector("#reviewStatus"),
  latestFirstBowl: document.querySelector("#latest-first-bowl")
};

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
  const firstBowlRestaurant = restaurants.find((restaurant) => restaurant.slug === FIRST_BOWL_SLUG);
  els.reviewRestaurant.innerHTML = firstBowlRestaurant
    ? `<option value="${firstBowlRestaurant.slug}">${firstBowlRestaurant.name} — ${firstBowlRestaurant.town}</option>`
    : '<option>Flo\'s Clam Shack — unavailable</option>';
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

async function submitFirstBowlReview(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector("button[type='submit']");

  submitButton.disabled = true;
  setReviewStatus("Saving your review…");

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", FIRST_BOWL_SLUG)
    .single();

  if (restaurantError) {
    setReviewStatus("We couldn't load Flo's. Please try again.", "error");
    console.error(restaurantError);
    submitButton.disabled = false;
    return;
  }

  const { error } = await supabase.from("reviews").insert({
    restaurant_id: restaurant.id,
    reviewer_name: formData.get("reviewer_name"),
    category: "ri",
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

function firstBowlAverage(review) {
  const scores = FIRST_BOWL_SCORE_FIELDS
    .filter((field) => review[field] !== null && review[field] !== undefined)
    .map((field) => Number(review[field]))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 10);
  return scores.length ? scores.reduce((total, value) => total + value, 0) / scores.length : null;
}

function renderLatestFirstBowlReview(review) {
  els.latestFirstBowl.replaceChildren();

  if (!review) {
    const empty = document.createElement("p");
    empty.textContent = "No First Bowl reviews yet. Be the first inspector to file a report.";
    els.latestFirstBowl.append(empty);
    return;
  }

  const card = document.createElement("article");
  card.className = "latest-review";

  const average = firstBowlAverage(review);
  if (average !== null) {
    const score = document.createElement("p");
    score.className = "latest-review-score";
    score.textContent = `${ratingStars(average)} ${average.toFixed(1)}/10`;
    score.setAttribute("aria-label", `${average.toFixed(1)} out of 10`);
    card.append(score);
  }

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

  els.latestFirstBowl.append(card);
}

async function loadDirectory() {
  els.featuredCards.innerHTML = '<p class="empty-state">Loading featured restaurants…</p>';
  els.restaurantList.innerHTML = '<p class="empty-state">Loading Rhode Island restaurants…</p>';

  const [restaurantsResult, reviewsResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, slug, town, region, verification_status, has_ri_chowder, has_ne_chowder, has_manhattan_chowder, has_clam_cakes")
      .order("name", { ascending: true }),
    supabase
      .from("reviews")
      .select("restaurant_id, category, reviewer_name, flavor, clam_quantity, freshness, value_score, portion, worth_the_drive, comments, created_at")
      .order("created_at", { ascending: false })
  ]);

  if (restaurantsResult.error || reviewsResult.error) {
    const error = restaurantsResult.error || reviewsResult.error;
    els.featuredCards.innerHTML = '<p class="empty-state error-state">Featured restaurants are unavailable right now.</p>';
    els.restaurantList.innerHTML = '<p class="empty-state error-state">The restaurant directory is unavailable right now.</p>';
    els.rankGrid.innerHTML = '<p class="empty-state error-state">Rankings are unavailable right now.</p>';
    els.latestFirstBowl.textContent = "Latest review unavailable right now.";
    els.reviewForm.querySelector("button[type='submit']").disabled = true;
    console.error(error);
    return;
  }

  restaurants = restaurantsResult.data;
  const reviews = reviewsResult.data;
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const groupedScores = new Map();
  liveRatings.clear();

  reviews.forEach((review) => {
    const restaurant = restaurantById.get(review.restaurant_id);
    const average = firstBowlAverage(review);
    if (!restaurant || average === null || !review.category) return;

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

  const firstBowlRestaurant = restaurants.find((restaurant) => restaurant.slug === FIRST_BOWL_SLUG);
  const firstBowlReviews = firstBowlRestaurant
    ? reviews.filter((review) => review.restaurant_id === firstBowlRestaurant.id && review.category === "ri")
    : [];

  renderRegions();
  renderRankings();
  renderFeatured();
  renderRestaurantList();
  renderLatestFirstBowlReview(firstBowlReviews[0] ?? null);
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
  els.reviewForm.addEventListener("submit", submitFirstBowlReview);
}

renderSliders();
bindEvents();
loadDirectory();

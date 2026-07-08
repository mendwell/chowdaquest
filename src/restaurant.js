import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://ztntlynbvjdwdimyxyde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bnRseW5idmpkd2RpbXl4eWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjExNzIsImV4cCI6MjA5ODIzNzE3Mn0.p6pbSCfoVv9tXgABnN4-oJgno6NCH-VG3XSvqTqGJrQ"
);

const SCORE_FIELDS = ["flavor", "clam_quantity", "freshness", "value_score", "portion", "worth_the_drive"];
const MENU_FIELDS = [
  ["has_ri_chowder", "RI Chowder"],
  ["has_ne_chowder", "New England Chowder"],
  ["has_manhattan_chowder", "Manhattan Chowder"],
  ["has_clam_cakes", "Clam Cakes"],
  ["has_lobster_roll", "Lobster Rolls"]
];
const REVIEW_CATEGORIES = {
  ri: { field: "has_ri_chowder", label: "Rhode Island Chowder", rateHeading: "Rate This Rhode Island Chowder" },
  manhattan: { field: "has_manhattan_chowder", label: "Manhattan Chowder", rateHeading: "Rate This Manhattan Chowder" },
  ne: { field: "has_ne_chowder", label: "New England Chowder", rateHeading: "Rate This New England Chowder" },
  cakes: { field: "has_clam_cakes", label: "Clam Cakes", rateHeading: "Rate These Clam Cakes" },
  lobster: { field: "has_lobster_roll", label: "Lobster Rolls", rateHeading: "Rate This Lobster Roll" }
};
const PREPARATION_LABELS = {
  cold_mayo: "Cold with mayo",
  hot_butter: "Hot with butter"
};

const slug = new URLSearchParams(window.location.search).get("slug") || "flos-middletown";
let restaurant;
let activeCategory = "ri";
let allReviews = [];

const els = {
  name: document.querySelector("#detailName"),
  location: document.querySelector("#detailLocation"),
  photo: document.querySelector("#detailPhoto"),
  verification: document.querySelector("#detailVerification"),
  tags: document.querySelector("#detailTags"),
  categorySummary: document.querySelector("#detailCategorySummary"),
  categoryControl: document.querySelector("#detailCategoryControl"),
  category: document.querySelector("#detailCategory"),
  facts: document.querySelector("#detailFacts"),
  score: document.querySelector("#detailScore"),
  reviews: document.querySelector("#detailReviews"),
  recentReviews: document.querySelector("#detailRecentReviews"),
  reviewsHeading: document.querySelector("#detailReviewsHeading"),
  reviewPanel: document.querySelector("#review"),
  reviewHeading: document.querySelector("#detailReviewHeading"),
  form: document.querySelector("#detailReviewForm"),
  preparationControl: document.querySelector("#detailPreparationControl"),
  preparation: document.querySelector("#detailPreparation"),
  quantityLabel: document.querySelector("#detailQuantityLabel"),
  status: document.querySelector("#detailReviewStatus")
};

function reviewAverage(review) {
  const values = SCORE_FIELDS
    .filter((field) => review[field] !== null && review[field] !== undefined)
    .map((field) => Number(review[field]))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 10);

  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function reviewAverageGroup(reviews) {
  const values = reviews.map(reviewAverage).filter((value) => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function crossBridgeAverage(reviews) {
  const values = reviews
    .map((review) => Number(review.worth_the_drive))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 10);

  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function stars(value) {
  const filled = Math.round(value / 2);
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function setStatus(message, state = "") {
  els.status.textContent = message;
  if (state) els.status.dataset.state = state;
  else delete els.status.dataset.state;
}

function addFact(label, value, href) {
  if (!value) return;
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");

  if (href) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = value;
    if (href.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    description.append(link);
  } else {
    description.textContent = value;
  }

  els.facts.append(term, description);
}

function availableReviewCategories() {
  return Object.entries(REVIEW_CATEGORIES).filter(([, category]) => restaurant[category.field]);
}

function reviewCategoryLabel(review) {
  const parts = [REVIEW_CATEGORIES[review.category]?.label || "Review"];
  if (review.category === "lobster" && PREPARATION_LABELS[review.preparation]) {
    parts.push(PREPARATION_LABELS[review.preparation]);
  }
  return parts.join(" · ");
}

function categoryReviews(category) {
  return allReviews.filter((review) => review.category === category);
}

function renderCategoryControl() {
  const categories = availableReviewCategories();
  els.category.replaceChildren();

  categories.forEach(([value, category]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = category.label;
    els.category.append(option);
  });

  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  activeCategory = categories.some(([value]) => value === requestedCategory)
    ? requestedCategory
    : categories[0]?.[0] || "ri";
  els.category.value = activeCategory;
  els.categoryControl.hidden = !categories.length;
  els.reviewPanel.hidden = !categories.length;
  updateCategoryCopy();
  renderCategorySummary();
}

function renderCategorySummary() {
  els.categorySummary.replaceChildren();
  const categories = availableReviewCategories();

  if (!categories.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No review categories are listed for this restaurant yet.";
    els.categorySummary.append(empty);
    return;
  }

  categories.forEach(([value, category]) => {
    const reviews = categoryReviews(value);
    const average = reviewAverageGroup(reviews);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-summary-card";
    button.dataset.category = value;
    button.setAttribute("aria-pressed", String(value === activeCategory));

    const label = document.createElement("strong");
    label.textContent = category.label;

    const meta = document.createElement("span");
    const reviewCount = reviews.length;
    const reviewLabel = `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`;
    meta.textContent = average === null
      ? `${reviewLabel} · not rated yet`
      : `${reviewLabel} · ${average.toFixed(1)}/10`;

    button.append(label, meta);
    button.addEventListener("click", () => {
      activeCategory = value;
      els.category.value = value;
      updateCategoryCopy();
      setStatus("");
      updateCategoryUrl();
      renderPageReviews();
    });
    els.categorySummary.append(button);
  });
}

function updateCategoryCopy() {
  const category = REVIEW_CATEGORIES[activeCategory] || { label: "Chowder", rateHeading: "Rate This Bowl" };
  els.reviewsHeading.textContent = `Latest ${category.label} Reviews`;
  els.reviewHeading.textContent = category.rateHeading;
  const isLobsterRoll = activeCategory === "lobster";
  els.preparationControl.hidden = !isLobsterRoll;
  els.preparation.disabled = !isLobsterRoll;
  els.preparation.required = isLobsterRoll;
  els.quantityLabel.textContent = "Featured Ingredient Quantity";
}

function updateCategoryUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("category", activeCategory);
  window.history.replaceState({}, "", url);
}

function renderRestaurant() {
  document.title = `${restaurant.name} | ChowdaQuest RI`;
  els.name.textContent = restaurant.name;
  els.location.textContent = `${restaurant.town} · ${restaurant.region}`;
  els.tags.replaceChildren();
  els.facts.replaceChildren();

  const photo = els.photo.querySelector("img");
  const credit = els.photo.querySelector("figcaption");
  if (restaurant.photo_url) {
    photo.src = restaurant.photo_url;
    photo.alt = restaurant.photo_alt || `Exterior of ${restaurant.name}`;
    credit.textContent = restaurant.photo_credit || "Restaurant photo";
  } else {
    photo.src = "./assets/chowder-hero.png";
    photo.alt = "Captain Chowder placeholder artwork";
    credit.textContent = "Restaurant photo pending permission";
  }

  const verificationLabels = {
    verified: "✓ Official details verified",
    needs_update: "⚑ Listing needs confirmation",
    unverified: "Listing not yet verified"
  };
  const verificationStatus = restaurant.verification_status || "unverified";
  els.verification.hidden = false;
  els.verification.dataset.status = verificationStatus;
  els.verification.textContent = verificationLabels[verificationStatus] || verificationLabels.unverified;

  MENU_FIELDS.filter(([field]) => restaurant[field]).forEach(([, label]) => {
    const tag = document.createElement("span");
    tag.className = "food-tag";
    tag.textContent = label;
    els.tags.append(tag);
  });

  addFact("Address", restaurant.address);
  addFact("Phone", restaurant.phone, restaurant.phone ? `tel:${restaurant.phone.replace(/[^\d+]/g, "")}` : null);
  addFact("Hours", restaurant.hours_summary);
  addFact("Official website", restaurant.website_url ? "Visit website ↗" : null, restaurant.website_url);
  addFact("Official menu", restaurant.menu_url ? "View current menu ↗" : null, restaurant.menu_url);
  addFact("Verification source", restaurant.verified_source_url ? "View official source ↗" : null, restaurant.verified_source_url);
  addFact("Verification notes", restaurant.verification_notes);

  renderCategoryControl();
}

function renderScore(reviews) {
  els.score.replaceChildren();
  const category = REVIEW_CATEGORIES[activeCategory];
  const bridgeAverage = crossBridgeAverage(reviews);
  const overallAverage = reviewAverageGroup(reviews);

  const label = document.createElement("p");
  label.className = "detail-score-label";
  label.textContent = "Cross the Bridge Score™";
  els.score.append(label);

  if (bridgeAverage === null) {
    const heading = document.createElement("strong");
    heading.textContent = "Not rated yet";
    const copy = document.createElement("p");
    copy.textContent = `Would you cross the bridge for ${category.label} here? Be the first to weigh in.`;
    els.score.append(heading, copy);
    return;
  }

  const starsLine = document.createElement("p");
  starsLine.className = "detail-stars";
  starsLine.textContent = stars(bridgeAverage);
  starsLine.setAttribute("aria-label", `${bridgeAverage.toFixed(1)} out of 10`);

  const value = document.createElement("strong");
  value.textContent = `${bridgeAverage.toFixed(1)}/10`;

  const count = document.createElement("small");
  count.textContent = `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;
  els.score.append(starsLine, value, count);

  if (overallAverage !== null) {
    const overall = document.createElement("p");
    overall.className = "detail-overall-score";
    overall.textContent = `Overall ${category.label} rating: ${overallAverage.toFixed(1)}/10`;
    els.score.append(overall);
  }
}

function renderReviews(reviews) {
  els.reviews.replaceChildren();

  if (!reviews.length) {
    const empty = document.createElement("p");
    empty.textContent = "No reviews yet. Captain Chowder awaits your report.";
    els.reviews.append(empty);
    return;
  }

  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";

    const heading = document.createElement("div");
    heading.className = "review-card-heading";
    const reviewer = document.createElement("strong");
    reviewer.textContent = review.reviewer_name || "Anonymous inspector";
    const date = document.createElement("small");
    date.textContent = formatDate(review.created_at);
    heading.append(reviewer, date);

    const average = reviewAverage(review);
    const score = document.createElement("p");
    score.className = "stars";
    score.textContent = average === null ? "Rating unavailable" : `${stars(average)} ${average.toFixed(1)}/10`;

    card.append(heading);

    if (review.preparation && PREPARATION_LABELS[review.preparation]) {
      const preparation = document.createElement("span");
      preparation.className = "review-preparation";
      preparation.textContent = PREPARATION_LABELS[review.preparation];
      card.append(preparation);
    }

    card.append(score);

    if (review.comments?.trim()) {
      const comments = document.createElement("blockquote");
      comments.textContent = `“${review.comments.trim()}”`;
      card.append(comments);
    }

    els.reviews.append(card);
  });
}

function renderRecentRestaurantReviews() {
  els.recentReviews.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "Recent Reviews for This Restaurant";
  els.recentReviews.append(heading);

  if (!allReviews.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No reviews for this restaurant yet.";
    els.recentReviews.append(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "mini-review-list";

  allReviews.slice(0, 3).forEach((review) => {
    const card = document.createElement("article");
    card.className = "mini-review-card";

    const category = document.createElement("strong");
    category.textContent = reviewCategoryLabel(review);
    card.append(category);

    const average = reviewAverage(review);
    const meta = document.createElement("p");
    meta.textContent = average === null
      ? `${review.reviewer_name || "Anonymous inspector"} · Rating unavailable`
      : `${stars(average)} ${average.toFixed(1)}/10 · ${review.reviewer_name || "Anonymous inspector"}`;
    card.append(meta);

    if (review.comments?.trim()) {
      const comments = document.createElement("blockquote");
      comments.textContent = `“${review.comments.trim()}”`;
      card.append(comments);
    }

    list.append(card);
  });

  els.recentReviews.append(list);
}

function renderPageReviews() {
  const reviews = categoryReviews(activeCategory);
  renderScore(reviews);
  renderReviews(reviews);
  renderCategorySummary();
  renderRecentRestaurantReviews();
}

async function loadReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  allReviews = data;
  renderPageReviews();
}

async function loadPage() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    els.name.textContent = "Restaurant not found";
    els.location.textContent = "Return to Explore and choose another restaurant.";
    els.score.textContent = "Rating unavailable.";
    els.reviews.textContent = "Reviews unavailable.";
    els.form.hidden = true;
    console.error(error);
    return;
  }

  restaurant = data;
  renderRestaurant();

  try {
    await loadReviews();
  } catch (reviewsError) {
    els.score.textContent = "Rating unavailable.";
    els.reviews.textContent = "Reviews unavailable right now.";
    console.error(reviewsError);
  }
}

async function submitReview(event) {
  event.preventDefault();
  const button = els.form.querySelector("button[type='submit']");
  const formData = new FormData(els.form);

  button.disabled = true;
  setStatus("Saving your review…");

  const review = {
    restaurant_id: restaurant.id,
    reviewer_name: formData.get("reviewer_name"),
    category: activeCategory,
    flavor: Number(formData.get("flavor")),
    clam_quantity: Number(formData.get("clam_quantity")),
    freshness: Number(formData.get("freshness")),
    value_score: Number(formData.get("value_score")),
    portion: Number(formData.get("portion")),
    worth_the_drive: Number(formData.get("worth_the_drive")),
    comments: formData.get("comments")
  };

  if (activeCategory === "lobster") review.preparation = formData.get("preparation");

  const { error } = await supabase.from("reviews").insert(review);

  if (error) {
    setStatus("Your review didn't save. Please try again.", "error");
    console.error(error);
    button.disabled = false;
    return;
  }

  els.form.reset();
  els.form.querySelectorAll("output").forEach((output) => { output.textContent = "8"; });
  button.disabled = false;
  setStatus("Review saved! Your report is now live.", "success");
  await loadReviews();
}

els.form.querySelectorAll("input[type='range']").forEach((input) => {
  input.addEventListener("input", () => {
    input.closest(".slider").querySelector("output").textContent = input.value;
  });
});

els.form.addEventListener("submit", submitReview);
els.category.addEventListener("change", () => {
  activeCategory = els.category.value;
  updateCategoryCopy();
  setStatus("");
  updateCategoryUrl();
  renderPageReviews();
});
loadPage();

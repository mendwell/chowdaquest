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
  ["has_clam_cakes", "Clam Cakes"]
];

const slug = new URLSearchParams(window.location.search).get("slug") || "flos-middletown";
let restaurant;

const els = {
  name: document.querySelector("#detailName"),
  location: document.querySelector("#detailLocation"),
  tags: document.querySelector("#detailTags"),
  score: document.querySelector("#detailScore"),
  reviews: document.querySelector("#detailReviews"),
  reviewPanel: document.querySelector("#review"),
  form: document.querySelector("#detailReviewForm"),
  status: document.querySelector("#detailReviewStatus")
};

function reviewAverage(review) {
  const values = SCORE_FIELDS
    .filter((field) => review[field] !== null && review[field] !== undefined)
    .map((field) => Number(review[field]))
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

function renderRestaurant() {
  document.title = `${restaurant.name} | ChowdaQuest RI`;
  els.name.textContent = restaurant.name;
  els.location.textContent = `${restaurant.town} · ${restaurant.region}`;
  els.tags.replaceChildren();

  MENU_FIELDS.filter(([field]) => restaurant[field]).forEach(([, label]) => {
    const tag = document.createElement("span");
    tag.className = "food-tag";
    tag.textContent = label;
    els.tags.append(tag);
  });

  els.reviewPanel.hidden = !restaurant.has_ri_chowder;
}

function renderScore(reviews) {
  const reviewScores = reviews.map(reviewAverage).filter((value) => value !== null);
  els.score.replaceChildren();

  if (!reviewScores.length) {
    const heading = document.createElement("strong");
    heading.textContent = restaurant.has_ri_chowder ? "Not rated yet" : "No RI chowder listed";
    const copy = document.createElement("p");
    copy.textContent = restaurant.has_ri_chowder
      ? "Be the first inspector to file a report."
      : "Reviews for other chowder styles are coming next.";
    els.score.append(heading, copy);
    return;
  }

  const average = reviewScores.reduce((total, value) => total + value, 0) / reviewScores.length;
  const starsLine = document.createElement("p");
  starsLine.className = "detail-stars";
  starsLine.textContent = stars(average);
  starsLine.setAttribute("aria-label", `${average.toFixed(1)} out of 10`);

  const value = document.createElement("strong");
  value.textContent = `${average.toFixed(1)}/10`;

  const count = document.createElement("small");
  count.textContent = `${reviewScores.length} ${reviewScores.length === 1 ? "review" : "reviews"}`;
  els.score.append(starsLine, value, count);
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

    card.append(heading, score);

    if (review.comments?.trim()) {
      const comments = document.createElement("blockquote");
      comments.textContent = `“${review.comments.trim()}”`;
      card.append(comments);
    }

    els.reviews.append(card);
  });
}

async function loadReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("reviewer_name, flavor, clam_quantity, freshness, value_score, portion, worth_the_drive, comments, created_at")
    .eq("restaurant_id", restaurant.id)
    .eq("category", "ri")
    .order("created_at", { ascending: false });

  if (error) throw error;
  renderScore(data);
  renderReviews(data);
}

async function loadPage() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, town, region, has_ri_chowder, has_ne_chowder, has_manhattan_chowder, has_clam_cakes")
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
loadPage();

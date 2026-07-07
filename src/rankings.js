import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://ztntlynbvjdwdimyxyde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bnRseW5idmpkd2RpbXl4eWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjExNzIsImV4cCI6MjA5ODIzNzE3Mn0.p6pbSCfoVv9tXgABnN4-oJgno6NCH-VG3XSvqTqGJrQ"
);

const SCORE_FIELDS = ["flavor", "clam_quantity", "freshness", "value_score", "portion", "worth_the_drive"];
const CATEGORY_FIELDS = {
  ri: "has_ri_chowder",
  ne: "has_ne_chowder",
  manhattan: "has_manhattan_chowder",
  cakes: "has_clam_cakes",
  lobster: "has_lobster_roll"
};

let restaurants = [];
let reviews = [];

const els = {
  category: document.querySelector("#rankingCategory"),
  region: document.querySelector("#rankingRegion"),
  status: document.querySelector("#rankingsStatus"),
  list: document.querySelector("#rankingsList")
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

function createRestaurantLink(restaurant) {
  const link = document.createElement("a");
  link.href = `./restaurant.html?slug=${encodeURIComponent(restaurant.slug)}`;
  link.textContent = restaurant.name;
  return link;
}

function renderRankedRow(item, index) {
  const row = document.createElement("article");
  row.className = "full-ranking-row";

  const rank = document.createElement("span");
  rank.className = "full-rank-number";
  rank.textContent = String(index + 1);

  const identity = document.createElement("div");
  identity.className = "ranking-identity";
  const name = createRestaurantLink(item.restaurant);
  const location = document.createElement("small");
  location.textContent = `${item.restaurant.town} · ${item.restaurant.region}`;
  identity.append(name, location);

  const rating = document.createElement("div");
  rating.className = "ranking-score";
  const starLine = document.createElement("span");
  starLine.className = "stars";
  starLine.textContent = stars(item.value);
  starLine.setAttribute("aria-label", `${item.value.toFixed(1)} out of 10`);
  const value = document.createElement("strong");
  value.textContent = `${item.value.toFixed(1)}/10`;
  const count = document.createElement("small");
  count.textContent = `${item.reviewCount} ${item.reviewCount === 1 ? "review" : "reviews"}`;
  rating.append(starLine, value, count);

  row.append(rank, identity, rating);
  return row;
}

function renderAwaitingRow(restaurant) {
  const row = document.createElement("article");
  row.className = "awaiting-row";

  const identity = document.createElement("div");
  const name = createRestaurantLink(restaurant);
  const location = document.createElement("small");
  location.textContent = `${restaurant.town} · ${restaurant.region}`;
  identity.append(name, location);

  const state = document.createElement("span");
  state.textContent = "Awaiting reports";
  row.append(identity, state);
  return row;
}

function renderRankings() {
  const category = els.category.value;
  const region = els.region.value;
  const eligible = restaurants.filter(
    (restaurant) => restaurant[CATEGORY_FIELDS[category]] && (!region || restaurant.region === region)
  );
  const restaurantById = new Map(eligible.map((restaurant) => [restaurant.id, restaurant]));
  const grouped = new Map();

  reviews
    .filter((review) => review.category === category && restaurantById.has(review.restaurant_id))
    .forEach((review) => {
      const average = reviewAverage(review);
      if (average === null) return;
      const scores = grouped.get(review.restaurant_id) ?? [];
      scores.push(average);
      grouped.set(review.restaurant_id, scores);
    });

  const ranked = [...grouped.entries()]
    .map(([restaurantId, scores]) => ({
      restaurant: restaurantById.get(restaurantId),
      value: scores.reduce((total, value) => total + value, 0) / scores.length,
      reviewCount: scores.length
    }))
    .sort((a, b) => b.value - a.value || b.reviewCount - a.reviewCount || a.restaurant.name.localeCompare(b.restaurant.name));

  const rankedIds = new Set(ranked.map((item) => item.restaurant.id));
  const awaiting = eligible
    .filter((restaurant) => !rankedIds.has(restaurant.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  els.list.replaceChildren();

  if (ranked.length) {
    const standings = document.createElement("section");
    standings.className = "ranking-group";
    const heading = document.createElement("h2");
    heading.textContent = "Current Standings";
    standings.append(heading, ...ranked.map(renderRankedRow));
    els.list.append(standings);
  }

  if (awaiting.length) {
    const pending = document.createElement("section");
    pending.className = "ranking-group awaiting-group";
    const heading = document.createElement("h2");
    heading.textContent = "Further Investigation Required";
    pending.append(heading, ...awaiting.map(renderAwaitingRow));
    els.list.append(pending);
  }

  if (!eligible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No restaurants match this category and region.";
    els.list.append(empty);
  }

  els.status.textContent = `${ranked.length} ranked · ${awaiting.length} awaiting reports`;
}

async function loadRankings() {
  const [restaurantsResult, reviewsResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("reviews")
      .select("restaurant_id, category, flavor, clam_quantity, freshness, value_score, portion, worth_the_drive")
  ]);

  if (restaurantsResult.error || reviewsResult.error) {
    els.status.textContent = "Live standings are unavailable right now.";
    els.status.dataset.state = "error";
    console.error(restaurantsResult.error || reviewsResult.error);
    return;
  }

  restaurants = restaurantsResult.data;
  reviews = reviewsResult.data;
  const regions = [...new Set(restaurants.map((restaurant) => restaurant.region))].sort();
  els.region.innerHTML = '<option value="">All Rhode Island</option>' + regions.map((region) => `<option>${region}</option>`).join("");
  renderRankings();
}

els.category.addEventListener("change", renderRankings);
els.region.addEventListener("change", renderRankings);
loadRankings();

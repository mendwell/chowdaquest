const REVIEW_PHOTO_BUCKET = "review-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

function safePathPart(value) {
  return String(value || "review")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "review";
}

function photoAlt(restaurantName, categoryLabel) {
  const food = categoryLabel ? `${categoryLabel} review` : "food review";
  return `${food} photo from ${restaurantName}`;
}

export function getSelectedReviewPhoto(formData) {
  const file = formData.get("review_photo");
  return file instanceof File && file.size > 0 ? file : null;
}

export function validateReviewPhoto(file) {
  if (!file) return null;

  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return "Please upload a JPG, PNG, or WebP food photo.";
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return "Please keep food photos under 5 MB.";
  }

  return null;
}

export async function uploadReviewPhoto({ supabase, file, restaurant, category, categoryLabel }) {
  if (!file) return {};

  const extension = ALLOWED_PHOTO_TYPES.get(file.type);
  const restaurantPart = safePathPart(restaurant.slug || restaurant.name);
  const categoryPart = safePathPart(category);
  const uniquePart = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const path = `${restaurantPart}/${categoryPart}/${uniquePart}.${extension}`;

  const { error } = await supabase.storage
    .from(REVIEW_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage.from(REVIEW_PHOTO_BUCKET).getPublicUrl(path);

  return {
    photo_url: data.publicUrl,
    photo_path: path,
    photo_alt: photoAlt(restaurant.name, categoryLabel)
  };
}

export function appendReviewPhoto(card, review) {
  if (!review.photo_url) return;

  const figure = document.createElement("figure");
  figure.className = "review-photo";

  const image = document.createElement("img");
  image.src = review.photo_url;
  image.alt = review.photo_alt || "Review food photo";
  image.loading = "lazy";

  figure.append(image);
  card.append(figure);
}

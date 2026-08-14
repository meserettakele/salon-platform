const { Salon } = require("../models");
const fs = require("fs");
const path = require("path");

/**
 * Safely unlinks an isolated image asset tracking string from disk storage.
 */
const deleteFileFromDisk = (relativeFilePath) => {
  if (!relativeFilePath) return;
  const absolutePath = path.join(__dirname, "../../", relativeFilePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

/**
 * Uploads or updates the primary salon logo file route.
 */
exports.uploadSalonLogo = async (ownerId, file) => {
  if (!file) {
    const error = new Error("No image file payload provided.");
    error.statusCode = 400;
    throw error;
  }

  const salon = await Salon.findOne({ where: { ownerId } });
  if (!salon) {
    const error = new Error("No registered salon assigned to this account.");
    error.statusCode = 404;
    throw error;
  }

  if (salon.logo) {
    deleteFileFromDisk(salon.logo);
  }

  const relativePath = `uploads/salons/${file.filename}`;
  await salon.update({ logo: relativePath });

  return salon;
};

/**
 * Appends a verified asset reference string to the Salon model JSON column.
 */
exports.addGalleryImage = async (ownerId, file) => {
  if (!file) {
    const error = new Error("No gallery image file payload provided.");
    error.statusCode = 400;
    throw error;
  }

  const salon = await Salon.findOne({ where: { ownerId } });
  if (!salon) {
    const error = new Error("No registered salon assigned to this account.");
    error.statusCode = 404;
    throw error;
  }

  // Safe parsing fallback calculation for engine dialects
  let currentGallery = [];
  if (salon.gallery) {
    currentGallery =
      typeof salon.gallery === "string"
        ? JSON.parse(salon.gallery)
        : salon.gallery;
  }

  if (!Array.isArray(currentGallery)) {
    currentGallery = [];
  }

  const relativePath = `uploads/salons/${file.filename}`;
  currentGallery.push(relativePath);

  // Directly pass the array payload; Sequelize handles stringifying for JSON types automatically
  await salon.update({ gallery: currentGallery });

  return salon;
};

/**
 * Strips an asset tracking string track from the JSON array and clears it from disk.
 */
exports.removeGalleryImage = async (ownerId, targetImagePath) => {
  if (!targetImagePath) {
    const error = new Error("Target image path is required.");
    error.statusCode = 400;
    throw error;
  }

  const salon = await Salon.findOne({ where: { ownerId } });
  if (!salon) {
    const error = new Error("No registered salon assigned to this account.");
    error.statusCode = 404;
    throw error;
  }

  if (!salon.gallery) {
    const error = new Error(
      "The target salon does not contain any active gallery images.",
    );
    error.statusCode = 404;
    throw error;
  }

  let currentGallery =
    typeof salon.gallery === "string"
      ? JSON.parse(salon.gallery)
      : salon.gallery;
  if (!Array.isArray(currentGallery)) {
    const error = new Error(
      "Gallery configuration context is corrupted or formatted incorrectly.",
    );
    error.statusCode = 500;
    throw error;
  }

  const imageIndex = currentGallery.indexOf(targetImagePath);
  if (imageIndex === -1) {
    const error = new Error(
      "The requested image path could not be located in this salon gallery.",
    );
    error.statusCode = 404;
    throw error;
  }

  // Remove the file from the filesystem first
  deleteFileFromDisk(targetImagePath);

  // Splice out the target path and persist the updated array state
  currentGallery.splice(imageIndex, 1);
  await salon.update({ gallery: currentGallery });

  return salon;
};

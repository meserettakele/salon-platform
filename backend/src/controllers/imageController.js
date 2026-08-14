const imageService = require("../services/imageService");

exports.uploadLogo = async (req, res) => {
  try {
    const updatedSalon = await imageService.uploadSalonLogo(
      req.user.id,
      req.file,
    );
    return res.status(200).json({
      success: true,
      message: "Salon primary logo updated successfully.",
      data: updatedSalon,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.uploadGallery = async (req, res) => {
  try {
    const updatedSalon = await imageService.addGalleryImage(
      req.user.id,
      req.file,
    );
    return res.status(200).json({
      success: true,
      message: "Image successfully added to salon gallery.",
      data: updatedSalon,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const updatedSalon = await imageService.removeGalleryImage(
      req.user.id,
      req.body.imagePath,
    );
    return res.status(200).json({
      success: true,
      message: "Image cleared from gallery and removed from storage.",
      data: updatedSalon,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

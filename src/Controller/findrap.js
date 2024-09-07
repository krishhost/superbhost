const Rap = require("../Schema/rap");

const viewRap = async (req, res) => {
  try {
    const { shape, quality, color, size_start, size_end } = req.body;

    // Validate input parameters with specific error messages

    if (!shape) {
      return res.status(400).json({ message: "Shape parameter is empty." });
    }
    if (!size_start) {
      return res
        .status(400)
        .json({ message: "Size start parameter is empty." });
    }
    if (!size_end) {
      return res.status(400).json({ message: "Size end parameter is empty." });
    }
    if (!color) {
      return res.status(400).json({ message: "Color parameter is empty." });
    }

    if (!quality) {
      return res.status(400).json({ message: "Clarity parameter is empty." });
    }

    // Find the data in the database
    const data = await Rap.findOne({
      shape: shape,
      quality: quality,
      color: color,
      size_start: parseFloat(size_start),
      size_end: parseFloat(size_end),
    });

    if (!data) {
      return res
        .status(400)
        .json({ valid: false, message: "There is no rap available." });
    }

    res.json({ price: data.price });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
};

module.exports = { viewRap };

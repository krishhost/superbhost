const Stock = require("../Schema/stock");
const User = require("../Schema/user");

const createStock = async (req, res) => {
  try {
    const newStock = new Stock(req.body);
    console.log("Check", newStock);
    const user_email = req.user.email;
    const { last_stock_id, invoice_number } = newStock;
    console.log(invoice_number);

    const user = await User.findOne({ email: user_email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    user.last_stock_id = last_stock_id;
    user.invoice_number = invoice_number;
    await newStock.save();
    await user.save();
    res
      .status(201)
      .json({ success: true, message: "Stock data saved successfully." });
  } catch (error) {
    console.error("Error saving stock data:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to save stock data." });
  }
};

const viewStock = async (req, res) => {
  try {
    const filters = { ...req.body, ...req.query, in_stock: 1 };
    const stocks = await Stock.find(filters).sort({ deal_date: -1 });
    if (stocks.length === 0) {
      return res.status(404).json({ message: "No stocks found" });
    }
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve stock data", error });
  }
};

const sellStock = async (req, res) => {
  try {
    const { last_stock_id } = req.body;

    if (!last_stock_id) {
      return res.status(400).json({ message: "last_stock_id is required" });
    }

    const stock = await Stock.findOne({ last_stock_id });

    if (!stock) {
      return res
        .status(404)
        .json({ message: "Stock not found with the provided last_stock_id" });
    }

    stock.in_stock = 0;

    await stock.save();

    return res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stock", error });
  }
};

module.exports = { createStock, viewStock, sellStock };

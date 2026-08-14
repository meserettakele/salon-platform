const ownerTransactionService = require("../services/ownerTransactionService");

// ==========================================
// OWNER - GET TRANSACTIONS
// ==========================================

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await ownerTransactionService.getTransactions(
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const { readAllCSVFiles } = require('../services/fbtService');

// Controller: Handle API logic (req/res)
async function getAllFbtData(req, res) {
  try {
    const data = await readAllCSVFiles();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read CSV files' });
  }
}

module.exports = {
  getAllFbtData,
};

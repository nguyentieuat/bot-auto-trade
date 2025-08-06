const subscriptionPackageService = require('../services/subscriptionPackageService');

const getAllSubscriptionPackages = async (req, res) => {
  try {
    const packages = await subscriptionPackageService.getAllSubscriptionPackages();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching subscription packages:', error);
    res.status(500).json({ error: 'Failed to fetch subscription packages' });
  }
};

module.exports = {
  getAllSubscriptionPackages,
};
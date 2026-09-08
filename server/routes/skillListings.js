const express = require('express');
const router = express.Router();
const {
  createListing, getListings, getListing, updateListing,
  deleteListing, getMyListings, getCategories
} = require('../controllers/skillListingController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/my', protect, getMyListings);
router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getStats, adminGetUsers, adminDeleteUser,
  adminUpdateUserRole, adminGetListings, adminDeleteListing
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', adminGetUsers);
router.delete('/users/:id', adminDeleteUser);
router.put('/users/:id/role', adminUpdateUserRole);
router.get('/listings', adminGetListings);
router.delete('/listings/:id', adminDeleteListing);

module.exports = router;

const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/', getUsers);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;

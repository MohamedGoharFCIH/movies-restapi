const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');

const check_auth = require("../middleware/check-auth");

const router = express.Router();

const User = require('../models/user');


router.post('/create',
    body('name', 'name must exists ').exists(),
    body('name', 'name  cannot be Empty').not().isEmpty(),
    body('email', 'email must be exist').exists(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'password must exists ').exists(),
    body('password', 'password cannot be Empty').not().isEmpty(),
    check_auth.checkAuth,
    userController.createUser
);

router.post('/login',
    body('email', 'email must be exist').exists(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'password must exists ').exists(),
    body('password', 'password cannot be Empty').not().isEmpty(),
    userController.userLogin
);

router.get('/users/', check_auth.checkAuth, userController.getUsers);

router.get('/:id', check_auth.checkAuth, userController.getUser);



module.exports = router;
const express = require('express');
const { body } = require('express-validator');

const categoryController = require('../controllers/category');

const check_auth = require("../middleware/check-auth");

const file = require("../middleware/file");

const router = express.Router();

router.post("/add",
    body('title', 'title must exists ').exists(),
    body('title', 'title  cannot be Empty').not().isEmpty(),
    check_auth.checkAuth,
    categoryController.createCategory
);

router.put("/edit/:id",
    body('title', 'title must exists').exists(),
    body('title', 'title cannot be Empty').not().isEmpty(),
    check_auth.checkAuth,
    categoryController.updateCategory
);

router.get("/categories", check_auth.checkAuth, categoryController.getCategories);


router.get("/:id",
    check_auth.checkAuth,
    categoryController.getCategory);

router.delete("/:id", check_auth.checkAuth, categoryController.deleteCategory);


module.exports = router;

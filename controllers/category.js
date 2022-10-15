const Category = require("../models/category");
const helper = require("../helpers/helper");
const { validationResult } = require('express-validator');


exports.createCategory = async (req, res, next) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exists = await Category.findOne({ title: req.body.title });
    if (exists) {
      return res.status(409).json({
        error: "error from create Category , this title is exist"
      })
    }
    const category = new Category({
      title: req.body.title,
    });
    let newCategory = await category.save();
    if (newCategory) {
      return res.status(201).json({
        message: " new Category created successfully",
        category: {
          newCategory
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: "Creating Category failed!"
    });
  };
};

exports.updateCategory = async (req, res, next) => {
  try {

    const exists = await Category.findById(helper.objId(req.params.id));
    if (!exists) {
      return res.status(404).json({
        error: " Category Not found"
      })
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const category = new Category({
      _id:helper.objId(req.params.id),
      title: req.body.title,
    });

    let updated_category = await Category.updateOne({ _id: helper.objId(req.params.id) }, category)
    if (updated_category) {
      return res.status(200).json({ message: "Update successful!" });
    }

  }
  catch (error) {
    console.log(error)
    return res.status(500).json({ error: error, message: "Couldn't udpate Category!" });
  };

};
exports.getCategories = async (req, res, next) => {
  let fetchedCategories = []
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const fetchQuery = Category.find();
  if (pageSize && currentPage) {
    fetchQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  fetchQuery
    .then(categories => {
      fetchedCategories = categories;
      return Category.count();
    })
    .then(count => {
      return res.status(200).json({
        message: "Categories fetched successfully!",
        MaxCategories: count,
        categories: fetchedCategories,
        
      });
    })
    .catch(error => {
      return res.status(500).json({
        message: "Fetching Categories failed!",
        error: error
      });
    });

};

exports.getCategory = async (req, res, next) => {
  try {

    let category = await Category.findById(helper.objId(req.params.id));
    if (category) {
      return res.status(200).json({
        message: "Category fetched",
        category
      });
    }
    else {
      return res.status(404).json({ message: "Category not found!" });
    }
  } catch (error) {
    console.log("err", error)
    return res.status(500).json({
      message: "Fetching Category failed!",
      error: error
    })
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const exists = await Category.findById(helper.objId(req.params.id));
    if (!exists) {
      return res.status(404).json({
        error: " Category Not found"
      })
    }
    let deletedCategory = await Category.deleteOne({ _id: helper.objId(req.params.id) })
    if (deletedCategory) {
      return res.status(200).json({ message: "deletion successful!" });
    }
  }
  catch (error) {
    return res.status(500).json({
      message: "Couldn't delete Category!",
      error: error
    });
  };

};



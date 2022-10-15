const express = require('express');
const { body } = require('express-validator');


const movieController = require('../controllers/movie');

const check_auth = require("../middleware/check-auth");

const file = require("../middleware/file");

const router = express.Router();

router.post("/add",
    body('title', 'title must exists ').exists(),
    body('title', 'title cannot be Empty').not().isEmpty(),
    check_auth.checkAuth,
    movieController.createMovie
);

router.put("/edit/:id",
    body('title', 'title must exists ').exists(),
    body('title', 'title cannot be Empty').not().isEmpty(),
    check_auth.checkAuth,
    movieController.updateMovie
);

router.get("/movies", check_auth.checkAuth, movieController.getMovies);


router.get("/:id", check_auth.checkAuth, movieController.getMovie);

router.delete("/:id", check_auth.checkAuth, movieController.deleteMovie);

router.get("/rate/:movieId", check_auth.checkAuth, movieController.getMovieRate);

router.put("/rate/:movieId",
    body('rate', 'rate must exists').exists(),
    body('rate', 'rate must be Int betwwen 1 and 5 ').isInt({ min: "1", max: "5" }),
    check_auth.checkAuth,
    movieController.rateMovie
);



module.exports = router;

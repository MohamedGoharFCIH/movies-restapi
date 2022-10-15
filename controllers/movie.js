const Movie = require("../models/movie");
const Rate = require("../models/rate");
const helper = require("../helpers/helper");

const { validationResult } = require('express-validator');



exports.createMovie = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const exists = await Movie.findOne({ title: req.body.title });
    if (exists) {
      return res.status(409).json({
        error: "error from create Movie , this title is exist"
      })
    }
    const url = req.protocol + "://" + req.get("host");
    const movie = new Movie({
      title: req.body.title,
      image: url + "/images/" + req.file.filename,
      description: req.body.description,
      category: helper.objId(req.body.category)
    });
    let new_movie = await movie.save();
    if (new_movie) {
      return res.status(201).json({
        message: " new Movie created successfully",
        movie: {
          new_movie,

        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: "Creating Movie failed!"
    });
  };
};

exports.updateMovie = async (req, res, next) => {
  try {

    const exists = await Movie.findById(helper.objId(req.params.id));
    if (!exists) {
      return res.status(404).json({
        error: " Movie Not found"
      })
    }


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }



    let image = req.body.image;
    if (req.file) {
      console.log("req", req.file)
      const url = req.protocol + "://" + req.get("host");
      image = url + "/images/" + req.file.filename;
    }
    const movie = new Movie({
      _id: helper.objId(req.params.id),
      title: req.body.title,
      category: helper.objId(req.body.category),
      description: req.body.description,
      image: image,

    });

    let updated_movie = await Movie.updateOne({ _id: helper.objId(req.params.id) }, movie)
    if (updated_movie) {
      return res.status(200).json({ message: "Update successful!" });
    }

  }
  catch (error) {
    return res.status(500).json({ error: error, message: "Couldn't udpate Movie!" });
  };

};
exports.getMovies = async (req, res, next) => {
  let fetchedMovies = []
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let where = {}
  if (req.query.title) {
    where = { ...where, title: req.query.title }
  }
  if (req.query.rate) {
    where = { ...where, avarage_rate: req.query.rate }
  }
  if (req.query.category) {
    where = { ...where, category: helper.objId(req.query.category) }
  }


  const fetchQuery = Movie
    .find(where)
    .populate("category")
    .populate("rates");
  if (pageSize && currentPage) {
    fetchQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  fetchQuery
    .then(movies => {
      fetchedMovies = movies;
      return Movie.count();
    })
    .then(count => {
      return res.status(200).json({
        message: "Movies fetched successfully!",
        maxMovies: count,
        movies: fetchedMovies,

      });
    })
    .catch(error => {
      return res.status(500).json({
        message: "Fetching Movies failed!",
        error: error
      });
    });

};

exports.getMovie = async (req, res, next) => {
  try {
    let movie = await Movie
      .findById(helper.objId(req.params.id))
      .populate("category")
      .populate("rates")
    if (movie)
      return res.status(200).json({
        message: "Movie fetched",
        movie
      });

    else
      return res.status(404).json({ message: "Movie not found!" });

  } catch (error) {
    return res.status(500).json({
      message: "Fetching Movie failed!",
      error: error
    })
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const exists = await Movie.findById(helper.objId(req.params.id));
    if (!exists) {
      return res.status(404).json({
        error: " Movie Not found"
      })
    }


    let deletedMovie = await Movie.deleteOne({ _id: helper.objId(req.params.id) })
    if (deletedMovie) {
      return res.status(200).json({ message: "deletion successful!" });
    }
  }
  catch (error) {
    return res.status(500).json({
      message: "Couldn't delete Movie!",
      error: error
    });
  };

};



exports.rateMovie = async (req, res, next) => {
  try {
    const exists = await Movie.findById(helper.objId(req.params.movieId));
    if (!exists) {
      return res.status(404).json({
        error: " Movie Not found"
      })
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const rate = new Rate({
      rate: req.body.rate,
      movie: req.params.movieId
    });
    const created_rate = await rate.save();
    if (created_rate) {
      Rate.aggregate([
        { "$match": { movie: helper.objId(req.params.movieId) } },
        { "$unwind": "$movie" },
        {
          "$group": {
            "_id": "$movie",
            "rateAvg": { "$avg": "$rate" }
          }
        }
      ], function (err, results) {
        if (err) {
          return res.status(500).json({
            message: "error cannot not update avg rate ",
            error: err
          })
        };

        Movie.populate(results, { "path": "_id" }, async (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "error cannot not update avg rate ",
              error: err
            })
          }

          const movie = await Movie.updateOne(
            { _id: req.params.movieId },
            { $set: { avarage_rate: result[0].rateAvg } },
            { $push: { rates: created_rate._id } },
          )

          if (movie) {

            return res.status(200).json({
              message: "rate Movie successful : " + req.body.rate + "",
              "avarage rate": result[0].rateAvg
            });
          }
        });
      })
    }
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Couldn't rate Movie!",
      error: error
    });
  };

};



exports.getMovieRate = async (req, res, next) => {
  try {

    const exists = await Movie.findById(helper.objId(req.params.movieId));
    if (!exists) {
      return res.status(404).json({
        error: " Movie Not found"
      })
    }

    Rate.aggregate([
      { "$match": { movie: helper.objId(req.params.movieId) } },
      { "$unwind": "$movie" },
      {
        "$group": {
          "_id": "$movie",
          "rateAvg": { "$avg": "$rate" }
        }
      }
    ], function (err, results) {
      if (err) {
        return res.status(500).json({
          message: "error from get avg rating",
          error: err
        })
      };
      console.log("results", results)
      Movie.populate(results, { "path": "_id" }, function (err, result) {
        if (err) {
          return res.status(500).json({
            message: "error from get avg rating",
            error: err
          })
        }
        console.log("result", result)
        return res.status(200).json({
          message: "avg rate fetched",
          rateAvg: result[0].rateAvg
        })
      });
    })
  } catch (e) {
    console.log("error", e)
    return res.status(500).json({
      error: e,
      message: "error from get avg rate "
    })
  }
};



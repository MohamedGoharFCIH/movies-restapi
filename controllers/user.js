const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validationResult } = require('express-validator');
const helper = require("../helpers/helper");


exports.seed_admin = async () => {
    try {


        const exist_user = await User.findOne({ email: process.env.email });
        if (exist_user) {

            return
        }

        const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(process.env.password, 10, function (err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        })
        if (hash) {
            const user = new User({
                name: process.env.name,
                email: process.env.email,
                password: hash,
            })

            const newUser = await user.save();
            if (newUser) {
                console.log("admin created")
                return
                    ;
            }
        }
    } catch (err) {

        console.log("error from create admin", err)
        return
    };

};

exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const exist_user = await User.findOne({ email: req.body.email });
        if (exist_user) {
            return res.status(409).json({
                error: "cannot create user ... User aleardy exist"
            })
        }

        const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(req.body.password, 10, function (err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        })
        if (hash) {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                birthdate: req.body.birthdate
            })

            const newUser = await user.save();
            if (newUser) {
                return res.status(201).json({
                    msg: 'User Created ..!',
                    user: newUser
                });
            }
        }
    } catch (err) {
        console.log("error from create User", err)
        return res.status(500).json({
            message: "Invalid authentication credentials!",
        });
    };

};

exports.userLogin = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(401).json({
                message: "Auth Field , User Not Found"
            });
        }

        const compared_pass = await new Promise((resolve, reject) => {
            bcrypt.compare(req.body.password, user.password, function (err, compared) {
                if (err) reject(err)
                resolve(compared)
            });
        })

        if (!compared_pass) {
            return res.status(401).json({
                message: " Wrong Password! ... Auth Field "
            });
        }

        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_KEY,
            { expiresIn: "20d" }
        );
        console.log(token);
        return res.status(200).json({
            token: token,
            expiresIn: 20 * 24 * 60 * 60 * 1000,
            userId: user._id,
        });


    } catch (err) {
        return res.status(401).json({
            message: "Invalid authentication credentials!",
            error: err
        });
    };
};

exports.getUsers = (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    console.log(req.query)
    const userQuery = User.find();
    let fetchedUsers;
    if (pageSize && currentPage) {
        userQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    userQuery
        .then(users => {
            fetchedUsers = users;
            return User.count();
        })
        .then(count => {
            return res.status(200).json({
                message: "Users fetched successfully!",
                maxUsers: count,
                users: fetchedUsers,

            });
        })
        .catch(error => {
            return res.status(500).json({
                message: "Fetching users failed!"
            });
        });
};

exports.getUser = (req, res, next) => {
    User.findById(helper.objId(req.params.id))
        .then(user => {
            if (user) {
                return res.status(200).json({
                    message: "user fetched",
                    user: user
                });
            } else {
                res.status(404).json({ message: "user not found!" });
            }
        })
        .catch(error => {
            return res.status(500).json({
                message: "Fetching user failed!"
            });
        });
};


const controller = {};
const { User } = require('../models');
const md5 = require('md5');

controller.register = (req, res) => {
    console.log(req.body);
    let { firstName, lastName, password, email } = req.body;
    password = md5(password);
    const userData = {
        firstName,
        lastName,
        password,
        email
    }
    User.findAll({ where: { email } }).then(resp => {
        if (resp.length === 0) {
            return true;
        } else {
            const err = {
                status: false,
                comments: 'User is already registered.',
            }
            throw err;
        }
    }).then(() => {
        User.create(userData).then(() => {
            return res.status(200).send({ status: true, comments: 'User registered successfully.' });
        })
    }).catch(err => {
        return res.status(500).send(err);
    })
}

controller.login = (req, res) => {
    const email = req.body.username;
    const password = md5(req.body.password);
    User.findAll({ where: { email } }).then(resp => {
        if (resp.length === 0) {
            const err = {
                status: false,
                comments: 'User is not registered with us.',
            }
            throw err;
        } else {
            return true;
        }
    }).then(() => {
        User.findOne({ where: { email, password } }).then(resp => {
            console.log(resp)
            if (resp == null) {
                const err = {
                    status: false,
                    comments: 'Username and password combination is wrong.',
                }
                throw err;
            } else {
                return res.status(200).send({ status: true, comments: 'Logged in successfully.', data: resp });
            }
        }).catch(err => {
            return res.status(500).send(err);
        })
    }).catch(err => {
        return res.status(500).send(err);
    })

}



module.exports = controller;
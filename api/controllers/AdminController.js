var mongoose = require('mongoose')
var User = mongoose.model('User')
var bcrypt = require('bcrypt')

exports.list = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to list admins' })
    }
    User.find({ role: 'admin' }, { password: false })
        .sort('fullName')
        .exec(function(err, admins) {
            if (err) return res.send(err)
            res.json({ success: true, data: admins })
        })
}

exports.create = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to create admins' })
    }
    if (!req.body.name.first)
        return res.status(400).json({ success: false, message: 'First name is required' })
    if (!req.body.name.last) return res.status(400).json({ success: false, message: 'Last name is required' })
    if (!req.body.email) return res.status(400).json({ success: false, message: 'Email is required' })
    if (!req.body.password) return res.status(400).json({ success: false, message: 'Password is required' })
    var admin = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        role: 'admin'
    })
    admin.save(function(err, admin) {
        if (err) return res.send(err)
        res.json({ success: true, data: admin })
    })
}

exports.read = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to read admins' })
    }
    if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Admin not found' })
    }
    User.findById(req.params.id, { password: false }, function(err, admin) {
        if (err) return res.send(err)
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
        res.json({ success: true, data: admin })
    })
}

exports.update = function(req, res) {
    if (req.decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not allowed to update this admin' })
    }
    if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Admin not found' })
    }
    User.findById(req.params.id, function(err, admin) {
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
        admin.name = req.body.name || admin.name
        admin.email = req.body.email || admin.email
        admin.password = req.body.password ? bcrypt.hashSync(req.body.password, 10) : admin.password
        admin.save(function(err, admin) {
            if (err) return res.send(err)
            res.json({ success: true, data: admin })
        })
    })
}

exports.delete = function(req, res) {
    if (req.decoded.role !== 'admin' || req.decoded._id == req.params.id) {
        return res.status(403).json({ success: false, message: 'You are not allowed to delete this admin' })
    }
    if (!req.params.id) return res.status(400).json({ success: false, message: 'ID is required' })
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Admin not found' })
    }
    User.findByIdAndRemove(req.params.id, function(err, admin) {
        if (err) return res.send(err)
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' })
        res.json({ success: true })
    })
}

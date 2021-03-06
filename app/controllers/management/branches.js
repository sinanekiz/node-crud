const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const enums = require('../../utils/enums');
const { getBranchConditions } = require('../../utils/helper');
const { respond, respondOrRedirect } = require('../../utils');
const { wrap: async } = require('co');

const Branch = mongoose.model('Branch');

const base = require('../base').configure(Branch, "branches");

const auth = require("../../../config/middlewares/authorization").checkCrudRights;

router.use(function (req, res, next) {
    auth.findAllRights(req, req.rights.crud.branch); next();
});

router.param('_id', base.findOne);

router.get('/index', auth.hasRead, base.index);
router.get('/datatable', auth.hasRead, base.datatable);

router.get('/edit/:_id?', auth.hasRead, base.edit);
router.post('/create', auth.hasCreate,function(req,res,next){
    req.body.parent=req.user.branchRoles[0].branch;
    console.log(req.body.parent)
    next();
}, base.post);
router.post('/edit/:_id', auth.hasUpdate, base.put);
router.delete('/delete/:_id', auth.hasDelete, async(function* (req, res, next) {
    var childs = yield Branch.list({ conditions: { parent: req.params._id } });
    if (!childs.length) { return next(); }
    res.json({
        type: 'error',
        text: 'Please move this branch sub branches before delete'
    });
}), base.delete);
router.get('/all', auth.hasRead, base.all);

//page level 

router.get('/tree', auth.hasRead, async(function* (req, res) {

    res.render('branches/tree', {
        crud: {
            create: "/" + "branches" + "/edit/",
            update: "/" + "branches" + "/edit/",
            delete: "/" + "branches" + "/delete/",
            read: "/" + "branches" + "/edit/",
        }
    });
}));


router.get('/treeList', auth.hasRead, async(function* (req, res) {
    var options = yield getBranchConditions(req.user, req.currentRight);
    var tree = yield Branch.list(options);
    var data = []
    tree.filter(function (t) {
        isExist = tree.filter(x => x._id == t.parent);
        t.parent = isExist.length == 0 ? "#" : t.parent;
        data.push({
            id: t._id,
            text: t.name,
            parent: t.parent || "#",
            state: {
                opened: true
            },
            type: t.__t
        })
    });
    res.send(data);
}));



module.exports = router;
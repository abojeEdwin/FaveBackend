const express = require('express');
const router = express.Router();

module.exports = (controller)=>{
    router.post('/login',controller.login);
    return router;
};
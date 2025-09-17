import express from 'express';
const router = express.Router();

export default (controller)=>{
    router.post('/login',controller.login);
    return router;
};
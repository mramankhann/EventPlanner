import express from 'express';
import { 
    register, 
    login, 
    getUsers, 
    deleteUser, 
    verifyDisplayCode, 
    regenerateDisplayCode, 
    getUser,
    updatePassword,
    updateRole,
    logout
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-code', verifyDisplayCode);
router.post('/regenerate-code', regenerateDisplayCode);
router.get('/user/:id', getUser);
router.get('/users', getUsers);
router.put('/users/password', updatePassword);
router.put('/users/role', updateRole);
router.delete('/users/:id', deleteUser);

export default router;

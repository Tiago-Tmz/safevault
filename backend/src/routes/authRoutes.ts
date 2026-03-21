import { Router } from 'express';
import { login, logout, me } from '../controllers/authController';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Demasiadas tentativas. Tenta novamente mais tarde.' },
});

router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', me);

export default router;
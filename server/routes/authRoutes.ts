import { Router } from 'express';
import { 
  createGuestSessionHandler, 
  registerHandler, 
  loginHandler, 
  getCurrentUserHandler, 
  logoutHandler 
} from '../controllers/authController.ts';

const router = Router();

router.post('/guest', createGuestSessionHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', getCurrentUserHandler);
router.post('/logout', logoutHandler);

export default router;

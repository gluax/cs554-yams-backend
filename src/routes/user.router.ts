import { Request, Response, Router } from 'express';
import * as User from '../controllers/user.controller';
const router: Router = Router();

router.post('/signup', User.registerUser);

export default router;

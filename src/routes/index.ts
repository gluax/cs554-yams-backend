import { Router, Request, Response } from 'express';
import UserRouter from './user.router';
const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
   res.send('<marquee>the server is working</marquee>');
});

router.use('/user', UserRouter);

router.use('*', (req: Request, res: Response) => {
   res
      .status(418)
      .json({ error: `i'm a teapot`, meme: 'https://http.cat/418' });
});

export default router;

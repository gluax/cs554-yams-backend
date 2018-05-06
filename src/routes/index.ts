import { Router, Request, Response } from 'express';
const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
   res.send('<marquee>the server is working</marquee>');
});

router.get('/test', (req: Request, res: Response) => {
   res.json({ msg: 'this is a test' });
});

router.use('*', (req: Request, res: Response) => {
   res
      .status(418)
      .json({ error: `i'm a teapot`, meme: 'https://http.cat/418' });
});

export default router;

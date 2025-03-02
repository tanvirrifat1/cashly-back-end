import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import cron from 'node-cron';
import { UserSuspentionService } from './app/modules/userSuspention/userSuspention.service';
import { logger } from './shared/logger';
import { SubscriptationService } from './app/modules/subscription/subscription.service';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Run every day at midnight
cron.schedule('* * * * *', async () => {
  await UserSuspentionService.reactivateUsers();
  logger.info('Reactivation user completed');
});

cron.schedule('* * * * *', async () => {
  await SubscriptationService.updateExpiredSubscriptions();
  logger.info('Expired subscriptions updated');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hey, How can I assist you today!!!</h1>'
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;

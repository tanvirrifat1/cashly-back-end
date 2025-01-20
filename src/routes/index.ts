import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { SettingRoutes } from '../app/modules/setting/setting.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { UserSuspentionRoutes } from '../app/modules/userSuspention/userSuspention.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';
import { AgencyRoutes } from '../app/modules/agency/agency.route';
import { BuyerRoutes } from '../app/modules/buyer/buyer.route';
import { DocumentRoutes } from '../app/modules/document/document.route';
import { PermissionRoutes } from '../app/modules/permission/permission.route';
import { SubUserRoutes } from '../app/modules/subAccount/subAccount.route';
import { currencyRoutes } from '../app/modules/currency/currency.routes';
import { OrderRoutes } from '../app/modules/orderCurrency/orderCurrency.route';
import { BuyerReqForAgencyRoutes } from '../app/modules/buyerReqForAgency/buyerReq.route';

const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/setting', route: SettingRoutes },
  { path: '/notification', route: NotificationRoutes },
  { path: '/user-suspention', route: UserSuspentionRoutes },
  { path: '/message', route: MessageRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/agency', route: AgencyRoutes },
  { path: '/buyer', route: BuyerRoutes },
  { path: '/msg', route: MessageRoutes },
  { path: '/document', route: DocumentRoutes },
  { path: '/permission', route: PermissionRoutes },
  { path: '/subuser', route: SubUserRoutes },
  { path: '/currency', route: currencyRoutes },
  { path: '/Order', route: OrderRoutes },
  { path: '/req', route: BuyerReqForAgencyRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;

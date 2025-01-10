import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';

const superUser = {
  firstName: 'Yousuf',
  lastName: 'Ahmed',
  role: USER_ROLES.SUPER_ADMIN,
  email: config.super_admin.email,
  password: config.super_admin.password,
  loginStatus: 'approved',
  address: 'libya',
  phone: '01711111111',
  image: 'https://i.ibb.co.com/2sw32KM/user.png',
  verified: true,
};

const seedAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({
    role: USER_ROLES.SUPER_ADMIN,
  });

  if (!isExistSuperAdmin) {
    await User.create(superUser);
    logger.info(colors.green('✔super-admin created successfully!'));
  }
};

export default seedAdmin;

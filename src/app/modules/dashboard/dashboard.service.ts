import { USER_ROLES } from '../../../enums/user';
import { Subscriptation } from '../subscription/subscription.model';
import { User } from '../user/user.model';

const totalStatistics = async () => {
  const [totalEarnings, totalUsers, totalSubscriptation] = await Promise.all([
    Subscriptation.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]).then(result => (result.length > 0 ? result[0].totalAmount : 0)),

    // Total active users
    User.countDocuments({
      role: {
        $in: [
          USER_ROLES.AGENCY,
          USER_ROLES.BUYER,
          USER_ROLES.SUB_USER,
          USER_ROLES.ADMIN,
        ],
      },
      status: 'active',
    }),

    // Total active products
    Subscriptation.countDocuments({ status: 'active' }),
  ]);

  return {
    totalEarnings,
    totalUsers,
    totalSubscriptation,
  };
};

export const DashboardService = {
  totalStatistics,
};

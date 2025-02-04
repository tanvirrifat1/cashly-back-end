import { USER_ROLES } from '../../../enums/user';
import { months } from '../../../helpers/month';
import { Agency } from '../agency/agency.model';
import { Buyer } from '../buyer/buyer.model';
import { Subscriptation } from '../subscription/subscription.model';
import { User } from '../user/user.model';

const totalStatistics = async () => {
  const [totalRevenue, totalBuyer, totalAgencies] = await Promise.all([
    Subscriptation.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]).then(result => (result.length > 0 ? result[0].totalAmount : 0)),

    Buyer.countDocuments({ status: 'active' }),
    Agency.countDocuments({ status: 'active' }),
  ]);

  return {
    totalRevenue, // This is the total subscription amount
    totalBuyer,
    totalAgencies,
  };
};

const getEarningChartData = async () => {
  const matchConditions: any = { status: 'active' };

  const result = await Subscriptation.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startDate' } },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $addFields: {
        month: {
          $dateToString: {
            format: '%b',
            date: { $dateFromString: { dateString: '$_id' } },
          },
        },
        year: {
          $dateToString: {
            format: '%Y',
            date: { $dateFromString: { dateString: '$_id' } },
          },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        month: 1,
        totalAmount: 1,
        year: 1,
      },
    },
    {
      $group: {
        _id: '$year',
        earnings: {
          $push: {
            month: '$month',
            totalAmount: '$totalAmount',
          },
        },
      },
    },
    {
      $addFields: {
        allMonths: months,
      },
    },
    {
      $project: {
        earnings: {
          $map: {
            input: '$allMonths',
            as: 'month',
            in: {
              $let: {
                vars: {
                  monthData: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$earnings',
                          as: 'item',
                          cond: { $eq: ['$$item.month', '$$month'] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  month: '$$month',
                  totalAmount: { $ifNull: ['$$monthData.totalAmount', 0] },
                },
              },
            },
          },
        },
      },
    },
  ]);

  return result;
};

const getRecentUsers = async () => {
  const result = await User.find({
    role: { $in: [USER_ROLES.BUYER, USER_ROLES.AGENCY] },
  })
    .populate('buyer agencis')
    .sort({ createdAt: -1 })
    .limit(5);

  return result;
};

export const DashboardService = {
  totalStatistics,
  getEarningChartData,
  getRecentUsers,
};

import { FilterQuery, Query } from 'mongoose';

export class QueryBuilder<T> {
  public query: Record<string, unknown>; //payload
  public modelQuery: Query<T[], T>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.query = query;
    this.modelQuery = modelQuery;
  }
  search(searchableFields: string[]) {
    let searchTerm = '';

    if (this.query?.searchTerm) {
      searchTerm = this.query.searchTerm as string;
    }

    this.modelQuery = this.modelQuery.find({
      $or: searchableFields.map(
        field =>
          ({
            [field]: new RegExp(searchTerm, 'i'),
          } as FilterQuery<T>)
      ),
    });
    return this;
  }
  paginate() {
    let limit: number = Number(this.query?.limit || 10);

    let skip: number = 0;

    if (this.query?.page) {
      const page: number = Number(this.query?.page || 1);
      skip = Number((page - 1) * limit);
    }

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }
  sort() {
    let sortBy = '-createdAt';

    if (this.query?.sortBy) {
      sortBy = this.query.sortBy as string;
    }

    this.modelQuery = this.modelQuery.sort(sortBy);

    return this;
  }
  fields() {
    let fields = '';

    if (this.query?.fields) {
      fields = (this.query?.fields as string).split(',').join(' ');
    }

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = [
      'searchTerm',
      'page',
      'limit',
      'sortBy',
      'fields',
      'min',
      'max',
      'menu',
      'starRating',
    ];

    excludeFields.forEach(e => delete queryObj[e]);

    if (queryObj.startDate && queryObj.endDate) {
      console.log('Valid date range found.');

      // Create a range query for a single field (startDate)
      queryObj.startDate = {
        $gte: queryObj.startDate as string,
        $lte: queryObj.endDate as string,
      };

      // Since we combined the two into startDate, remove the separate endDate condition
      delete queryObj.endDate;
    } else {
      // If either startDate or endDate is missing, remove both
      delete queryObj.startDate;
      delete queryObj.endDate;
    }

    if (this.query.starRating) {
      const starRatings = (this.query.starRating as string)
        .split(',')
        .map(Number);

      const ratingConditions = starRatings.map(rating => ({
        totalAverageRating: { $gte: rating, $lt: rating + 1 },
      }));

      this.modelQuery = this.modelQuery.find({
        ...queryObj,
        $and: [
          { totalAverageRating: { $ne: 0 } },
          { totalAverageRating: { $ne: null } },
          { $or: ratingConditions },
        ],
      } as FilterQuery<T>);
    } else {
      this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    }

    if (this.query.max || this.query.min) {
      queryObj.price = {};

      if (this.query.max) {
        (queryObj.price as any).$lte = Number(this.query.max);
      }

      if (this.query.min) {
        (queryObj.price as any).$gte = Number(this.query.min);
      }
    }

    if (this.query.menu) {
      queryObj.menuId = { $eq: this.query.menu as string };
    }
    if (this.query.sortBy === 'orders') {
      this.modelQuery = this.modelQuery.sort({
        'orders.length': 1,
      });
    }

    Object.keys(queryObj).forEach(key => {
      if (typeof queryObj[key] === 'string') {
        queryObj[key] = { $regex: queryObj[key], $options: 'i' };
      }
    });

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IDocument } from './document.interface';
import { Document } from './document.model';
import { QueryBuilder } from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { User } from '../user/user.model';

const createDocumentToDB = async (id: string, payload: Partial<IDocument>) => {
  const isExist = await Document.findOne({ userId: id });

  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User already has a document');
  }

  const isUser = await User.findById(id);

  const value = {
    ...payload,
    userId: id,
    role: isUser?.role,
  };

  const result = await Document.create(value);

  if (!result) {
    throw new Error('Document not created!');
  }

  return result;
};

const getAllDocuments = async (query: Record<string, unknown>, id: string) => {
  const blogQuery = new QueryBuilder(
    Document.find({ userId: id }).populate({
      path: 'userId',
      select: 'buyer agency',
      populate: {
        path: 'buyer agency',
        select: '-location',
      },
    }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();
  return { result, meta };
};
const getAllDocumentForAgency = async (query: Record<string, unknown>) => {
  const blogQuery = new QueryBuilder(
    Document.find({ role: USER_ROLES.AGENCY }).populate({
      path: 'userId',
      select: 'buyer agency',
      populate: {
        path: 'buyer agency',
      },
    }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();
  return { result, meta };
};

const getAllDocumentForBuyer = async (query: Record<string, unknown>) => {
  const blogQuery = new QueryBuilder(
    Document.find({ role: USER_ROLES.BUYER }).populate({
      path: 'userId',
      select: 'buyer agency',
      populate: {
        path: 'buyer agency',
      },
    }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();
  return { result, meta };
};

export const DocumentService = {
  createDocumentToDB,
  getAllDocuments,
  getAllDocumentForAgency,
  getAllDocumentForBuyer,
};

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DocumentService } from './document.service';
import { getFilePathMultiple } from '../../../shared/getFilePath';

const createDocumentToDB = catchAsync(async (req, res) => {
  const userId = req.user.id;

  console.log(userId);

  const value = {
    ...req.body,
  };

  let image = getFilePathMultiple(req.files, 'image', 'image');

  if (image && image.length > 0) {
    value.image = image;
  }

  const result = await DocumentService.createDocumentToDB(userId, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Document created successfully',
    data: result,
  });
});

const getAllDocument = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await DocumentService.getAllDocuments(req.query, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Document retrived successfully',
    data: result,
  });
});

const getAllDocumentForAgency = catchAsync(async (req, res) => {
  const result = await DocumentService.getAllDocumentForAgency(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Document retrived for agency successfully',
    data: result,
  });
});

const getAllDocumentBuyer = catchAsync(async (req, res) => {
  const result = await DocumentService.getAllDocumentForBuyer(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Document retrived for buyer successfully',
    data: result,
  });
});

export const DocumentController = {
  createDocumentToDB,
  getAllDocument,
  getAllDocumentForAgency,
  getAllDocumentBuyer,
};

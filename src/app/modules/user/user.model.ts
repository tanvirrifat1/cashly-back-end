import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';

const userSchema = new Schema<IUser, UserModal>(
  {
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    image: {
      type: String,
      default: '/images/user-1738582368043.png',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      select: 0,
      minlength: 8,
    },
    phone: {
      type: String,
      // unique: true,
    },
    subscription: {
      type: Boolean,
    },
    address: {
      type: String,
    },

    isSuspended: { type: Boolean, default: false },
    suspensionEndDate: { type: Date, default: null },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    loginStatus: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    agency: {
      type: Schema.Types.ObjectId,
      ref: 'Agency',
    },
    agencis: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'Buyer',
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};
userSchema.statics.isExistUserByPhone = async (phone: string) => {
  const isExist = await User.findOne({ phone });
  return isExist;
};

//account check
userSchema.statics.isAccountCreated = async (id: string) => {
  const isUserExist: any = await User.findById(id);
  return isUserExist.accountInformation.status;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {
  //check user

  if (this?.email) {
    const isExist = await User.findOne({ email: this.email });
    if (isExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
    }
  }

  if (this?.password) {
    //password hash
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);

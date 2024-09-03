import { model, Model, Schema } from 'mongoose';
import { IAuthDocument } from '@auth/interfaces/auth.interfaces';
import bcryptjs from 'bcryptjs';
const SALT_ROUND = 10;
const authSchema = new Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    createdAt: { type: Number, default: Date.now() },
    isVerify: { type: Boolean, default: false },
});

// Hashed password before we save a authSchema
authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
    const hashedPassword: string = await bcryptjs.hash(this.password as string, SALT_ROUND);
    this.password = hashedPassword;
    next();
});

// Add methods
authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    const hashedPassword: string = (this as unknown as IAuthDocument).password!;
    return bcryptjs.compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
    return bcryptjs.hash(password, SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');
export { AuthModel };

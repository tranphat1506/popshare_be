import { IAuthDocument } from '@auth/interfaces/auth.interfaces';
import { AuthModel } from '@root/features/auth/models/auth.schema';
import { IIdentityObject } from '@root/features/users/interfaces/user.interface';
import { Helpers } from '@root/helpers/helpers';
import { Types } from 'mongoose';

class AuthServices {
    public async getUserByIdentityObject({ username, email, ...identity }: IIdentityObject): Promise<IAuthDocument> {
        const query = {
            $or: [
                {
                    username: username ? Helpers.lowerCase(username) : null,
                },
                { email: email ? Helpers.lowerCase(email) : null },
            ],
        };
        const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
        return user;
    }
    public async addAuthUserToDB(data: IAuthDocument): Promise<void> {
        await AuthModel.create(data);
    }
    async singleUpdateAuthDataByAuthId(authId: string, field: keyof IAuthDocument, data: any) {
        await AuthModel.findByIdAndUpdate(new Types.ObjectId(authId), {
            [field]: data,
        });
    }
}

export const authService = new AuthServices();

import { IAuthDocument } from '@auth/interfaces/auth.interfaces';
import { AuthModel } from '@root/features/auth/models/auth.schema';
import { IIdentityObject } from '@root/features/users/interfaces/user.interface';
import { Helpers } from '@root/helpers/helpers';
import { Types } from 'mongoose';

class AuthServices {
    public async getUserByIdentityObject({ ...identities }: IIdentityObject): Promise<IAuthDocument | null> {
        const account = identities.account ? Helpers.lowerCase(identities.account) : undefined;
        const query = {
            $or: [
                { username: account ?? identities.username },
                { email: account ?? identities.email },
                { _id: identities.userId },
            ],
        };
        const user = (await AuthModel.findOne(query).exec()) as IAuthDocument | null;
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

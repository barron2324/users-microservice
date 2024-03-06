import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import RoleUser from './enum/roles-user.enum';
import StatusUser from './enum/status-user.enum';

@Schema({})
export class Users {
    @Prop({
        type: String,
        unique: true,
        required: true,
        default: () => uuidv4(),
    })
    userId?: string;

    @Prop({
        type: String,
        unique: true,
        required: true,
        index: true,
    })
    email: string;

    @Prop({
        type: String,
        unique: true,
        required: true,
        index: true,
    })
    username: string;

    @Prop({
        type: String,
        required: true,
        index: true,
    })
    password: string;

    @Prop({
        type: String,
        default: null,
    })
    refreshToken?: string

    @Prop({
        enum: RoleUser,
        required: true,
        default: RoleUser.MEMBER,
    })
    roles?: RoleUser;

    @Prop({
        enum: StatusUser,
        required: true,
        default: StatusUser.ACTIVE,
    })
    status?: StatusUser;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

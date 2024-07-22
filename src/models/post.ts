import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReply extends Document {
    user: Types.ObjectId;
    text: string;
}

export interface IComment extends Document {
    user: Types.ObjectId;
    text: string;
    replies: IReply[];
}

export interface IPost extends Document {
    title: string;
    content: string;
    user: Types.ObjectId;
    comments: Types.DocumentArray<IComment>;
    createdAt: Date;
    updatedAt: Date;
}

const ReplySchema: Schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
});

const CommentSchema: Schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    replies: [ReplySchema]
});

const PostSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    comments: [CommentSchema],
}, { timestamps: true });

const Post = mongoose.model<IPost>('Post', PostSchema);

export { CommentSchema, ReplySchema };
export default Post;

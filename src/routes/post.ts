import express from 'express';
import mongoose from 'mongoose';
import Post, { IPost, IComment, IReply, CommentSchema, ReplySchema } from '../models/post';
import auth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create Post
router.post('/', auth, async (req: AuthRequest, res) => {
    try {
        const { title, content } = req.body;
        if (!req.user || typeof req.user.userId !== 'string') {
            return res.status(401).send('Unauthorized');
        }
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const post = new Post({
            title,
            content,
            user: userId
        });
        await post.save();

        const populatedPost = await Post.findById(post._id).populate('user', 'name');

        res.status(201).send(populatedPost);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send(error.message);
        } else {
            res.status(400).send('An unknown error occurred');
        }
    }
});

// Get Posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'replies.user',
                    select: 'name'
                }
            });
        res.send(posts);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send(error.message);
        } else {
            res.status(400).send('An unknown error occurred');
        }
    }
});

// Add Comment to Post
router.post('/:postId/comment', auth, async (req: AuthRequest, res) => {
    try {
        const { text } = req.body;
        if (!req.user || typeof req.user.userId !== 'string') {
            return res.status(401).send('Unauthorized');
        }
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const comment = {
            user: userId,
            text,
            replies: []
        };
        post.comments.push(comment);
        await post.save();

        const updatedPost = await Post.findById(req.params.postId)
            .populate('user', 'name avatar')
            .populate({
                path: 'comments.user',
                select: 'name avatar'
            })
            .populate({
                path: 'comments.replies.user',
                select: 'name avatar'
            });

        res.status(201).send(updatedPost);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send(error.message);
        } else {
            res.status(400).send('An unknown error occurred');
        }
    }
});

// Add Reply to Comment
router.post('/:postId/comment/:commentId/reply', auth, async (req: AuthRequest, res) => {
    try {
        const { text } = req.body;
        if (!req.user || typeof req.user.userId !== 'string') {
            return res.status(401).send('Unauthorized');
        }
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        const reply = {
            user: userId,
            text
        } as IReply;
        comment.replies.push(reply);
        await post.save();

        // Populate the replies and user information
        const updatedPost = await Post.findById(req.params.postId)
            .populate('user', 'name avatar')
            .populate({
                path: 'comments.user',
                select: 'name avatar'
            })
            .populate({
                path: 'comments.replies.user',
                select: 'name avatar'
            });

        res.status(201).send(updatedPost);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send(error.message);
        } else {
            res.status(400).send('An unknown error occurred');
        }
    }
});

export default router;

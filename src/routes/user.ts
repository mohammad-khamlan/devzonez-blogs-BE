import express from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User, { IUser } from '../models/user';

const router = express.Router();

// Get User Profile
router.get('/profile', auth, async (req: AuthRequest, res) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            return res.status(401).send('Unauthorized');
        }
        const userId = req.user.userId;
        const user: IUser | null = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send(error.message);
        } else {
            res.status(400).send('An unknown error occurred');
        }
    }
});

export default router;

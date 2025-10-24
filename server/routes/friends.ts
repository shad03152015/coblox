import { Router, Request, Response } from 'express';
import { User } from '../db/models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/friends/playing - Get list of friends currently playing in worlds
router.get('/friends/playing', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get the user with their friends list populated
    const user = await User.findById(userId)
      .select('friends')
      .populate('friends', 'characterName currentWorld avatarAppearance');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Filter friends to only those currently in a world (currentWorld is not null)
    const friendsPlaying = user.friends.filter((friend: any) => friend.currentWorld !== null);

    return res.status(200).json({
      success: true,
      friends: friendsPlaying,
    });
  } catch (error) {
    console.error('❌ Error fetching friends playing:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { User } from '../db/models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/character - Create a character for authenticated user
router.post('/character', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { characterName } = req.body;

    // Validate characterName is provided
    if (!characterName) {
      return res.status(400).json({ error: 'Character name is required' });
    }

    // Trim whitespace
    const trimmedName = characterName.trim();

    // Validate length
    if (trimmedName.length < 3) {
      return res.status(400).json({ error: 'Character name must be at least 3 characters' });
    }

    if (trimmedName.length > 20) {
      return res.status(400).json({ error: 'Character name must be 20 characters or less' });
    }

    // Validate alphanumeric only
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmedName)) {
      return res.status(400).json({ error: 'Character name can only contain letters and numbers' });
    }

    // Check if character name already exists (case-insensitive)
    const existingCharacter = await User.findOne({
      characterName: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (existingCharacter) {
      return res.status(400).json({ error: 'Character name already taken' });
    }

    // Get authenticated user
    const userId = req.user!.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has a character name
    if (user.characterName) {
      return res.status(400).json({ error: 'You already have a character' });
    }

    // Update user with character name
    user.characterName = trimmedName;
    await user.save();

    return res.status(201).json({
      success: true,
      characterName: trimmedName,
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

export default router;

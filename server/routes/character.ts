import { Router, Request, Response } from 'express';
import { User } from '../db/models/User.js';

const router = Router();

// POST /api/character - Create a new character
router.post('/character', async (req: Request, res: Response) => {
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

    // TODO: Update to use authenticated user ID when auth is implemented
    // For now, create a new User document with just the characterName
    const newUser = new User({
      characterName: trimmedName,
    });

    await newUser.save();

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

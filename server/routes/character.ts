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

// PATCH /api/character/avatar - Save avatar appearance for authenticated user
router.patch('/character/avatar', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { avatarAppearance } = req.body;

    // Validate avatarAppearance is provided
    if (!avatarAppearance) {
      return res.status(400).json({ error: 'Avatar appearance is required' });
    }

    // Validate clothing (required)
    if (!avatarAppearance.shirt || !avatarAppearance.pants || !avatarAppearance.shoes) {
      return res.status(400).json({ error: 'Avatar appearance must include shirt, pants, and shoes' });
    }

    // Validate each clothing item has id and color
    const clothingItems = [avatarAppearance.shirt, avatarAppearance.pants, avatarAppearance.shoes];
    for (const item of clothingItems) {
      if (!item.id || !item.color) {
        return res.status(400).json({ error: 'Each clothing item must have an id and color' });
      }
    }

    // Validate colors for clothing
    const validColors = ['red', 'green', 'blue', 'pink', 'purple', 'cyan', 'black'];
    for (const item of clothingItems) {
      const normalizedColor = item.color.toLowerCase();
      if (!validColors.includes(normalizedColor)) {
        return res.status(400).json({ error: `Invalid color: ${item.color}. Must be one of: ${validColors.join(', ')}` });
      }
      // Normalize to lowercase
      item.color = normalizedColor;
    }

    // Valid clothing item IDs
    const validShirtIds = ['tshirt', 'plaid-shirt', 'hoodie', 'polo', 'jacket', 'striped-shirt', 'denim-shirt', 'button-up'];
    const validPantsIds = ['jeans', 'cargo-pants', 'chinos', 'joggers', 'shorts', 'dress-pants'];
    const validShoesIds = ['sneakers', 'boots', 'sandals', 'dress-shoes', 'high-tops', 'loafers'];

    if (!validShirtIds.includes(avatarAppearance.shirt.id)) {
      return res.status(400).json({ error: `Invalid shirt id: ${avatarAppearance.shirt.id}` });
    }
    if (!validPantsIds.includes(avatarAppearance.pants.id)) {
      return res.status(400).json({ error: `Invalid pants id: ${avatarAppearance.pants.id}` });
    }
    if (!validShoesIds.includes(avatarAppearance.shoes.id)) {
      return res.status(400).json({ error: `Invalid shoes id: ${avatarAppearance.shoes.id}` });
    }

    // Prepare avatar data
    const avatarData: any = {
      shirt: avatarAppearance.shirt,
      pants: avatarAppearance.pants,
      shoes: avatarAppearance.shoes,
    };

    // Validate body (optional)
    if (avatarAppearance.body) {
      const validBodyTypes = ['slim', 'athletic', 'average', 'muscular'];
      const validSkinTones = ['light', 'fair', 'medium', 'tan', 'brown', 'dark'];

      if (!avatarAppearance.body.type || !avatarAppearance.body.skinTone) {
        return res.status(400).json({ error: 'Body must have type and skinTone' });
      }

      if (!validBodyTypes.includes(avatarAppearance.body.type)) {
        return res.status(400).json({ error: `Invalid body type: ${avatarAppearance.body.type}` });
      }

      if (!validSkinTones.includes(avatarAppearance.body.skinTone)) {
        return res.status(400).json({ error: `Invalid skin tone: ${avatarAppearance.body.skinTone}` });
      }

      avatarData.body = avatarAppearance.body;
    }

    // Validate hair (optional)
    if (avatarAppearance.hair) {
      const validHairBaseStyles = ['short-messy', 'long-wavy', 'slicked-back', 'top-bun', 'spiky', 'ponytail'];
      const validHairElements = ['bangs', 'braids', 'clips', 'hairband', 'feathers'];

      if (!avatarAppearance.hair.baseStyle || !avatarAppearance.hair.color) {
        return res.status(400).json({ error: 'Hair must have baseStyle and color' });
      }

      if (!validHairBaseStyles.includes(avatarAppearance.hair.baseStyle)) {
        return res.status(400).json({ error: `Invalid hair base style: ${avatarAppearance.hair.baseStyle}` });
      }

      const normalizedHairColor = avatarAppearance.hair.color.toLowerCase();
      if (!validColors.includes(normalizedHairColor)) {
        return res.status(400).json({ error: `Invalid hair color: ${avatarAppearance.hair.color}` });
      }

      // Validate hair elements if provided
      if (avatarAppearance.hair.elements && Array.isArray(avatarAppearance.hair.elements)) {
        for (const element of avatarAppearance.hair.elements) {
          if (!validHairElements.includes(element)) {
            return res.status(400).json({ error: `Invalid hair element: ${element}` });
          }
        }
      } else {
        avatarAppearance.hair.elements = [];
      }

      avatarData.hair = {
        baseStyle: avatarAppearance.hair.baseStyle,
        elements: avatarAppearance.hair.elements,
        color: normalizedHairColor,
      };
    }

    // Validate accessories (optional)
    if (avatarAppearance.accessories) {
      const validHatIds = ['bunny-ears', 'top-hat', 'baseball-cap', 'beanie', 'crown', 'witch-hat'];
      const validGlassesIds = ['star-glasses', 'sunglasses', 'round-glasses', 'heart-glasses', 'nerd-glasses', 'cat-eye-glasses'];
      const validJewelryIds = ['heart-necklace', 'gold-chain', 'pearl-necklace', 'star-pendant', 'gem-necklace', 'bow-tie'];
      const validWingsIds = ['fairy-wings', 'angel-wings', 'dragon-wings', 'butterfly-wings', 'bat-wings', 'rainbow-wings'];
      const validAccessoryColors = ['red', 'green', 'blue', 'pink', 'purple', 'cyan', 'black', 'yellow', 'white'];

      const accessories: any = {};

      // Validate hat (optional)
      if (avatarAppearance.accessories.hat) {
        const hat = avatarAppearance.accessories.hat;
        if (!hat.id || !hat.color) {
          return res.status(400).json({ error: 'Hat must have id and color' });
        }
        if (!validHatIds.includes(hat.id)) {
          return res.status(400).json({ error: `Invalid hat id: ${hat.id}` });
        }
        const normalizedHatColor = hat.color.toLowerCase();
        if (!validAccessoryColors.includes(normalizedHatColor)) {
          return res.status(400).json({ error: `Invalid hat color: ${hat.color}` });
        }
        accessories.hat = { id: hat.id, color: normalizedHatColor };
      }

      // Validate glasses (optional)
      if (avatarAppearance.accessories.glasses) {
        const glasses = avatarAppearance.accessories.glasses;
        if (!glasses.id || !glasses.color) {
          return res.status(400).json({ error: 'Glasses must have id and color' });
        }
        if (!validGlassesIds.includes(glasses.id)) {
          return res.status(400).json({ error: `Invalid glasses id: ${glasses.id}` });
        }
        const normalizedGlassesColor = glasses.color.toLowerCase();
        if (!validAccessoryColors.includes(normalizedGlassesColor)) {
          return res.status(400).json({ error: `Invalid glasses color: ${glasses.color}` });
        }
        accessories.glasses = { id: glasses.id, color: normalizedGlassesColor };
      }

      // Validate jewelry (optional)
      if (avatarAppearance.accessories.jewelry) {
        const jewelry = avatarAppearance.accessories.jewelry;
        if (!jewelry.id || !jewelry.color) {
          return res.status(400).json({ error: 'Jewelry must have id and color' });
        }
        if (!validJewelryIds.includes(jewelry.id)) {
          return res.status(400).json({ error: `Invalid jewelry id: ${jewelry.id}` });
        }
        const normalizedJewelryColor = jewelry.color.toLowerCase();
        if (!validAccessoryColors.includes(normalizedJewelryColor)) {
          return res.status(400).json({ error: `Invalid jewelry color: ${jewelry.color}` });
        }
        accessories.jewelry = { id: jewelry.id, color: normalizedJewelryColor };
      }

      // Validate wings (optional)
      if (avatarAppearance.accessories.wings) {
        const wings = avatarAppearance.accessories.wings;
        if (!wings.id || !wings.color) {
          return res.status(400).json({ error: 'Wings must have id and color' });
        }
        if (!validWingsIds.includes(wings.id)) {
          return res.status(400).json({ error: `Invalid wings id: ${wings.id}` });
        }
        const normalizedWingsColor = wings.color.toLowerCase();
        if (!validAccessoryColors.includes(normalizedWingsColor)) {
          return res.status(400).json({ error: `Invalid wings color: ${wings.color}` });
        }
        accessories.wings = { id: wings.id, color: normalizedWingsColor };
      }

      // Only add accessories if at least one is present
      if (Object.keys(accessories).length > 0) {
        avatarData.accessories = accessories;
      }
    }

    // Get authenticated user
    const userId = req.user!.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's avatar appearance
    user.avatarAppearance = avatarData;
    await user.save();

    return res.status(200).json({
      success: true,
      avatarAppearance: user.avatarAppearance,
    });
  } catch (error) {
    console.error('Error saving avatar appearance:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

// GET /api/character/profile - Get user profile including avatar appearance
router.get('/character/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get authenticated user
    const userId = req.user!.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        characterName: user.characterName,
        avatarAppearance: user.avatarAppearance,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

// GET /api/character/profile-summary - Get basic user profile for header display
router.get('/character/profile-summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get authenticated user
    const userId = req.user!.userId;
    const user = await User.findById(userId).select('characterName avatarAppearance');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        characterName: user.characterName,
        avatarAppearance: user.avatarAppearance,
      },
    });
  } catch (error) {
    console.error('Error fetching profile summary:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again' });
  }
});

export default router;

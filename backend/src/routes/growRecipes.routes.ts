import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { GrowRecipe } from '../models/GrowRecipe';
import { GrowRecipeService } from '../services/growRecipeService';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/grow-recipes
 * Get all recipes (with optional filters)
 */
router.get('/', async (req, res) => {
  try {
    const {
      strainType,
      difficulty,
      isPublic,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const where: any = {};

    if (strainType) {
      where.strainType = strainType;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
      ];
    }

    const recipes = await GrowRecipe.findAll({
      where,
      order: [[sortBy as string, order as string]],
    });

    res.json(recipes);
  } catch (error: any) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes', message: error.message });
  }
});

/**
 * GET /api/grow-recipes/:id
 * Get single recipe by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const recipe = await GrowRecipe.findByPk(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error: any) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe', message: error.message });
  }
});

/**
 * POST /api/grow-recipes
 * Create new recipe
 */
router.post('/', async (req, res) => {
  try {
    const recipe = await GrowRecipe.create(req.body);

    // Validate recipe
    const validation = GrowRecipeService.validateRecipe(recipe);
    if (!validation.valid) {
      await recipe.destroy();
      return res.status(400).json({
        error: 'Invalid recipe',
        errors: validation.errors,
      });
    }

    res.status(201).json(recipe);
  } catch (error: any) {
    console.error('Create recipe error:', error);
    res.status(400).json({ error: 'Failed to create recipe', message: error.message });
  }
});

/**
 * PUT /api/grow-recipes/:id
 * Update recipe
 */
router.put('/:id', async (req, res) => {
  try {
    const recipe = await GrowRecipe.findByPk(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Increment version on update
    const updatedData = {
      ...req.body,
      version: recipe.version + 1,
    };

    await recipe.update(updatedData);

    // Validate updated recipe
    const validation = GrowRecipeService.validateRecipe(recipe);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid recipe after update',
        errors: validation.errors,
      });
    }

    res.json(recipe);
  } catch (error: any) {
    console.error('Update recipe error:', error);
    res.status(400).json({ error: 'Failed to update recipe', message: error.message });
  }
});

/**
 * DELETE /api/grow-recipes/:id
 * Delete recipe
 */
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await GrowRecipe.findByPk(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await recipe.destroy();
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error: any) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Failed to delete recipe', message: error.message });
  }
});

/**
 * POST /api/grow-recipes/:id/apply/:plantId
 * Apply recipe to a plant
 */
router.post('/:id/apply/:plantId', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const plantId = parseInt(req.params.plantId);
    const { startPhase, overrideExisting } = req.body;

    if (isNaN(recipeId) || isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid recipeId or plantId' });
    }

    const application = await GrowRecipeService.applyRecipeToPlant(
      recipeId,
      plantId,
      {
        startPhase,
        overrideExisting,
      }
    );

    res.json(application);
  } catch (error: any) {
    console.error('Apply recipe error:', error);
    res.status(500).json({ error: 'Failed to apply recipe', message: error.message });
  }
});

/**
 * GET /api/grow-recipes/recommend/:strainType
 * Get recommended recipe for strain type
 */
router.get('/recommend/:strainType', async (req, res) => {
  try {
    const strainType = req.params.strainType as
      | 'indica'
      | 'sativa'
      | 'hybrid'
      | 'auto'
      | 'cbd';
    const difficulty = (req.query.difficulty as any) || 'beginner';

    if (!['indica', 'sativa', 'hybrid', 'auto', 'cbd'].includes(strainType)) {
      return res.status(400).json({
        error: 'Invalid strainType. Must be: indica, sativa, hybrid, auto, or cbd',
      });
    }

    const recipe = await GrowRecipeService.getRecommendedRecipe(strainType, difficulty);

    if (!recipe) {
      return res.status(404).json({
        error: 'No recipe found',
        message: `No ${difficulty} recipe found for ${strainType}`,
      });
    }

    res.json(recipe);
  } catch (error: any) {
    console.error('Get recommendation error:', error);
    res.status(500).json({
      error: 'Failed to get recommendation',
      message: error.message,
    });
  }
});

/**
 * POST /api/grow-recipes/validate
 * Validate a recipe without saving
 */
router.post('/validate', async (req, res) => {
  try {
    // Create temporary recipe instance for validation
    const tempRecipe = GrowRecipe.build(req.body);
    const validation = GrowRecipeService.validateRecipe(tempRecipe);

    res.json(validation);
  } catch (error: any) {
    console.error('Validate recipe error:', error);
    res.status(400).json({ error: 'Validation failed', message: error.message });
  }
});

/**
 * GET /api/grow-recipes/:id/current-phase/:plantAge
 * Get current phase for a plant based on age and recipe
 */
router.get('/:id/current-phase/:plantAge', async (req, res) => {
  try {
    const recipe = await GrowRecipe.findByPk(req.params.id);
    const plantAge = parseInt(req.params.plantAge);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (isNaN(plantAge) || plantAge < 0) {
      return res.status(400).json({ error: 'Invalid plantAge. Must be a positive number.' });
    }

    const currentPhase = GrowRecipeService.getCurrentPhase(recipe, plantAge);

    if (!currentPhase) {
      return res.status(404).json({ error: 'No phase found for plant age' });
    }

    res.json(currentPhase);
  } catch (error: any) {
    console.error('Get current phase error:', error);
    res.status(500).json({
      error: 'Failed to get current phase',
      message: error.message,
    });
  }
});

/**
 * POST /api/grow-recipes/initialize-defaults
 * Create default system recipes
 */
router.post('/initialize-defaults', async (req, res) => {
  try {
    const recipes = await GrowRecipeService.createDefaultRecipes();

    res.json({
      message: 'Default recipes created successfully',
      count: recipes.length,
      recipes,
    });
  } catch (error: any) {
    console.error('Initialize defaults error:', error);
    res.status(500).json({
      error: 'Failed to create default recipes',
      message: error.message,
    });
  }
});

/**
 * GET /api/grow-recipes/stats/popular
 * Get most popular recipes by usage count
 */
router.get('/stats/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const recipes = await GrowRecipe.findAll({
      where: { isPublic: true },
      order: [
        ['usageCount', 'DESC'],
        ['rating', 'DESC'],
      ],
      limit: Math.min(limit, 50),
    });

    res.json(recipes);
  } catch (error: any) {
    console.error('Get popular recipes error:', error);
    res.status(500).json({
      error: 'Failed to get popular recipes',
      message: error.message,
    });
  }
});

/**
 * PUT /api/grow-recipes/:id/rate
 * Rate a recipe
 */
router.put('/:id/rate', async (req, res) => {
  try {
    const recipe = await GrowRecipe.findByPk(req.params.id);
    const { rating } = req.body;

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Simple rating update (in production, would track individual user ratings)
    const currentRating = recipe.rating || 0;
    const usageCount = recipe.usageCount || 1;

    // Calculate new average rating
    const newRating = (currentRating * usageCount + rating) / (usageCount + 1);

    await recipe.update({ rating: Math.round(newRating * 10) / 10 });

    res.json({
      message: 'Recipe rated successfully',
      newRating: recipe.rating,
    });
  } catch (error: any) {
    console.error('Rate recipe error:', error);
    res.status(500).json({ error: 'Failed to rate recipe', message: error.message });
  }
});

export default router;

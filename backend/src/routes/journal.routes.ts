import express from 'express';
import { Op } from 'sequelize';
import { Note } from '../models/Note';
import { CalendarEvent } from '../models/CalendarEvent';
import { Milestone } from '../models/Milestone';
import { Plant } from '../models/Plant';
import { Harvest } from '../models/Harvest';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

/**
 * Get timeline for a plant
 * Combines notes, events, milestones, and harvests into a chronological timeline
 */
router.get('/timeline/:plantId', async (req, res) => {
  try {
    const plantId = parseInt(req.params.plantId);
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter[Op.and] = [];
      if (startDate) {
        dateFilter[Op.and].push({ createdAt: { [Op.gte]: new Date(startDate as string) } });
      }
      if (endDate) {
        dateFilter[Op.and].push({ createdAt: { [Op.lte]: new Date(endDate as string) } });
      }
    }

    // Fetch all timeline items
    const [notes, events, milestones, harvests] = await Promise.all([
      Note.findAll({
        where: { plantId, ...dateFilter },
        attributes: ['id', 'title', 'content', 'category', 'createdAt', 'updatedAt'],
      }),
      CalendarEvent.findAll({
        where: { plantId, ...dateFilter },
        attributes: ['id', 'title', 'description', 'eventDate', 'eventType', 'completed', 'createdAt'],
      }),
      Milestone.findAll({
        where: { plantId, ...dateFilter },
        attributes: ['id', 'type', 'title', 'description', 'date', 'importance', 'images', 'createdAt'],
      }),
      Harvest.findAll({
        where: { plantId, ...dateFilter },
        attributes: ['id', 'harvestDate', 'wetWeight', 'dryWeight', 'quality', 'notes', 'createdAt'],
      }),
    ]);

    // Combine and normalize timeline items
    const timeline = [
      ...notes.map(note => ({
        id: `note-${note.id}`,
        type: 'note',
        title: note.title,
        content: note.content,
        category: note.category,
        date: note.createdAt,
        data: note,
      })),
      ...events.map(event => ({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        content: event.description,
        eventType: event.eventType,
        completed: event.completed,
        date: event.eventDate,
        data: event,
      })),
      ...milestones.map(milestone => ({
        id: `milestone-${milestone.id}`,
        type: 'milestone',
        title: milestone.title,
        content: milestone.description,
        milestoneType: milestone.type,
        importance: milestone.importance,
        images: milestone.images ? JSON.parse(milestone.images) : [],
        date: milestone.date,
        data: milestone,
      })),
      ...harvests.map(harvest => ({
        id: `harvest-${harvest.id}`,
        type: 'harvest',
        title: `Harvest - ${harvest.quality || 'Unknown'} Quality`,
        content: harvest.notes,
        wetWeight: harvest.wetWeight,
        dryWeight: harvest.dryWeight,
        quality: harvest.quality,
        date: harvest.harvestDate,
        data: harvest,
      })),
    ];

    // Sort by date (newest first)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

/**
 * Get journal summary for a plant
 */
router.get('/summary/:plantId', async (req, res) => {
  try {
    const plantId = parseInt(req.params.plantId);

    const [plant, notesCount, eventsCount, milestonesCount, harvestsCount] = await Promise.all([
      Plant.findByPk(plantId),
      Note.count({ where: { plantId } }),
      CalendarEvent.count({ where: { plantId } }),
      Milestone.count({ where: { plantId } }),
      Harvest.count({ where: { plantId } }),
    ]);

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const summary = {
      plant: {
        id: plant.id,
        name: plant.name,
        phase: plant.phase,
        plantedDate: plant.plantedDate,
      },
      stats: {
        notes: notesCount,
        events: eventsCount,
        milestones: milestonesCount,
        harvests: harvestsCount,
        total: notesCount + eventsCount + milestonesCount + harvestsCount,
      },
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching journal summary:', error);
    res.status(500).json({ error: 'Failed to fetch journal summary' });
  }
});

export default router;

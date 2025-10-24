import { Router, Request, Response } from 'express';
import { Notification } from '../db/models/Notification.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications - Get all notifications for authenticated user
router.get('/notifications', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get all notifications for this user, sorted by most recent first
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again' });
  }
});

// PATCH /api/notifications/:id/read - Mark a notification as read
router.patch('/notifications/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    // Find and update the notification (only if it belongs to this user)
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again' });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/notifications/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    // Find and delete the notification (only if it belongs to this user)
    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again' });
  }
});

export default router;

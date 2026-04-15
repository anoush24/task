import Task from "../models/Task.model.js";

// create task
/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fix login bug
 *               description:
 *                 type: string
 *                 example: The login button is unresponsive on mobile
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      owner: req.user._id,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Create task error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Failed to create task" });
  }
};

// get all tasks
/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get tasks (admin sees all, user sees own)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 */
export const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Admin sees all tasks; regular users see only their own
    if (req.user.role !== "admin") {
      filter.owner = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("owner", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// get single task
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 *       403:
 *         description: Not authorized to view this task
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("owner", "name email role");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Users can only view their own tasks; admins can view any
    if (req.user.role !== "admin" && task.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this task" });
    }

    res.status(200).json({ task });
  } catch (err) {
    console.error("Get task error:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

// update task
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Task not found
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    
    if (req.user.role !== "admin" && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const allowedUpdates = ["title", "description", "status", "priority", "dueDate"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error("Update task error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Failed to update task" });
  }
};

// delete task
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Task not found
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    
    if (req.user.role !== "admin" && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete task error:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// admin-all task statistics
/**
 * @swagger
 * /api/v1/tasks/admin/stats:
 *   get:
 *     summary: Admin-only task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics across all users
 *       403:
 *         description: Admin access only
 */
export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTasks = await Task.countDocuments();

    res.status(200).json({
      totalTasks,
      byStatus: stats,
      byPriority: priorityStats,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
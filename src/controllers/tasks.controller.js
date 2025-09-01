import { Task } from '../models/task.js';
import { Op } from 'sequelize';

async function getTasks(req, res) {
  let {
    page = 1,
    limit = 10,
    orderBy = 'id',
    orderDir = 'DESC',
    search = '',
    done = null,
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 5;

  const { userId } = req.user;

  const order =
    orderBy && orderDir ? [[orderBy, orderDir.toUpperCase()]] : [['id', 'ASC']]; // Orden por defecto

  const where = {
    userId,
  };

  if (search.trim()) {
    where.name = {
      [Op.iLike]: `%${search.trim()}%`,
    };
  }

  if (done) where.done = done === 'true';

  try {
    const tasks = await Task.findAndCountAll({
      attributes: ['id', 'name', 'done'],
      where,
      limit,
      offset: (page - 1) * limit,
      order,
    });

    return res.json({
      total: tasks.count,
      page,
      pages: Math.ceil(tasks.count / limit),
      data: tasks.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getTasks1(req, res, next) {
  const { userId } = req.user;
  try {
    const tasks = await Task.findAll({
      attributes: ['id', 'name', 'done'],
      order: [['name', 'ASC']],
      where: {
        userId,
      },
    });
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  const { userId } = req.user;
  const { name } = req.body;
  try {
    const task = await Task.create({
      name,
      userId,
    });
    return res.json(task);
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const task = await Task.findOne({
      attributes: ['name', 'done'],
      where: {
        id,
        userId,
      },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  const { id } = req.params;
  const { name } = req.body;
  const { userId } = req.user;
  try {
    const task = await Task.update(
      {
        name,
      },
      {
        where: {
          id,
          userId,
        },
      }
    );
    if (task[0] === 0)
      return res.status(404).json({ message: 'Task not found' });

    return res.json(task);
  } catch (error) {
    next(error);
  }
}

async function taskDone(req, res, next) {
  const { id } = req.params;
  const { userId } = req.user;
  const { done } = req.body;
  try {
    const task = await Task.update(
      {
        done,
      },
      {
        where: {
          id,
          userId,
        },
      }
    );
    if (task[0] === 0) res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const task = await Task.destroy({
      where: {
        id,
        userId,
      },
    });
    if (task === 0) res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
}

export default {
  getTasks,
  createTask,
  getTask,
  updateTask,
  taskDone,
  deleteTask,
};

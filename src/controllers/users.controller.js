import { User } from '../models/user.js';
import { Task } from '../models/task.js';
import { Status } from '../constants/index.js';
import { encriptar } from '../common/bcrypt.js';
import { Op } from 'sequelize';

async function getUsers1(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'password', 'status'],
      order: [['id', 'DESC']],
      where: {
        status: Status.ACTIVE,
      },
    });
    return res.json(users);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const passwordEncriptado = await encriptar(password);

    const user = await User.create({
      username,
      password: passwordEncriptado,
    });
    return res.json(user);
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['id', 'username', 'password', 'status'],
      where: { id },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    if (!username && !password) {
      return res
        .status(400)
        .json({ message: 'Username or password is required' });
    }

    const updateData = {};

    if (username) updateData.username = username;
    if (password && password.trim()) {
      updateData.password = await encriptar(password);
    }

    const [rowsUpdated] = await User.update(updateData, {
      where: { id },
    });

    if (rowsUpdated === 0) return res.status(404).json({ message: 'User not found or no changes' });

    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'username', 'status'],
    });

    return res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  const { id } = req.params;
  try {
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    return res.status(204).json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}

async function activateInactivate(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.status === status) return res.status(409).json({ message: 'Same status' });

    user.status = status;
    await user.save();
    return res.json(user);
  } catch (error) {
    next(error);
  }
}

async function getTasks(req, res, next) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['username'],
      include: [
        {
          model: Task,
          attributes: ['name', 'done'],
        },
      ],
      where: { id },
    });
    return res.json(user);
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  const { page = 1, limit = 10, orderBy, orderDir = 'DESC', search, status } = req.query;

  const order = orderBy ? [[orderBy, orderDir.toUpperCase()]] : [['id', 'ASC']];
  const where = {};

  if (search) {
    where.username = { [Op.iLike]: `%${search}%` };
  }

  if (status) {
    if (![Status.ACTIVE, Status.INACTIVE].includes(status)) {
      return res.status(400).json({ message: `Invalid status, must be ${Status.ACTIVE} or ${Status.INACTIVE}` });
    }
    where.status = status;
  }

  try {
    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'status'],
      where: Object.keys(where).length ? where : undefined,
      limit,
      offset: (page - 1) * limit,
      order,
    });

    return res.json({
      total: users.count,
      page: parseInt(page),
      pages: Math.ceil(users.count / limit),
      data: users.rows,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  activateInactivate,
  getTasks,
};

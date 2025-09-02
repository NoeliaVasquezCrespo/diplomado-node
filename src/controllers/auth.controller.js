import { comparar } from '../common/bcrypt.js';
import config from '../config/env.js';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: 'Username or password is required' });

    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(403).json({ message: 'User not found' });

    const isMatch = await comparar(password, user.password);

    if (!isMatch) return res.status(403).json({ message: 'User not found' });

    const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
      expiresIn: eval(config.JWT_EXPIRES_SECONDS),
    });

    return res.json({ token });
  } catch (error) {
    next(error);
  }
}
export default { login };
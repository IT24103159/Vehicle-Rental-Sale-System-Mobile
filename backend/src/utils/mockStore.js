const { randomUUID } = require('crypto');

const now = () => new Date();

const users = [
  {
    _id: 'admin-mock-1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1234567890',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    _id: 'user-mock-1',
    name: 'Test User',
    email: 'user@example.com',
    phone: '+1987654321',
    password: 'User123!',
    role: 'user',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return clone(safeUser);
};

const formatAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const findByEmail = async (email) => users.find((user) => user.email === email.toLowerCase()) || null;

const findById = async (id) => users.find((user) => user._id === id) || null;

const listUsers = async () => users.map((user) => sanitize(user));

const createUser = async ({ name, email, phone, password, role = 'user' }) => {
  const user = {
    _id: randomUUID(),
    name,
    email: email.toLowerCase(),
    phone,
    password,
    role: role === 'admin' ? 'admin' : 'user',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };

  users.push(user);
  return user;
};

const updateUser = async (id, updates) => {
  const user = await findById(id);
  if (!user) return null;

  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email.toLowerCase();
  if (updates.phone) user.phone = updates.phone;
  user.updatedAt = now();

  return user;
};

const deleteUser = async (id) => {
  const index = users.findIndex((user) => user._id === id);
  if (index === -1) return null;
  const [deletedUser] = users.splice(index, 1);
  return deletedUser;
};

const updateUserRole = async (id, role) => {
  const user = await findById(id);
  if (!user) return null;
  user.role = role;
  user.updatedAt = now();
  return user;
};

const toggleUserStatus = async (id) => {
  const user = await findById(id);
  if (!user) return null;
  user.isActive = !user.isActive;
  user.updatedAt = now();
  return user;
};

module.exports = {
  users,
  sanitize,
  formatAuthUser,
  findByEmail,
  findById,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
};
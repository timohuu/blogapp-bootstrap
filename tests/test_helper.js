const Blog = require('../models/blog')
const User = require('../models/user')

const initialUsers = [
  {
    username: 'testaaja',
    name: 'Teppo Testaaja',
    password: 'salainen'
  },
  {
    username: 'heppu',
    name: 'Heppu Heppoinen',
    password: 'eisalainen'
  }
]

const initialBlogs = [
  {
    title: 'Say Yes',
    author: 'Liz Stanley',
    url: 'https://sayyes.com/',
    likes: 0,
    comments: []
  },
  {
    title: 'Seth\'s Blog',
    author: 'Seth Godin',
    url: 'https://seths.blog/',
    likes: 0,
    comments: []
  },
  {
    title: 'Bright Bazaar',
    author: 'Will Taylor',
    url: 'https://www.brightbazaarblog.com/',
    likes: 0,
    comments: []
  },
  {
    title: 'Megan the Vegan Mom',
    author: 'Megan Vegan',
    url: 'https://www.megantheveganmom.com/',
    likes: 0,
    comments: []
  },
  {
    title: 'Rookie Moms',
    author: 'Rookie Moms',
    url: 'https://www.rookiemoms.com/',
    likes: 0,
    comments: []
  },
  {
    title: 'Tech Savvy Mama',
    author: 'Leticia',
    url: 'https://techsavvymama.com/',
    likes: 0,
    comments: []
  },
  {
    title: 'Joku title',
    author: 'Joku author',
    url: 'https://ihanurlivaan.fi',
    likes: 0,
    comments: ['todella hyvä', ' aivan ihana', ' huippu']
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon', date: new Date() })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialUsers,
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}
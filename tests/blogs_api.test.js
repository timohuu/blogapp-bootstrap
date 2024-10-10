const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
//const { xor } = require('lodash')

const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')

var token = ''

//const config = require('../utils/config')
// eslint-disable-next-line no-console
//console.log('config.MONGODB_URI = ', config.MONGODB_URI)
// eslint-disable-next-line no-console
//console.log('process.env.SECRET = ', process.env.SECRET)
//console.log('config.SECRET = ', config.SECRET)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('Right amount of json blogs returned', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(7)

})

test('Id field of json blogs returned is modified', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)

  response.body.map(blog => {
    expect(blog.id).toBeDefined()
    expect(blog._id).not.toBeDefined()
  })
})

describe('add blogs with token', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'testaaja', name: 'Teppo Testaaja', passwordHash })
    await user.save()

    // user login
    const result = await api
      .post('/api/login')
      .send({ username: 'testaaja', password: 'salainen' })
      .expect(200)

    // receive token
    token = result.body.token
  })

  test('A blog can be added ', async () => {
    const newBlog = {
      title: 'A Cup of Jo',
      author: 'Joanna Goddard',
      url: 'https://cupofjo.com/',
      likes: 0
    }

    //var result = await api
    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //const blogAdded = result.body

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    expect(blogsAtEnd).toEqual(expect.arrayContaining([expect.objectContaining(newBlog)]))
  })

  test('Add a blog without likes value', async () => {
    const newBlog = {
      title: 'A Cup of Jo',
      author: 'Joanna Goddard',
      url: 'https://cupofjo.com/'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const expectedNewBlog = {
      title: 'A Cup of Jo',
      author: 'Joanna Goddard',
      url: 'https://cupofjo.com/',
      likes: 0
    }

    expect(blogsAtEnd).toEqual(expect.arrayContaining([expect.objectContaining(expectedNewBlog)]))
  })

  test('Add without title and url fails with 400', async () => {
    const newBlog = {
      author: 'Joanna Goddard',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(400)
  })

  test('adding blog fails with proper statuscode and message if token is missing', async () => {
    const newBlog = {
      title: 'A Cup of Jo',
      author: 'Joanna Goddard',
      url: 'https://cupofjo.com/',
      likes: 0
    }

    // token missing
    var result = await api
      .post('/api/blogs')
      .send({ username: 'testaaja', password: 'salainen' })
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('token missing or invalid')

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(blogsAtEnd).not.toEqual(expect.arrayContaining([expect.objectContaining(newBlog)]))
  })

})

describe('deletion tests', () => {
  test('deletion of a blog', async () => {

    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'testaaja', name: 'Teppo Testaaja', passwordHash })
    await user.save()

    // user login
    var result = await api
      .post('/api/login')
      .send({ username: 'testaaja', password: 'salainen' })
      .expect(200)

    // received token
    token = result.body.token

    const newBlog = {
      title: 'To be deleted',
      author: 'Testaaja',
      url: 'huuhaa.fi',
      likes: 0
    }

    result = await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //const blogsAtStart = await helper.blogsInDb()
    const blogToDeleteID = result.body.id
    //const blogToDelete = await Blog.findById(blogToDeleteID)

    await api
      .delete(`/api/blogs/${blogToDeleteID}`)
      .set('Authorization', 'bearer ' + token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    expect(blogsAtEnd).not.toEqual(expect.arrayContaining([expect.objectContaining(newBlog)]))

  })

  test('deletion fails with proper statuscode and message if username have not created the blog entry', async () => {

    await User.deleteMany({})

    var passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'testaaja', name: 'Teppo Testaaja', passwordHash })
    await user.save()

    // user login
    var result = await api
      .post('/api/login')
      .send({ username: 'testaaja', password: 'salainen' })
      .expect(200)

    // received token
    token = result.body.token

    const newBlog = {
      title: 'To be deleted',
      author: 'Testaaja',
      url: 'huuhaa.fi',
      likes: 0
    }

    result = await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //const blogsAtStart = await helper.blogsInDb()
    const blogToDeleteID = result.body.id
    //const blogToDelete = await Blog.findById(blogToDeleteID)

    passwordHash = await bcrypt.hash('topSecret', 10)
    const userNotCreator = new User({ username: 'testaajaNotCreator', name: 'Harri Hakkeri', passwordHash })
    await userNotCreator.save()

    // user login
    result = await api
      .post('/api/login')
      .send({ username: 'testaajaNotCreator', password: 'topSecret' })
      .expect(200)

    // received token
    var tokenNotCreator = result.body.token

    result = await api
      .delete(`/api/blogs/${blogToDeleteID}`)
      .set('Authorization', 'bearer ' + tokenNotCreator)
      .expect(401)

    expect(result.body.error).toContain('user not authorized to delete this item')

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length + 1
    )

    expect(blogsAtEnd).toEqual(expect.arrayContaining([expect.objectContaining(newBlog)]))

  })

  test('deletion fails with proper statuscode and message if attempt without token', async () => {

    await User.deleteMany({})

    var passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'testaaja', name: 'Teppo Testaaja', passwordHash })
    await user.save()

    // user login
    var result = await api
      .post('/api/login')
      .send({ username: 'testaaja', password: 'salainen' })
      .expect(200)

    // received token
    token = result.body.token

    const newBlog = {
      title: 'To be deleted',
      author: 'Testaaja',
      url: 'huuhaa.fi',
      likes: 0
    }

    result = await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //const blogsAtStart = await helper.blogsInDb()
    const blogToDeleteID = result.body.id
    //const blogToDelete = await Blog.findById(blogToDeleteID)

    // token missing
    result = await api
      .delete(`/api/blogs/${blogToDeleteID}`)
      .send({ username: 'testaaja', password: 'salainen' })
      .expect(401)

    expect(result.body.error).toContain('token missing or invalid')

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length + 1
    )

    expect(blogsAtEnd).toEqual(expect.arrayContaining([expect.objectContaining(newBlog)]))

  })
})

test('Likes of a blog increased', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToBeModified = blogsAtStart[1]
  blogToBeModified.likes += 1

  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({ username: 'testaaja', name: 'Teppo Testaaja', passwordHash })
  var userData = await user.save()
  //console.log("test('Likes of a blog increased') userData = ", userData)

  var usersResult = await api
    .get('/api/users')
    .expect(200)

  //var allUsersData = usersResult.body
  userData = usersResult.body[0]
  //console.log("test('Likes of a blog increased') allUsersData = ", allUsersData)
  //console.log("test('Likes of a blog increased') userData = ", userData)

  blogToBeModified.user ={
    username: userData.username,
    name: userData.name,
    id: userData.id,
  }

  //var blogDataToBeInResult = {...blogToBeModified}
  //blogDataToBeInResult.user =  userData.id
  var blogDataToBeInResult = {
    title: blogToBeModified.title,
    author: blogToBeModified.author,
    url: blogToBeModified.url,
    likes: blogToBeModified.likes,
    id: blogToBeModified.id,
  }

  //console.log("test('Likes of a blog increased') blogDataToBeInResult = ", blogDataToBeInResult)

  // user login
  //var result = await api
  await api
    .post('/api/login')
    .send({ username: 'testaaja', password: 'salainen' })
    .expect(200)

  //console.log("test('Likes of a blog increased') user login result.body = ", result.body)

  // received token
  //token = result.body.token

  //console.log("test('Likes of a blog increased') blogToBeModified = ", blogToBeModified)
  //console.log("test('Likes of a blog increased') blogToBeModified.id = ", blogToBeModified.id)

  await api
    .put(`/api/blogs/${blogToBeModified.id}`)
    .send(blogToBeModified)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  //console.log("test('Likes of a blog increased') blogsAtEnd = ", blogsAtEnd)
  expect(blogsAtEnd).toEqual(expect.arrayContaining([expect.objectContaining({ ...blogDataToBeInResult } )]))
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jorma',
      name: 'Jorma Jormakka',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

describe('username/password validation', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })

    await user.save()
  })

  test('creation fails with proper statuscode and message if username empty', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: '',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password has to be minimun 3 chars length')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password has to be minimun 3 chars length')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password empty', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: '',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password has to be minimun 3 chars length')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password has to be minimun 3 chars length')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})
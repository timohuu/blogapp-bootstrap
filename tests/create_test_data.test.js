//npm test -- -t "test data create"

//const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

const { initialUsers, initialBlogs } = require('./test_helper')

describe('test data', () => {

  var authHeader1 = null
  var authHeader2 = null

  beforeEach(async () => {

    await User.deleteMany({})
    await Blog.deleteMany({})

    // create a test user and save the corresponding auth header
    const user1 = initialUsers[0]
    await api.post('/api/users').send(user1)
    const response = await api.post('/api/login').send(user1)
    //console.log("created user1: ", response.body.name)
    authHeader1 = `Bearer ${response.body.token}`

    // create a test user and save the corresponding auth header
    const user2 = initialUsers[1]
    await api.post('/api/users').send(user2)
    const response2 = await api.post('/api/login').send(user2)
    //console.log("created user2: ", response2.body.name)
    authHeader2 = `Bearer ${response2.body.token}`
  })

  test('test data create', async () => {

    //console.log("creating blog: ", initialBlogs[0].title)
    var response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader1)
      .send(initialBlogs[0])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("creating blog: ", initialBlogs[1].title)
    response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader1)
      .send(initialBlogs[1])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("creating blog: ", initialBlogs[2].title)
    response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader1)
      .send(initialBlogs[2])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("creating blog: ", initialBlogs[3].title)
    response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader2)
      .send(initialBlogs[3])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("creating blog: ", initialBlogs[4].title)
    response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader2)
      .send(initialBlogs[4])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("creating blog: ", initialBlogs[5].title)
    response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader2)
      .send(initialBlogs[5])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("creating blog: ", initialBlogs[6].title)
    response = await api
      .post('/api/blogs')
      .set('Authorization', authHeader1)
      .send(initialBlogs[6])
      .expect(201)
      .expect('Content-Type', /application\/json/)

    //console.log("adding comments for blog: ", initialBlogs[6].title)
    const blogID = response.body.id
    response = await api
      .post('/api/blogs/'+ blogID + '/comments')
      .send({ comment: initialBlogs[6].comments[0] })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    response = await api
      .post('/api/blogs/'+ blogID + '/comments')
      .send({ comment: initialBlogs[6].comments[1] })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    response = await api
      .post('/api/blogs/'+ blogID + '/comments')
      .send({ comment: initialBlogs[6].comments[2] })
      .expect(200)
      .expect('Content-Type', /application\/json/)

  })
})
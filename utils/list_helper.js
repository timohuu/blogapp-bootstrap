const lodash = require('lodash')

const dummy = (/*blogs*/) => {
  return 1
}

const totalLikes = (blogs) => {
  var total = 0

  blogs.map(function(blog) {
    total += blog.likes
  })

  return total
}

const favoriteBlog = (blogs) => {

  const maxLikesBlog = blogs.reduce(function(prev, current) {
    return (prev.likes > current.likes) ? prev : current
  })

  return maxLikesBlog

}

const writerMostBlogs = (blogs) => {

  var writerWithMostBlogs = ''
  var maxNumberOfBlogs = 0

  const whichBlogsPerWriter = lodash.reduce(blogs, function(result, value, key) {
    (result[value.author] || (result[value.author] = [])).push(key)
    return result
  }, {})

  lodash.forEach(whichBlogsPerWriter, function(value, writer) {
    if(value.length > maxNumberOfBlogs) {
      maxNumberOfBlogs = value.length
      writerWithMostBlogs = writer
    }
  })

  const result = {
    author: writerWithMostBlogs,
    blogs: maxNumberOfBlogs
  }

  return result

}

const mostLikes = (blogs) => {

  var writerWithMostLikes = ''
  var maxNumberOfLikes = 0

  const likesPerWriter = lodash.reduce(blogs, function(result, value/*, key*/) {
    (result[value.author] || (result[value.author] = [])).push(value.likes)
    return result
  }, {})

  lodash.forEach(likesPerWriter, function(value, writer) {
    const sum = value.reduce((prev, curr) => prev + curr, 0)

    if(sum > maxNumberOfLikes) {
      maxNumberOfLikes = sum
      writerWithMostLikes = writer
    }
  })

  const result = {
    author: writerWithMostLikes,
    likes: maxNumberOfLikes
  }

  return result

}

module.exports = {
  dummy, totalLikes, favoriteBlog, writerMostBlogs, mostLikes
}
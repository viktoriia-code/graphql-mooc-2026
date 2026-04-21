const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        return Book.find({ author: args.author })
      }
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }
      return Book.find({}).populate('author')
    },
    allAuthors: async (root, args) => { return Author.find({})},
    me: (root, args, context) => { return context.currentUser },
  },
  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({ author: root._id })
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
 
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          }
        })
      }

      const titleExists = await Book.exists({ title: args.title })

      if (titleExists) {
        throw new GraphQLError('Title must be unique', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
          }
        })
      }

      let author = await Author.findOne({ name: args.author });
      let newAuthor;
      if (!author) {
        newAuthor = new Author({
          name: args.author,
        });

        try {
          await newAuthor.save();
        } catch (authorError) {
          throw new GraphQLError(`Author validation failed: ${authorError.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error: authorError
            },
          });
        }
      } else {
        newAuthor = author;
      }

      const book = new Book({ ...args, author: newAuthor._id })

      try {
        await book.save()
      } catch (bookError) {
        throw new GraphQLError(`Book validation failed: ${bookError.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error: bookError
          }
        })
      }

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          }
        })
      }
      
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null
      }
      author.born = args.setBornTo

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(`Editing author failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
 
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(error => {
          throw new GraphQLError(`Creating the user failed: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  }
}

module.exports = resolvers
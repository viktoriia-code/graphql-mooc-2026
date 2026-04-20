const { GraphQLError } = require('graphql')
const Book = require('./models/book')
const Author = require('./models/author')
const author = require('./models/author')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        return Book.find({ author: args.author })
      }
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } })
      }
      return Book.find({}).populate('author')
    },
    allAuthors: async (root, args) => { return Author.find({})},
  },
  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({ author: root._id })
    }
  },
  Mutation: {
    addBook: async (root, args) => {
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
    editAuthor: async (root, args) => {
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
    }
  }
}

module.exports = resolvers
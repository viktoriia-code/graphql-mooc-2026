import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS, ALL_GENRES } from '../queries'
import Notify from './Notify'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    update: (cache, response) => {
      const newBook = response.data.addBook;
      // update all books cache without genre filter
      cache.updateQuery({ query: ALL_BOOKS, variables: { genre: null } }, ({ allBooks }) => {
        console.log("Updating cache for ALL_BOOKS without genre filter");
        return { allBooks: [...allBooks, newBook]}
      })

      // also update genre-based books caches
      newBook.genres.forEach(genre => {
        console.log("Updating cache for ALL_BOOKS with genre: " + genre);
        cache.updateQuery({ query: ALL_BOOKS, variables: { genre } }, (data) => {
          if (!data) return { allBooks: [newBook] }
          return { allBooks: [...data.allBooks, newBook] }
        })
      })

      // update genres cache
      cache.updateQuery({ query: ALL_GENRES }, (data) => {
        if (!data) return
        const newGenres = newBook.genres.filter(g => !data.allGenres.includes(g))
        if (newGenres.length === 0) return data
        return { allGenres: [...data.allGenres, ...newGenres] }
      })
    },
    onError: (error) => {
			setErrorMessage(error.message)
		}
  })
  
  if (!props.show) {
    return null
  }
  
  const submit = async (event) => {
    event.preventDefault()

    console.log('add book...')

    addBook({ variables: { title, author, published: parseInt(published), genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
      <Notify errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
    </div>
  )
}

export default NewBook

import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  
  const result = useQuery(ALL_BOOKS, { variables: { genre: selectedGenre } });
  const genreResult = useQuery(ALL_GENRES);

  if (!props.show) return null

  if (result.loading) return <div>loading...</div>

  const books = result.data.allBooks;
  const genres = genreResult.data.allGenres;

  return (
    <div>
      <h2>books</h2>
      {selectedGenre ? <p>in genre <b>{selectedGenre}</b></p> : <p>all genres</p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre, index) => (
        <button key={index} onClick={() => setSelectedGenre(genre)}>{genre}</button>
      ))}
      <button onClick={() => setSelectedGenre(null)}>Show All</button>
    </div>
  )
}

export default Books

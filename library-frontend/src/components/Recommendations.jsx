import { useQuery } from '@apollo/client/react'
import { ME, ALL_BOOKS } from '../queries'

const Recommendations = ({ show }) => {
  const resultUser = useQuery(ME)

  const favoriteGenre = resultUser.data?.me?.favoriteGenre

  const resultBooks = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre
  })

  if (!show) return null

  if (resultUser.loading || resultBooks.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre <b>{favoriteGenre}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {resultBooks.data?.allBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
import { ALL_BOOKS, ALL_GENRES } from "../queries";

export const addBookToCache = (cache, newBook) => {
  // update all books cache without genre filter
  cache.updateQuery({ query: ALL_BOOKS, variables: { genre: null } }, ({ allBooks }) => {
    const bookExists = allBooks.some(b => b.id === newBook.id);
    if (bookExists) {
      return { allBooks };
    }
    console.log("Updating cache for ALL_BOOKS without genre filter");
    return { allBooks: [...allBooks, newBook]}
  })

  // also update genre-based books caches
  newBook.genres.forEach(genre => {
    console.log("Updating cache for ALL_BOOKS with genre: " + genre);
    cache.updateQuery({ query: ALL_BOOKS, variables: { genre } }, (data) => {
      if (!data) return { allBooks: [newBook] }
      const bookExists = data.allBooks.some(b => b.id === newBook.id);
      if (bookExists) {
        return data;
      }
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
}
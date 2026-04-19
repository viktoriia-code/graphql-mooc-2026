import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import Notify from './Notify'

const EditAuthor = ({ authors }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
			setErrorMessage(error.message)
		},
    refetchQueries: [ { query: ALL_AUTHORS } ],
		onCompleted: (data) => {
      if (!data.editAuthor) {
        setErrorMessage('Author not found')
      }
    }
  })

	const options = authors.map(author => ({ value: author.name, label: author.name }))

  const submit = async (event) => {
    event.preventDefault()

    console.log('edit author...')

    editAuthor({ variables: { name, setBornTo: parseInt(born) } })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h3>Set birth year</h3>
        <form onSubmit={submit}>
					<select value={name} onChange={(e) => setName(e.target.value)}>
						<option value="" disabled>
							Select author
						</option>
						{options.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

          <div>
            born
            <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type="submit">update author</button>
        </form>
        <Notify 
					errorMessage={errorMessage} 
					setErrorMessage={setErrorMessage} 
				/>
    </div>
  )
}

export default EditAuthor
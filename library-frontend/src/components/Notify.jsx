import { useEffect } from "react"

const Notify = ({ errorMessage, setErrorMessage }) => {
  useEffect(() => {
    if (!errorMessage) return

    const timer = setTimeout(() => {
      setErrorMessage(null)
    }, 5000)

    return () => clearTimeout(timer)
  }, [errorMessage])

  if (!errorMessage) {
    return null
  }
  return (
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  )
}

export default Notify
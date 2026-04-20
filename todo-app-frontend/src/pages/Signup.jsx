import { useState } from 'react'
import { signupUser } from '../services/api'

export default function Signup() {
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!userName.trim()) {
      setError('Username is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await signupUser(userName)
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      setError('Signup failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='signup-page'>
      <h1>Complete your signup</h1>
      <form onSubmit={handleSubmit} className='google-signup-form'>
        <div className='signup-input-group'>
          <label htmlFor="userName">Username:</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isSubmitting} className='google-signup-btn'>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
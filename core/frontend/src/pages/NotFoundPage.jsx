import React from 'react'
import {Link} from 'react-router-dom'

const NotFoundPage = () => {
    return (
        <div>
            This Page doesnt exist. Go to <Link to="/">home</Link>
        </div>
    )
}

export {NotFoundPage};
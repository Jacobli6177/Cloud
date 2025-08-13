import Image from 'next/image'
import React, { useState } from 'react'
import { Input } from './ui/input'

const Search = () => {
  const [query, setQuery] = useState('')

  return (
    <div className='search'>
      <div className='search-input-wrapper'>
        <Image 
          src="/assets/icons/search.svg"
          alt='search'
          width={24}
          height={24}
        /> 
        <Input />
      </div>
    </div>
  )
}

export default Search

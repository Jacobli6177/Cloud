"use client";

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { useSearchParams } from 'next/navigation';

const Search = () => {
  const [query, setQuery] = useState('')
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  useEffect(() => {
    if (!searchQuery) {
      setQuery("")
    }
  }, [searchQuery])

  return (
    <div className='search'>
      <div className='search-input-wrapper'>
        <Image 
          src="/assets/icons/search.svg"
          alt='search'
          width={24}
          height={24}
        /> 
        <Input value={query} placeholder='Search...' 
        className='search-input' 
        onChange={(e) => setQuery(e.target.value)}/>
      </div>
    </div>
  )
}

export default Search

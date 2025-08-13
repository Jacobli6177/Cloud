"use client";

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { useSearchParams } from 'next/navigation';

const Search = () => {
  const [query, setQuery] = useState('')
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return router.push(path.replace(searchParams.toString(), ""));
      }

      const files = await getFiles({ types: [], searchText: debouncedQuery });
      setResults(files.documents);
      setOpen(true);
    };

    fetchFiles();
  }, [debouncedQuery]);
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

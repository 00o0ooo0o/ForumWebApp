import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import axios from 'axios';
import '../css/SearchBar.css';

const SearchBar = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (input.trim().length < 2) {
      setResults([]); 
      return;
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(input)}&limit=10&offset=0`);
        setResults(res.data.results || []);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timeoutRef.current);
  }, [input]);

  return (
    <div className="search-container">
      <div className="input-wrapper">
        <input
          type="text"
          placeholder="Search for posts"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 100)}
        />

        <Link to={`/`} className="search-btn"><FaSearch size={18} /></Link>

      </div>

      {isActive && results.length > 0 && (
        <div className="results-list">
          {results.map((result) => (                      
            <Link key={result.id} to={`/posts/${result.id}`} className="result-item">
            {result.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export { SearchBar };

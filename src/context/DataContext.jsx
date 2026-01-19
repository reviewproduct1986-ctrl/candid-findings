// src/contexts/DataContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [bestOfBlogs, setBestOfBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/blogs.json').then(res => res.json()),
      fetch('/data/best-of-blogs.json').then(res => res.json())
    ])
      .then(([productsData, blogsData, bestOfBlogsData]) => {
        setProducts(productsData.products || []);
        setBlogs(blogsData.posts || []);
        setBestOfBlogs(bestOfBlogsData.posts || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <DataContext.Provider value={{ products, blogs, bestOfBlogs, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
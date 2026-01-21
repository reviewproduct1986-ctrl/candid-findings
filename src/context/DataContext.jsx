import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [bestOfBlogs, setBestOfBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogCache, setBlogCache] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/data/products.json').then(res => res.json()),
      fetch('/data/best-of-blogs.json').then(res => res.json())
    ])
      .then(([productsData, bestOfBlogsData]) => {
        setProducts(productsData.products || []);
        setBestOfBlogs(bestOfBlogsData.posts || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  const getBlog = async (slug) => {
    // Check cache first
    if (blogCache[slug]) {
      return blogCache[slug];
    }

    try {
      const response = await fetch(`/data/blogs/blog.${slug}.json`);
      
      if (!response.ok) {
        throw new Error(`Blog not found: ${slug}`);
      }
      
      const blogData = await response.json();
      
      // Cache the result
      setBlogCache(prev => ({ ...prev, [slug]: blogData }));
      
      return blogData;
    } catch (error) {
      console.error(`Error loading blog ${slug}:`, error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{ products, getBlog, bestOfBlogs, loading }}>
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

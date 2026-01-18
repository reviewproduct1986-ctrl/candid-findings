import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../utils/markdownComponents';
import InfoCards from '../components/review/InfoCards';
import CallToAction from '../components/CallToAction';

export default function ProductSection({ product, index }) {
  if (!product.productData) {
    return (
      <div className="text-center py-8 text-slate-500">
        Product data not found for ASIN: {product.asin}
      </div>
    );
  }

  const productData = product.productData;

  return (
    <div className={index > 0 ? "border-t border-slate-200 pt-12" : ""}>
      {/* Product Number Badge */}
      <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold rounded-full mb-4">
        {index + 1}
      </div>

      {/* Product Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
        {productData.title}
      </h2>

      {/* Price Card */}
      <div className="mb-6">
        <InfoCards product={productData} />
      </div>

      {/* Product Image - Matching Review Page Style */}
      <div className="mb-8">
        <img 
          src={productData.image} 
          alt={productData.title}
          className="w-full h-96 object-cover rounded-2xl shadow-lg"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>

      <div className='flex justify-center my-6'>
        <CallToAction product={productData} page='BestOfCategory' />
      </div>

      {/* Product Content */}
      {product.content && (
        <div className="prose prose-lg prose-slate max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {product.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function App() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault(); // 防止表單提交刷新頁面

    if (!query.trim()) return; // 如果查詢為空，直接返回

    setLoading(true);
    setError('');
    setResults([]);

    try {
      // 發送請求到 n8n Webhook（這裡需要填寫實際的 URL）
      const response = await axios.post(`${BASE_URL}`, { query });

      // 假設返回的資料格式是包含 products 的陣列
      const products = response.data[0].products;

      if (products && products.length === 0) {
        setResults([{ message: '沒有找到任何結果。' }]);
      } else {
        setResults(products);
      }
    } catch (err) {
      console.error('發生錯誤:', err);
      setError('搜尋時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#e9ecef', minHeight: '100vh' }}>
      <div className="container">
        <h2 className="fw-bold">搜尋商品</h2>
        <form onSubmit={handleSearch}>
          <div className="mb-3">
            <label htmlFor="searchQuery" className="form-label fs-4">請輸入商品名稱</label>
            <input
              type="text"
              className="form-control py-3"
              id="searchQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary fw-bold py-2">搜尋</button>
        </form>

        {loading && <div className="loading-message">搜尋中...</div>}

        {error && <div className="error-message">{error}</div>}

        {results.length > 0 && (
          <>
            <h3 className="mt-4">搜尋結果：</h3>
            <div id="results" className="mt-4">
              {results.map((product, index) => (
                <div className="card" key={index}>
                  <div className="card-body">
                    {product.message ? (
                      <p>{product.message}</p>
                    ) : (
                      <>
                        <h5 className="card-title">{product.productName}</h5>
                        <p className="card-text">價格: {product.salePrice}</p>
                        <a href="#" className="btn btn-warning">查看詳情</a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
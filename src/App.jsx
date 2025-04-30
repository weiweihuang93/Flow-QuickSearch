import React, { useState } from 'react';
import axios from 'axios';

const SEARCH_URL = import.meta.env.VITE_SEARCH_URL;
const TRACKADD_URL = import.meta.env.VITE_TRACKADD_URL;
const TRACKGET_URL = import.meta.env.VITE_TRACKGET_URL;
const TRACKREMOVE_URL = import.meta.env.VITE_TRACKREMOVE_URL;

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackedItems, setTrackedItems] = useState([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [loadingType, setLoadingType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = e.nativeEvent.submitter.value;
  
    if (action === "search") {
      handleSearch(); // 搜尋功能
    } else if (action === "track") {
      handleTrack(query, targetPrice); // 追蹤功能，帶上目標價格
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setLoadingType('search');
    setError('');
    setResults([]);

    try {
      const response = await axios.post(`${SEARCH_URL}`, { query });
      const products = response.data[0].products;

      if (!products || products.length === 0) {
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

  const handleSearchItem = async (productName) => {
    setLoading(true);
    setLoadingType('');
    setError('');
    setResults([]);

    try {
      const response = await axios.post(`${SEARCH_URL}`, { query: productName });
      const products = response.data[0].products;

      if (!products || products.length === 0) {
        setResults([{ message: '沒有找到任何結果。' }]);
      } else {
        setResults(products);
      }
    } catch (err) {
      console.error('發生錯誤:', err);
      setError('搜尋時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
      setLoadingType('');
    }
  };

  const handleTrack = async (productName, targetPrice) => {
    const id = Date.now(); // 用時間戳記當作唯一 ID
    const timestamp = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  
    try {
      const response = await axios.post(`${TRACKADD_URL}`, {
        id,
        productName,
        targetPrice,
        timestamp,
      });
  
      if (response.status === 200) {
        setTrackedItems((prevItems) => [
          ...prevItems,
          {
            id,
            商品名稱: productName,
            目標價格: targetPrice,
            建立時間: timestamp,
          },
        ]);
        alert('商品已加入追蹤');
      }
    } catch (err) {
      console.error('加入追蹤失敗', err);
      alert('加入追蹤失敗，請稍後再試');
    }
  };

  const handleViewTrackedItems = async () => {
    setLoading(true);
    setLoadingType('trackList');
    try {
      const response = await axios.get(`${TRACKGET_URL}`);
      if (response.data && Array.isArray(response.data)) {
        setTrackedItems(response.data);
      } else {
        alert('追蹤清單格式錯誤');
      }
    } catch (err) {
      console.error('讀取追蹤清單失敗', err);
      alert('讀取失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrackedItem = async (id) => {
    try {
      const response = await axios.post(`${TRACKREMOVE_URL}`, { id });
      if (response.status === 200) {
        const newTrackedItems = await axios.get(`${TRACKGET_URL}`);
        setTrackedItems(newTrackedItems.data);
        alert('已移除追蹤項目');
      }
    } catch (err) {
      console.error('刪除失敗', err);
      alert('無法移除，請稍後再試');
    }
  };

  return (
    <div className="app-wrapper">
      <div className="container">
        <div className="search-card">
          <h2 className="text-center fw-bold mb-4">搜尋商品</h2>

          <form onSubmit={handleSubmit}>
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

            <div className="mb-3">
              <label htmlFor="targetPrice" className="form-label fs-4">請輸入目標價格（加入追蹤）</label>
              <input
                type="number"
                className="form-control py-3"
                id="targetPrice"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>

            <div className="d-lg-flex gap-3">
              <button
                type="submit"
                name="action"
                value="search"
                className="btn btn-primary fw-bold w-100 py-3 mb-3 mb-lg-0"
              >
                搜尋
              </button>

              <button
                type="submit"
                name="action"
                value="track"
                className="btn btn-success fw-bold w-100 py-3 mb-3 mb-lg-0"
              >
                加入追蹤
              </button>

              <button
                type="button"
                className="btn btn-warning fw-bold w-100 py-3"
                onClick={handleViewTrackedItems}
              >
                查看追蹤清單
              </button>
            </div>
          </form>

          {loading && (
            <div className="loading-message">
              {loadingType === 'search' && '搜尋中...'}
              {loadingType === 'trackList' && '載入追蹤清單中...'}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}

          {trackedItems.length > 0 && (
            <div className="mt-4">
              <h3>已追蹤清單</h3>
              <ul className="list-group">
                {trackedItems.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {item['商品名稱']}<br />
                      目標價格：${item['目標價格']}<br />
                      {item['建立時間']}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSearchItem(item['商品名稱'])}
                      >
                        搜尋
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveTrackedItem(item.id)}
                      >
                        移除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <>
              <h3 className="mt-4">搜尋結果：</h3>
              <div id="results" className="mt-4">
                {results.map((product, index) => (
                  <div className="card mb-3" key={index}>
                    <div className="card-body">
                      {product.message ? (
                        <p>{product.message}</p>
                      ) : (
                        <>
                          <h5 className="card-title">{product.productName}</h5>
                          <p className="card-text">價格: {product.salePrice}</p>
                          <a href={product.link} className="btn btn-warning">
                            查看詳情
                          </a>
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
    </div>
  );
}

export default App;
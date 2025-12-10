import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

const PRODUCTS_KEY = 'zxs-products'

const defaultProducts = [
  {
    id: '1',
    name: '三菱 Fuso Canter 3.5噸貨車',
    description: '適合市區配送，經濟實惠的輕型貨車。配備高效能柴油引擎，載重能力強，維護成本低。',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    category: '輕型貨車',
    specifications: {
      '載重量': '3.5噸',
      '引擎': '4.9L 柴油',
      '馬力': '175HP',
      '變速箱': '6速手動',
      '車廂長度': '4.2米'
    },
    inStock: true,
    stock: 5
  },
  {
    id: '2',
    name: '五十鈴 Isuzu NQR 5.5噸貨車',
    description: '中型貨運首選，可靠性高，適合中長途運輸。寬敞駕駛室，舒適性佳。',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: '中型貨車',
    specifications: {
      '載重量': '5.5噸',
      '引擎': '5.2L 柴油',
      '馬力': '190HP',
      '變速箱': '6速手動/自動',
      '車廂長度': '5.5米'
    },
    inStock: true,
    stock: 3
  },
  {
    id: '3',
    name: '日野 Hino 300系列 7.5噸貨車',
    description: '重型運輸專用，動力強勁，適合大型貨物運輸。配備先進安全系統。',
    price: 680000,
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800',
    category: '重型貨車',
    specifications: {
      '載重量': '7.5噸',
      '引擎': '7.7L 柴油',
      '馬力': '260HP',
      '變速箱': '6速手動',
      '車廂長度': '6.8米'
    },
    inStock: true,
    stock: 2
  },
  {
    id: '4',
    name: '富豪 Volvo FM 12噸貨車',
    description: '歐洲進口，高端配置，適合長途運輸。舒適駕駛室，節能環保。',
    price: 1200000,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    category: '重型貨車',
    specifications: {
      '載重量': '12噸',
      '引擎': '10.8L 柴油',
      '馬力': '420HP',
      '變速箱': '12速自動',
      '車廂長度': '9.6米'
    },
    inStock: true,
    stock: 1
  },
  {
    id: '5',
    name: '平治 Mercedes-Benz Atego 8噸貨車',
    description: '德國工藝，品質保證。適合各種運輸需求，維護方便。',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800',
    category: '重型貨車',
    specifications: {
      '載重量': '8噸',
      '引擎': '7.2L 柴油',
      '馬力': '320HP',
      '變速箱': '8速自動',
      '車廂長度': '7.5米'
    },
    inStock: true,
    stock: 2
  },
  {
    id: '6',
    name: '豐田 Toyota Dyna 4.5噸貨車',
    description: '日系品質，耐用可靠。適合日常配送，燃油效率高。',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: '中型貨車',
    specifications: {
      '載重量': '4.5噸',
      '引擎': '4.0L 柴油',
      '馬力': '150HP',
      '變速箱': '5速手動',
      '車廂長度': '4.8米'
    },
    inStock: true,
    stock: 4
  }
]

const loadProducts = () => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
    // Initialize with default products
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts))
    return defaultProducts
  } catch (err) {
    console.error('Unable to load products', err)
    return defaultProducts
  }
}

function ProductsPage() {
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = loadProducts()
    setProducts(data)
    setLoading(false)
  }, [])

  const categories = ['全部', ...new Set(products.map(p => p.category))]
  const filteredProducts = selectedCategory === '全部' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            產品目錄
          </p>
          <h1 className="text-3xl font-semibold text-white">卡車產品</h1>
          <p className="text-sm text-slate-200/80">
            選擇適合您業務需求的貨車
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-lg'
                : 'bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-200/70">載入產品中...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-sm text-slate-200/70">此分類暫無產品</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, formatPrice }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-xl shadow-black/30 backdrop-blur transition hover:border-sky-400/50 hover:bg-white/10"
    >
      <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-white/10">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x600?text=Truck'
          }}
        />
      </div>
      <div className="mb-2">
        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
          {product.category}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-sky-200">
        {product.name}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-200/80">
        {product.description}
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-emerald-400">{formatPrice(product.price)}</p>
          <p className="text-xs text-slate-400">
            {product.inStock ? `庫存: ${product.stock} 輛` : '缺貨'}
          </p>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow transition group-hover:from-emerald-400 group-hover:to-sky-400">
          查看詳情
        </div>
      </div>
    </Link>
  )
}

export default ProductsPage


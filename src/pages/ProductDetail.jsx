import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

const PRODUCTS_KEY = 'zxs-products'

const loadProducts = () => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
    return []
  } catch (err) {
    console.error('Unable to load products', err)
    return []
  }
}

const paymentMethods = [
  { id: 'credit', name: '信用卡', icon: '💳' },
  { id: 'bank', name: '銀行轉帳', icon: '🏦' },
  { id: 'cash', name: '現金', icon: '💵' },
  { id: 'installment', name: '分期付款', icon: '📅' }
]

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState('credit')
  const [quantity, setQuantity] = useState(1)
  const [alert, setAlert] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    const products = loadProducts()
    const found = products.find(p => p.id === id)
    setProduct(found)
    setLoading(false)
  }, [id])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      setAlert({ kind: 'error', message: '請先登入以進行購買' })
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    if (!product.inStock || quantity > product.stock) {
      setAlert({ kind: 'error', message: '庫存不足' })
      return
    }

    setShowCheckout(true)
  }

  const handleConfirmPurchase = () => {
    const total = product.price * quantity
    const order = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity,
      total,
      paymentMethod: selectedPayment,
      date: new Date().toISOString(),
      status: 'pending'
    }

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('zxs-orders') || '[]')
    orders.push(order)
    localStorage.setItem('zxs-orders', JSON.stringify(orders))

    // Update product stock
    const products = loadProducts()
    const productIndex = products.findIndex(p => p.id === product.id)
    if (productIndex !== -1) {
      products[productIndex].stock -= quantity
      if (products[productIndex].stock <= 0) {
        products[productIndex].inStock = false
      }
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
      setProduct(products[productIndex])
    }

    setAlert({ kind: 'success', message: `訂單已確認！總金額：${formatPrice(total)}` })
    setShowCheckout(false)
    setTimeout(() => {
      navigate('/products')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
        <p className="text-sm text-slate-200/70">載入產品資料中...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
        <p className="text-sm text-slate-200/70">找不到產品</p>
        <button
          onClick={() => navigate('/products')}
          className="text-sky-400 hover:text-sky-300"
        >
          返回產品列表
        </button>
      </div>
    )
  }

  const total = product.price * quantity

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <button
        onClick={() => navigate('/products')}
        className="mb-4 inline-block text-xs text-sky-400 hover:text-sky-300"
      >
        ← 返回產品列表
      </button>

      {alert && <AlertBanner kind={alert.kind} message={alert.message} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Truck'
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="mb-2 inline-block rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
              {product.category}
            </span>
            <h1 className="mb-2 text-3xl font-semibold text-white">{product.name}</h1>
            <p className="text-lg text-slate-200/80">{product.description}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-slate-400">/ 輛</span>
            </div>
            <p className="mb-4 text-sm text-slate-300">
              {product.inStock ? `庫存: ${product.stock} 輛` : '缺貨'}
            </p>

            {product.inStock && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  數量
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-white outline-none focus:border-sky-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {!showCheckout ? (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={!product.inStock}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-sky-400 disabled:opacity-50"
              >
                {product.inStock ? '立即購買' : '缺貨'}
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    選擇付款方式
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id)}
                        className={`rounded-lg border p-3 text-sm font-semibold transition ${
                          selectedPayment === method.id
                            ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-2">{method.icon}</span>
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex justify-between text-sm text-slate-300">
                    <span>單價</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="mb-2 flex justify-between text-sm text-slate-300">
                    <span>數量</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white">
                    <span>總計</span>
                    <span className="text-emerald-400">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-emerald-400 hover:to-sky-400"
                  >
                    確認購買
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">產品規格</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">{key}</span>
              <span className="font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage


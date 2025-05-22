import { useEffect, useState } from 'react'
import '../styles/VoucherPopup.css'

const voucherList = [
  "Diskon 20% di kopi kenangan",
  "Gratis 1 Donat J.CO",
  "Diskon Rp 10.000 Grab",
  "2 Tiket konser sama ayang",
  "Makan gratis di FIP"
]

function VoucherPopup({ onClose }) {
  const [voucher, setVoucher] = useState('')

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * voucherList.length)
    setVoucher(voucherList[randomIndex])
  }, [])

  return (
    <div className="voucher-popup-overlay">
      <div className="voucher-popup">
        <div className="voucher-icon">🎉</div>
        <h2>Selamat Anda Mendapatkan:</h2>
        <div className="voucher-text">{voucher}</div>
        <button className="close-button" onClick={onClose}>Tutup</button>
      </div>
    </div>
  )
}

export default VoucherPopup
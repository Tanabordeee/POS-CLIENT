import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import LoginComponent from './component/LoginComponent';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { jwtDecode } from "jwt-decode";
import { SyncLoader } from 'react-spinners';

function App() {
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [searchChar, setSearchChar] = useState("");
  const [Product, setProduct] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [Discount , setDiscount] = useState("");
  const [DiscountAmount , setDiscountAmount] = useState({});
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [inputMoney , setInputMoney] = useState("");
  const [change, setChange] = useState(null);
  const navigate = useNavigate();
  const [loading , setLoading] = useState(false);
  const [checkAdmin , setCheckAdmin] = useState(false);
  const billRef = useRef(null);
  let [color, setColor] = useState("#4EFB7F");
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "green"
  };
  const centerLoaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  };

  useEffect(() => {
    const cookies = new Cookies();
    const authToken = cookies.get('auth_token');
    console.log("Auth Token:", authToken); // Add this line
    setHasAuthToken(!!authToken);
    
    if (!authToken) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(authToken);
        const claim = decodedToken.auth_name;
        if (claim === "admin") {
          setCheckAdmin(true);
        }
        GetProduct();
      } catch (error) {
        console.log("Error decoding token:", error);
        navigate("/login");
      }
    }
  }, [navigate]);

  const searchfunction = async (e) => {
    if (searchChar === ""){
      GetProduct()
    }
    e.preventDefault();
    try {
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      const encodeSearchChar = encodeURIComponent(searchChar)
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_API_URL}/FindProductByName/${encodeSearchChar}`,
        {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        }
      );
      let product = []
      product.push(response.data)
      setProduct(product);
    } catch (error) {
      console.log(error);
    }
  };

  const GetProduct = async () => {
    try {
      setLoading(true)
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/GetProduct`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      });
      setProduct(res.data);
      setLoading(false)
    } catch (error) {
      console.log(error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProducts((prevSelectedProducts) => {
      const existingProduct = prevSelectedProducts.find((item) => item.product_name === product.product_name);
  
      if (existingProduct) {
        return prevSelectedProducts.map((item) =>
          item.product_name === product.product_name ? { ...item, quantity_sold: item.quantity_sold + 1 } : item
        );
      } else {
        return [...prevSelectedProducts, { ...product, quantity_sold: 1 }];
      }
    });
  };
  
  const handleReduceQuantity = (product) => {
    setSelectedProducts((prevSelectedProducts) => {
      const existingProduct = prevSelectedProducts.find((item) => item.product_name === product.product_name);
  
      if (existingProduct && existingProduct.quantity_sold > 1) {
        return prevSelectedProducts.map((item) =>
          item.product_name === product.product_name ? { ...item, quantity_sold: item.quantity_sold - 1 } : item
        );
      } else {
        return prevSelectedProducts.filter((item) => item.product_name !== product.product_name);
      }
    });
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    selectedProducts.forEach((product) => {
      totalPrice += product.price * product.quantity_sold;
    });
    if(DiscountAmount.discount_price){
      totalPrice -= DiscountAmount.discount_price;
      return totalPrice;
    }
    if(DiscountAmount.discount_percent){
      const totalDiscount = totalPrice * (DiscountAmount.discount_percent / 100);
      totalPrice -= totalDiscount;
      return totalPrice;
    }
    return totalPrice;
  };

  const FindDiscount = async () => {
    try {
      if (Discount === "") {
        return true;
      }
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/FindDiscountByCode/${Discount}`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      });
      setDiscountAmount(res.data)
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const ReportFunction = async (e) => {
    e.preventDefault();
    const isValidDiscount = await FindDiscount();

    if (isValidDiscount) {
      try {
        const cookies = new Cookies();
        const authToken = cookies.get('auth_token');
        let reportList = [];
        selectedProducts.forEach((product) => {
          reportList.push({
            quantity_sold: product.quantity_sold,
            product_id: product.product_id
          });
        });
        const res = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/CreateReport`, reportList, {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        });
        setShowPaymentSection(true);
        
      } catch (error) {
        console.log(error);
        Swal.fire({
          title: "Failed",
          text: "Failed to create report",
          icon: "error"
        });
      }
    } else {
      Swal.fire({
        title: "Failed",
        text: "Invalid discount code",
        icon: "error"
      });
    }
  };

  const handleNumberClick = (number) => {
    setInputMoney((prev) => prev + number);
  };

  const handleDeleteClick = () => {
    setInputMoney((prev) => prev.slice(0, -1));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const totalPrice = calculateTotalPrice();
    const receivedMoney = parseFloat(inputMoney);
    if (receivedMoney >= totalPrice) {
      const changeAmount = receivedMoney - totalPrice;
      setChange(changeAmount);
      setShowPaymentSection(false);
    } else {
      Swal.fire({
        title: "Insufficient Amount",
        text: "The money received is less than the total price",
        icon: "error"
      });
    }
  };
  const generateBill = () => {
    const doc = new jsPDF('p', 'mm', 'a4');  // 'p' for portrait, 'mm' for millimeters, 'a4' for size
    html2canvas(billRef.current, { scale: 2 }).then((canvas) => {  // scale to increase resolution
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth()-30;
      const pdfHeight = ((imgProps.height * pdfWidth) / imgProps.width);
      const marginLeft = 15
      const marginRight = 20
      doc.addImage(imgData, 'PNG', marginLeft, marginRight, pdfWidth, pdfHeight);
      doc.save('bill.pdf');
      setChange(null)
      window.location.reload();
    });
  };
  const Logoutfunction = () => {
    const cookies = new Cookies();
    cookies.remove('auth_token');
    navigate('/login');
  };
  return (
    <div className='container'>
      {hasAuthToken ? (
        <>
          <div className="nav-bar-cashier">
            <label htmlFor="" className='title-cashier'>ระบบร้านอาหาร</label>
            {checkAdmin && (
              <div className='container-button-cashier'>
                <button className='button-front-cashier' onClick={() => navigate("/")}>หน้าบ้าน</button>
                <button className='button-back-cashier' onClick={() => navigate("/menu")}>หลังบ้าน</button>
                <button className='button-back-cashier' onClick={Logoutfunction} >LOGOUT</button>
              </div>
            )}
          </div>

          {loading ? (
            <div style={centerLoaderStyle}>
              <SyncLoader
                color={color}
                loading={loading}
                margin={20}
                cssOverride={override}
                size={100}
              />
            </div>
          ) : (
            <div className='display-content'>
              <div className='display-product'>
                <div className='container-serch-cashier'>
                  <form onSubmit={searchfunction} className='form-search'>
                    <input
                      type="text"
                      className='search-bar-cashier'
                      placeholder='ชื่อสินค้า'
                      onChange={(e) => setSearchChar(e.target.value)}
                    />
                    <button type='submit' className='search-btn'>
                      <img src="src/assets/searchicon.png" alt="" className='search-btn-img' />
                    </button>
                  </form>
                </div>
                <div className='product-item'>
                  {Array.isArray(Product) && Product.map((product, index) => (
                    <div key={index} className='container-product' onClick={() => handleProductClick(product)}>
                      <img
                        src={`data:image/jpeg;base64,${product.image}`}
                        alt={product.product_name}
                        className='product-image'
                      />
                      <label className='product-label'>{product.product_name}</label>
                      <p className='product-p'>{product.price} ฿</p>
                    </div>
                  ))}
                </div>
              </div>

              <form className='display-add-product' onSubmit={ReportFunction}>
                <div className='addproduct'>
                  {selectedProducts.map((product, index) => (
                    <div key={index} className='selected-product'>
                      <label>{product.product_name}</label>
                      <span>  X {product.quantity_sold}</span>
                      <button type='button' className="reduce-quantity-btn" onClick={() => handleReduceQuantity(product)}>-</button>
                    </div>
                  ))}
                </div>
                <label htmlFor="" className='sum-price'>ยอดรวม : {calculateTotalPrice()} ฿</label>
                <input className='discount-input' type="text" placeholder='โค้ดส่วนลด' onChange={(e) => setDiscount(e.target.value)} />
                <button type="submit" className='submit-price'>ชำระเงิน</button>
              </form>
            </div>
          )}

          {showPaymentSection && (
            <div className='container-card-money'>
              <div className='header-card-money'>
                <button className='button-exit-money' onClick={() => setShowPaymentSection(false)}>X</button>
                <label htmlFor="" className='label-card-money'>รับมาทั้งหมด</label>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                <div className='container-card-input-money'>
                  <label htmlFor="" className='card-result-money'>{inputMoney} ฿</label>
                  <div className='container-input-number'>
                    <button type="button" onClick={() => handleNumberClick('7')}>7</button>
                    <button type="button" onClick={() => handleNumberClick('8')}>8</button>
                    <button type="button" onClick={() => handleNumberClick('9')}>9</button>
                    <button type="button" onClick={() => handleNumberClick('4')}>4</button>
                    <button type="button" onClick={() => handleNumberClick('5')}>5</button>
                    <button type="button" onClick={() => handleNumberClick('6')}>6</button>
                    <button type="button" onClick={() => handleNumberClick('1')}>1</button>
                    <button type="button" onClick={() => handleNumberClick('2')}>2</button>
                    <button type="button" onClick={() => handleNumberClick('3')}>3</button>
                    <button type="button" onClick={() => handleNumberClick('.')}>.</button>
                    <button type="button" onClick={() => handleNumberClick('0')}>0</button>
                    <button type="button" className='img-input-number' onClick={handleDeleteClick}>
                      <img className='child-img-input-number' src="src/assets/delete.png" alt="" />
                    </button>
                  </div>
                </div>
                <button type="submit" className="card-submit-money">ชำระเงิน</button>
              </form>
            </div>
          )}

          {change !== null && (
            <div className='container-popup-change'>
              <div className='bill-details' ref={billRef}>
                <h2>ใบเสร็จรับเงิน</h2>
                <p>ยอดรวม: {calculateTotalPrice()} ฿</p>
                <p>เงินที่รับมา: {inputMoney} ฿</p>
                <p>เงินทอน: {change.toFixed(2)} ฿</p>
                <h3>รายการสินค้า</h3>
                {selectedProducts.map((product, index) => (
                  <div key={index}>
                    <span>{product.product_name} x {product.quantity_sold}</span>
                    <span>{product.price * product.quantity_sold} ฿</span>
                  </div>
                ))}
              </div>
              <button onClick={generateBill}>พิมพ์ใบเสร็จ</button>
            </div>
          )}
        </>
      ) : (
        <LoginComponent />
      )}
    </div>
  );
}

export default App;
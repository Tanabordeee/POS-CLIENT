import React, { useEffect, useState } from "react";
import NavbarComponent from "./NavbarComponent";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import { SyncLoader } from 'react-spinners';
import Swal from "sweetalert2";
import "./DiscountComponent.css";
const DiscountComponent = ()=>{
    const navigate = useNavigate();
    const [hasAuthToken, setHasAuthToken] = useState(false);
    const [Discountlist , setDiscountlist] = useState([])
    const [loading, setLoading] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [color, setColor] = useState("#4EFB7F");
    const [SearchChar , setSearchChar] = useState("");
    const [code , setCode] = useState("");
    const [price , setPrice] = useState(0)
    const [DiscountID , setDiscountID] = useState(null);
    const [percent , setPercent] = useState(0)
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
        setHasAuthToken(!!authToken);
        if (!authToken) {
          navigate("/login");
        } else {
          getDiscount()
        }
      }, [navigate]);
    const getDiscount = async () => {
      try{
        setLoading(true)
        const cookies = new Cookies();
        const authToken = cookies.get('auth_token');
        const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/GetDiscounts`, {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        });
        setDiscountlist(res.data);
        setLoading(false);
      }catch (error) {
        console.error(error)
      }
    }
    const searchfunction = async (e) =>{
      if (SearchChar === ""){
        getDiscount()
      }
      e.preventDefault();
      try {
        const cookies = new Cookies();
        const authToken = cookies.get('auth_token');
        const encodeSearchChar = encodeURIComponent(SearchChar)
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_API_URL}/FindDiscountByCode/${encodeSearchChar}`,
          {
            headers: {
              Authorization: 'Bearer ' + authToken
            }
          }
        );
        let discount = []
        discount.push(response.data)
        setDiscountlist(discount);
      } catch (error) {
        console.log(error);
      }
    }
    const DeleteDiscount = async (id) => {
      try{
        Swal.fire({
          title: "ยืนยันการลบ ?",
          text: "กดยืนยันเพื่อลบ กด Cancel เพื่อกลับไปหน้าเดิม",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "ยืนยันการลบ"
        }).then( async (result)=>{
          if(result.isConfirmed){
            const cookies = new Cookies();
            const authToken = cookies.get('auth_token');
            const response = await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/DeleteUseCaseDiscount/${id}` , {
              headers: {
                Authorization: 'Bearer ' + authToken
              }
            })
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            })
            getDiscount()
          }
        })
      }catch (error){
        console.error(error);
      }
    }
    const CreateDiscount = async (e) => {
      e.preventDefault()
      try{
        const cookies = new Cookies();
        const authToken = cookies.get('auth_token');
        const response = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/CreateDiscount` ,{
          discount_code:code , 
          discount_price:parseInt(price) ,
          discount_percent:parseInt(percent)
        } ,{
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        })
        Swal.fire({
          title: "Success",
          text: "Create สำเร็จ",
          icon: "success"
        });
        setCode("");
        setPrice(0);
        setPercent(0);
        setShowCreatePopup(false);
        getDiscount();
      }catch (error){
        console.error(error)
      }
    }
    const UpdateDiscount = async (e)=>{
      e.preventDefault()
      try {
        const cookies = new Cookies();
        const authToken = cookies.get('auth_token');
        await axios.put(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/UpdateUseCaseDiscount/${DiscountID}`, {
          discount_code: code,
          discount_price: parseInt(price),
          discount_percent: parseInt(percent)
        }, {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        });
        Swal.fire({
          title: "Success",
          text: "Employee updated successfully",
          icon: "success"
        });
        setShowUpdatePopup(false);
        getDiscount();
      } catch (error) {
        console.error(error);
      }
    }
    const SetUpdateDiscount = async (code)=>{
      try {
        const cookies = new Cookies();
        const authToken = cookies.get('auth_token');
        const encodeSearchName = encodeURIComponent(code);
        const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/FindDiscountByCode/${encodeSearchName}`, {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        });
        setCode(res.data.discount_code);
        setPrice(res.data.discount_price);
        setPercent(res.data.discount_percent);
        setDiscountID(res.data.discount_id);
        setShowUpdatePopup(true);
      } catch (error) {
        console.error(error);
      }
    }
    const SetCreateDiscount = ()=>{
      setShowCreatePopup(true);
      setCode("")
      setPrice(0)
      setPercent(0)
      setDiscountID(null)
    }
    return (
        
        <>
        <NavbarComponent />
        {hasAuthToken && (
          <>
          {loading ?  (
            <div style={centerLoaderStyle}>
              <SyncLoader
                color={color}
                loading={loading}
                margin={20}
                cssOverride={override}
                size={100}
              />
            </div>
          ) : <>
                        <div className='product-header'>
              <div className='product-search'>
                <form className='form-search-product' onSubmit={searchfunction}>
                  <input
                    type="text"
                    placeholder='ค้นหา code'
                    onChange={(e) => setSearchChar(e.target.value)}
                  />
                  <button type='submit' className='search-product-btn'>
                  <img src="src/assets/searchicon.png" alt="" />
                  </button>
                </form>
              </div>
              <button className='search-product-btn-plus' onClick={()=>{SetCreateDiscount()}}>+</button>
            </div>
            <div className="discount-content">
                {Array.isArray(Discountlist) && Discountlist.map((discount, index) => (
                  <div className="card-discount" key={index}>
                    <label htmlFor="">code : {discount.discount_code}</label>
                    <label htmlFor="">price : {discount.discount_price}</label>
                    <label htmlFor="">percent : {discount.discount_percent}</label>
                    <button className="discount-delete" onClick={()=>{DeleteDiscount(discount.discount_id)}}>
                      <img src="src/assets/trash-can.png" alt="Delete" />
                    </button>
                    <button className="dicount-fix" onClick={()=>{SetUpdateDiscount(discount.discount_code)}}>
                      <img src="src/assets/fix.png" alt="Fix" />
                    </button>
                  </div>
                ))}
              </div>
              {showCreatePopup && (
                <div className='container-popup-create'>
                  <div className='exit-poup-create-container'>
                    <button className='exit-poup-create' onClick={() => setShowCreatePopup(false)}>X</button>
                  </div>
                  <form className='popup-create-content' onSubmit={CreateDiscount}>
                    <label htmlFor="code">code</label>
                    <input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    <label htmlFor="price">price</label>
                    <input
                      type="text"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                    <label htmlFor="percent">percent</label>
                    <input
                      type="text"
                      id="percent"
                      value={percent}
                      onChange={(e) => setPercent(e.target.value)}
                      required
                    />
                    <button type="submit" className='popup-create-content-submit'>ยืนยัน</button>
                  </form>
                </div>
              )}
               {showUpdatePopup && (
                <div className='container-popup-create'>
                  <div className='exit-poup-create-container'>
                    <button className='exit-poup-create' onClick={() => setShowUpdatePopup(false)}>X</button>
                  </div>
                  <form className='popup-create-content' onSubmit={UpdateDiscount}>
                  <label htmlFor="code">code</label>
                    <input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    <label htmlFor="price">price</label>
                    <input
                      type="text"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                    <label htmlFor="percent">percent</label>
                    <input
                      type="text"
                      id="percent"
                      value={percent}
                      onChange={(e) => setPercent(e.target.value)}
                      required
                    />
                    <button type="submit" className='popup-create-content-submit'>ยืนยัน</button>
                  </form>
                </div>
              )}
            </>
            
            }
          </>
        )}
        </>
    )
}
export default DiscountComponent;
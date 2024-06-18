import { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import NavbarComponent from "./NavbarComponent"
import "./ProductComponent.css"
import {SyncLoader } from 'react-spinners';
const ProductComponent = ()=>{
    const navigate = useNavigate();
    const [hasAuthToken, setHasAuthToken] = useState(false);
    const [Product , setProduct] = useState([]);
    const [SearchChar , setSearchChar] = useState("");
    const [loading , setLoading] = useState(false);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [cost, setCost] = useState('');
    const [CheckpopupCreate , setCheckpopupCreate] = useState(false)
    const [CheckpopupUpdate , setCheckpopupUpdate] = useState(false)
    const [editingProductId, setEditingProductId] = useState(null);
    const [image, setImage] = useState(null);
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
        setHasAuthToken(!!authToken);
        if (!authToken) {
          navigate("/login");
        } else {
          GetProduct();
        }
      }, [navigate]);
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
          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      };

      const searchfunction = async (e) => {
        if (SearchChar === ""){
          GetProduct()
        }
        e.preventDefault();
        try {
          const cookies = new Cookies();
          const authToken = cookies.get('auth_token');
          const encodeSearchChar = encodeURIComponent(SearchChar)
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

      const deleteProduct = async (productID) => {
        Swal.fire({
          title: "ยืนยันการลบ ?",
          text: "กดยืนยันเพื่อลบ กด Cancel เพื่อกลับไปหน้าเดิม",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "ยืนยันการลบ"
        }).then(async (result) => {
            if (result.isConfirmed) {
              try{
                const cookies = new Cookies();
                const authToken = cookies.get('auth_token');
                const res = await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/DeleteProduct/${productID}`,{
                  headers: {
                    Authorization: 'Bearer ' + authToken
                  }
                })
              }catch (error){
              console.log(error)
              }
              window.location.reload();
              Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
              });
            }
        });
      }

      const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('product_name', productName);
            formData.append('price', price);
            formData.append('cost', cost);
            formData.append('image', image);
            const cookies = new Cookies();
            const authToken = cookies.get('auth_token');

            if (editingProductId) {
                // Update existing product
                const response = await axios.put(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/UpdateProduct/${editingProductId}`, formData, {
                    headers: {
                        Authorization: 'Bearer ' + authToken
                    }
                });
                Swal.fire({
                    title: "Success",
                    text: "Update Product successfully",
                    icon: "success"
                });
            } if(CheckpopupCreate) {
                // Create new product
                const response = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/CreateProduct`, formData, {
                    headers: {
                        Authorization: 'Bearer ' + authToken
                    }
                });
                Swal.fire({
                    title: "Success",
                    text: "Create Product successfully",
                    icon: "success"
                });
            }

            GetProduct();
            setCheckpopupCreate(false); // Close create/update popup
            setCheckpopupUpdate(false); // Close create/update popup
        } catch (error) {
            console.error('Error creating/updating product:', error);
            alert('Failed to create/update product');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

      const handleModify = async (productname) => {
        try {
          const cookies = new Cookies();
          const authToken = cookies.get('auth_token');
          const encodeproductname = encodeURIComponent(productname)
          const res = await axios.get(
            `${import.meta.env.VITE_REACT_API_URL}/FindProductByName/${encodeproductname}`,
            {
              headers: {
                Authorization: 'Bearer ' + authToken
              }
            }
          );
            const product = res.data;
            setEditingProductId(product.product_id);
            setProductName(product.product_name);
            setPrice(product.price);
            setCost(product.cost);
            setCheckpopupUpdate(true); 
        } catch (error) {
            console.log(error);
        }
    };
    const handleCreate = ()=>{
      setEditingProductId(null);
      setProductName("");
      setPrice("");
      setCost("");
      setCheckpopupCreate(true); 
    }
      return (
        <>
          <NavbarComponent />
          {hasAuthToken && (
            <>
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
                <>
                  <div className='product-header'>
                    <div className='product-search'>
                      <form className='form-search-product' onSubmit={searchfunction}>
                        <input
                          type="text"
                          placeholder='ชื่อสินค้า'
                          onChange={(e) => setSearchChar(e.target.value)}
                        />
                        <button type='submit' className='search-product-btn'>
                          <img src="src/assets/searchicon.png" alt="" />
                        </button>
                      </form>
                    </div>
                    <button className='search-product-btn-plus' onClick={()=>{handleCreate()}}>+</button>
                  </div>
                  <div className='product-content'>
                    <div className='product-item'>
                      {Array.isArray(Product) && Product.map((product, index) => (
                        <div key={index} className='container-product'>
                          <img
                            src={`data:image/jpeg;base64,${product.image}`}
                            alt={product.product_name}
                            className='product-image'
                          />
                          <label>{product.product_name}</label>
                          <p>{product.price} ฿</p>
                          <div className='btn-del-modify'>
                          <button className='delete-product' onClick={()=>{deleteProduct(product.product_id)}}>ลบ</button>
                          <button className='modify-product' onClick={()=>{handleModify(product.product_name)}}>แก้ไข</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {CheckpopupCreate && <div className='container-popup-create'>
                    <div className='exit-poup-create-container'>
                      <button className='exit-poup-create' onClick={()=>setCheckpopupCreate(false)}>X</button>
                    </div>
                    <form className='popup-create-content' onSubmit={handleSubmit}>
                      <label htmlFor="productName">ชื่อสินค้า</label>
                      <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                      <label htmlFor="price">ราคาสินค้า</label>
                      <input
                        type="text"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                      <label htmlFor="cost">ต้นทุนสินค้า</label>
                      <input
                        type="text"
                        id="cost"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                      />
                      <label htmlFor="image">รูปภาพ</label>
                      <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        required
                      />
                      <button type="submit" className='popup-create-content-submit'>ยืนยัน</button>
                    </form>
                  </div>}

                  {CheckpopupUpdate && <div className='container-popup-create'>
                    <div className='exit-poup-create-container'>
                      <button className='exit-poup-create' onClick={()=>setCheckpopupUpdate(false)}>X</button>
                    </div>
                    <form className='popup-create-content' onSubmit={handleSubmit}>
                      <label htmlFor="productName">ชื่อสินค้า</label>
                      <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                      <label htmlFor="price">ราคาสินค้า</label>
                      <input
                        type="text"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                      <label htmlFor="cost">ต้นทุนสินค้า</label>
                      <input
                        type="text"
                        id="cost"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                      />
                      <label htmlFor="image">รูปภาพ</label>
                      <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        required
                      />
                      <button type="submit" className='popup-create-content-submit'>ยืนยัน</button>
                    </form>
                  </div>}
                </>
              )}
            </>
          )}
        </>
      );
    }
    

export default ProductComponent;
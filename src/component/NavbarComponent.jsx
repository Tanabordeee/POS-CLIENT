import { useNavigate } from 'react-router-dom';
import "./NavbarComponent.css"
const  NavbarComponent = ()=>{
    const navigate = useNavigate();
    return (
    <>
        <div className='nav-backend'>
            <div className='nav-backend-left'>
            <button onClick={()=> navigate("/menu")}>MENU</button>
            <button onClick={()=> navigate("/employee")}>Employee</button>
            <button onClick={()=> navigate("/discount")}>Discount</button>
            <button onClick={()=> navigate("/analysis")}>Analysis</button>
            </div>
            <div className='nav-backend-right'>
            <button onClick={()=>navigate("/")}>หน้าบ้าน</button>
            <button onClick={()=>navigate("/menu")}>หลังบ้าน</button>
            </div>
        </div>
    </>
    )
}

export default NavbarComponent;
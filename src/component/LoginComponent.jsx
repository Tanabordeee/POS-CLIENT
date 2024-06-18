import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Swal from "sweetalert2";
import "./LoginComponent.css"
import { useNavigate } from "react-router-dom";
const LoginComponent = () => {
    const [authName, setAuthName] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/GetAuth`, {
                auth_name: authName,
                auth_password: authPassword
            }).then(res => {
                Swal.fire({
                    title: "Success",
                    text: "Login สำเร็จ",
                    icon: "success"
                });
                const cookies = new Cookies();
                cookies.set('auth_token', res.data.token, { path: '/' }); 
                navigate("/")
            }).catch(err => {
                Swal.fire({
                    title: "FAILED",
                    text: "Login ไม่สำเร็จ",
                    icon: "error"
                });
            });
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    };

    return (
        <div className='body-login'>
        <div className="container-login">
                <img src="src/assets/login.png" alt="" className='login-img'/>
                <form onSubmit={handleSubmit} className='form-login'>
                <div className='form-username'>
                    <label htmlFor="authName">Username</label>
                    <input
                        type="text"
                        id="authName"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                    />
                </div>
                <div className='form-password'>
                    <label htmlFor="authPassword">Password</label>
                    <input
                        type="password"
                        id="authPassword"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className='btn-login'>Login</button>
            </form>
        </div>
        </div>
    );
}

export default LoginComponent;

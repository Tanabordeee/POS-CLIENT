import React, { useEffect, useState } from "react";
import NavbarComponent from "./NavbarComponent";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import { SyncLoader } from 'react-spinners';
import Swal from "sweetalert2";
import "./EmployeeComponent.css"; // Ensure this path is correct

const EmployeeComponent = () => {
  const navigate = useNavigate();
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employeeID, setEmployeeID] = useState(null);
  const [color, setColor] = useState("#4EFB7F");

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
      getEmployeeData();
    }
  }, [navigate]);

  const getEmployeeData = async () => {
    try {
      setLoading(true);
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/GetEmployee`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      });
      setEmployeeList(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setLoading(false);
    }
  };

  const findEmployee = async (e) => {
    e.preventDefault();
    if (searchName === "") {
      getEmployeeData();
      return;
    }
    try {
      setLoading(true);
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      const encodeSearchName = encodeURIComponent(searchName);
      const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/FindEmployee/${encodeSearchName}`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      });
      setEmployeeList([res.data]);
      setLoading(false);
    } catch (error) {
      console.error("Error searching employee:", error);
      setLoading(false);
    }
  };

  const createEmployee = async (e) => {
    e.preventDefault();
    try {
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      
      // Create the employee
      const resEmployee = await axios.post(
        `${import.meta.env.VITE_REACT_API_URL}/AdminGroup/CreateEmployee`,
        {
          name: name,
          role: role,
          salary: parseFloat(salary)
        },
        {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        }
      );
  
      // Function to search for the employee with retry mechanism
      const findEmployee = async () => {
        const encodeSearchName = encodeURIComponent(name);
        let res;
        for (let attempt = 0; attempt < 5; attempt++) {
          res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/FindEmployee/${encodeSearchName}`, {
            headers: {
              Authorization: 'Bearer ' + authToken
            }
          });
          if (res.data.employee_id) {
            return res.data;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
        }
        throw new Error("Failed to find the employee after multiple attempts");
      };
  
      // Wait until the employee is found
      const employeeData = await findEmployee();
  
      // Create authentication for the employee
      await axios.post(
        `${import.meta.env.VITE_REACT_API_URL}/AdminGroup/CreateAuth`,
        {
          employee_id: employeeData.employee_id, 
          username: username,
          password: password
        },
        {
          headers: {
            Authorization: 'Bearer ' + authToken
          }
        }
      );
  
      // Show success message
      Swal.fire({
        title: "Success",
        text: "Employee created successfully",
        icon: "success"
      });
      setShowCreatePopup(false);
      // Refresh employee data
      getEmployeeData();
    } catch (error) {
      console.error("Error creating employee:", error);
  
      // If there's an error creating authentication, delete the employee
      if (error.response && error.response.config && error.response.config.url.includes("CreateAuth")) {
        try {
          const cookies = new Cookies();
          const authToken = cookies.get('auth_token');
          const encodeSearchName = encodeURIComponent(name);
  
          // Find employee id for deletion
          const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/FindEmployee/${encodeSearchName}`, {
            headers: {
              Authorization: 'Bearer ' + authToken
            }
          });
  
          if (res.data && res.data.employee_id) {
            await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/DeleteEmployee/${res.data.employee_id}`, {
              headers: {
                Authorization: 'Bearer ' + authToken
              }
            });
          }
          setShowCreatePopup(false);
          getEmployeeData();
        } catch (deleteError) {
          console.error("Error deleting employee:", deleteError);
        }
      }
      setShowCreatePopup(false);
      // Show error message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
  
      // Handle other specific error cases or provide user feedback
      if (error.response) {
        console.error("Server Error:", error.response.data);
      } else if (error.request) {
        console.error("Request Error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  const deleteEmployee = async (id) => {
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
        try {
          const cookies = new Cookies();
          const authToken = cookies.get('auth_token');
          await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/DeleteEmployee/${id}`, {
            headers: {
              Authorization: 'Bearer ' + authToken
            }
          });
          getEmployeeData();
        } catch (error) {
          console.error("Error deleting employee:", error);
        }
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      }
    });
  };

  const setUpdateEmployee = async (name) => {
    try {
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      const encodeSearchName = encodeURIComponent(name);
      const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/FindEmployee/${encodeSearchName}`, {
        headers: {
          Authorization: 'Bearer ' + authToken
        }
      });
      setName(res.data.name);
      setRole(res.data.role);
      setSalary(res.data.salary);
      setEmployeeID(res.data.employee_id);
      setShowUpdatePopup(true);
    } catch (error) {
      console.error(error);
    }
  };

  const updateEmployee = async (e) => {
    e.preventDefault();
    try {
      const cookies = new Cookies();
      const authToken = cookies.get('auth_token');
      await axios.put(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/UpdateEmployee/${employeeID}`, {
        name: name,
        role: role,
        salary: parseFloat(salary)
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
      getEmployeeData();
    } catch (error) {
      console.error(error);
    }
  };

  const setCreateEmployee = () => {
    setShowCreatePopup(true);
    setName("");
    setRole("");
    setSalary("");
    setUsername("");
    setPassword("");
    setEmployeeID(null);
  };

  return (
    <>
      {hasAuthToken && (
        <>
          <NavbarComponent />
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
                  <form className='form-search-product' onSubmit={findEmployee}>
                    <input
                      type="text"
                      placeholder='ชื่อพนักงาน'
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)} // Update searchName state
                    />
                    <button type='submit' className='search-product-btn'>
                      <img src="src/assets/searchicon.png" alt="" />
                    </button>
                  </form>
                </div>
                <button className='search-product-btn-plus' onClick={setCreateEmployee}>+</button>
              </div>
              <div className="employee-content">
                {Array.isArray(employeeList) && employeeList.map((employee, index) => (
                  <div className="card-employee" key={index}>
                    <label htmlFor="">ชื่อ : {employee.name}</label>
                    <label htmlFor="">ตำแหน่ง : {employee.role}</label>
                    <label htmlFor="">เงินเดือน : {employee.salary}</label>
                    <button className="employee-delete" onClick={() => deleteEmployee(employee.employee_id)}>
                      <img src="src/assets/trash-can.png" alt="Delete" />
                    </button>
                    <button className="employee-fix" onClick={() => setUpdateEmployee(employee.name)}>
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
                  <form className='popup-create-content' onSubmit={createEmployee}>
                    <label htmlFor="name">ชื่อจริง</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <label htmlFor="role">ตำแหน่ง</label>
                    <input
                      type="text"
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    />
                    <label htmlFor="salary">เงินเดือน</label>
                    <input
                      type="text"
                      id="salary"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      required
                    />
                    <label htmlFor="username">username</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <label htmlFor="password">password</label>
                    <input
                      type="text"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <form className='popup-create-content' onSubmit={updateEmployee}>
                    <label htmlFor="name">ชื่อจริง</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <label htmlFor="role">ตำแหน่ง</label>
                    <input
                      type="text"
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    />
                    <label htmlFor="salary">เงินเดือน</label>
                    <input
                      type="text"
                      id="salary"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      required
                    />
                    <button type="submit" className='popup-create-content-submit'>ยืนยัน</button>
                  </form>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default EmployeeComponent;

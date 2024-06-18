import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from "./App";
import LoginComponent from "./component/LoginComponent";
import ProductComponent from "./component/ProductComponent";
import EmployeeComponent from "./component/EmployeeComponent";
import DiscountComponent from "./component/DiscountComponent";
import AnalysisComponent from "./component/AnalysisComponent";
const MainRoute = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/" element={<App />} />
                <Route path="/menu" element = {<ProductComponent/>}></Route>
                <Route path="/employee" element = {<EmployeeComponent/>}></Route>
                <Route path="/discount" element = {<DiscountComponent/>}></Route>
                <Route path="/analysis" element = {<AnalysisComponent/>}></Route>
            </Routes>
        </Router>
    );
}

export default MainRoute;

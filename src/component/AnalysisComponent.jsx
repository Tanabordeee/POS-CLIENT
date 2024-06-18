import React, { useEffect, useState, useRef } from 'react';
import NavbarComponent from './NavbarComponent';
import { Bar } from 'react-chartjs-2';
import Cookies from 'universal-cookie';
import axios from 'axios';
import "./AnalysisComponent.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalysisComponent = () => {
    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [selectDate, setSelectDate] = useState(getCurrentDate());
    const [popularProduct , setpopularProduct] = useState("");
    const [Allquantity , setAllquantity] = useState(0)
    const [Income , setIncome] = useState(0)
    const [Profit , setProfit] = useState(0)
    useEffect(() => {
        fetchReportData(); // Fetch initial data when component mounts
    }, [selectDate]); // Trigger fetchReportData whenever selectDate changes

    const fetchReportData = async () => {
        try {
            const cookies = new Cookies();
            const authToken = cookies.get('auth_token');
            const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/GetReport?date=${selectDate}`, {
                headers: {
                    Authorization: 'Bearer ' + authToken
                }
            });
            const reports = response.data;
    
            // Aggregate data for chart
            const aggregatedData = reports.reduce((acc, report) => {
                const existingIndex = acc.findIndex(item => item.product_name === report.product.product_name);
                if (existingIndex !== -1) {
                    acc[existingIndex].quantity_sold += report.quantity_sold;
                } else {
                    acc.push({
                        product_name: report.product.product_name,
                        quantity_sold: report.quantity_sold,
                        price: report.product.price ,
                        cost : report.product.cost
                    });
                }
                return acc;
            }, []);
    
            const labels = aggregatedData.map(item => item.product_name);
            const data = aggregatedData.map(item => item.quantity_sold);
            
            
            const totalQuantity = data.reduce((total, quantity) => total + quantity, 0);
            setAllquantity(totalQuantity);
    
            
            const totalIncome = aggregatedData.reduce((total, item) => {
                return total + (item.quantity_sold * item.price);
            }, 0);
            setIncome(totalIncome);
            
            const Totalcost = aggregatedData.reduce((totalcost, item) => {
                return totalcost + (item.quantity_sold * item.cost);
            }, 0);

            setProfit(totalIncome - Totalcost);

            const indexData = data.indexOf(Math.max(...data));
            setpopularProduct(labels[indexData]);
    
            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: data,
                        backgroundColor: 'rgba(159, 245, 129, 0.5)',
                        borderColor: 'rgba(159, 245, 129, 1)',
                        borderWidth: 1,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    const handleSelectChange = (e) => {
        const selectedOption = e.target.value;
        switch (selectedOption) {
            case '7days':
                fectData7days();
                break;
            case '1month':
                fectData1month();
                break;
            case '1year':
                fetchData1year();
                break;
            default:
                break;
        }
    };

    const fectData7days = async () => {
        try {
            const cookies = new Cookies();
            const authToken = cookies.get('auth_token');
            const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/GetReports7Days`, {
                headers: {
                    Authorization: 'Bearer ' + authToken
                }
            });
            const reports = response.data;

            // Aggregate data for chart
            const aggregatedData = reports.reduce((acc, report) => {
                const existingIndex = acc.findIndex(item => item.product_name === report.product.product_name);
                if (existingIndex !== -1) {
                    acc[existingIndex].quantity_sold += report.quantity_sold;
                } else {
                    acc.push({
                        product_name: report.product.product_name,
                        quantity_sold: report.quantity_sold
                    });
                }
                return acc;
            }, []);

            const labels = aggregatedData.map(item => item.product_name);
            const data = aggregatedData.map(item => item.quantity_sold);

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: data,
                        backgroundColor: 'rgba(159, 245, 129, 0.5)',
                        borderColor: 'rgba(159, 245, 129, 1)',
                        borderWidth: 1,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    const fectData1month = async () => {
        try {
            const cookies = new Cookies();
            const authToken = cookies.get('auth_token');
            const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/GetReports1Month`, {
                headers: {
                    Authorization: 'Bearer ' + authToken
                }
            });
            const reports = response.data;

            // Aggregate data for chart
            const aggregatedData = reports.reduce((acc, report) => {
                const existingIndex = acc.findIndex(item => item.product_name === report.product.product_name);
                if (existingIndex !== -1) {
                    acc[existingIndex].quantity_sold += report.quantity_sold;
                } else {
                    acc.push({
                        product_name: report.product.product_name,
                        quantity_sold: report.quantity_sold
                    });
                }
                return acc;
            }, []);

            const labels = aggregatedData.map(item => item.product_name);
            const data = aggregatedData.map(item => item.quantity_sold);

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: data,
                        backgroundColor: 'rgba(159, 245, 129, 0.5)',
                        borderColor: 'rgba(159, 245, 129, 1)',
                        borderWidth: 1,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    const fetchData1year = async () => {
        try {
            const cookies = new Cookies();
            const authToken = cookies.get('auth_token');
            const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/AdminGroup/GetReports1Year`, {
                headers: {
                    Authorization: 'Bearer ' + authToken
                }
            });
            const reports = response.data;

            // Aggregate data for chart
            const aggregatedData = reports.reduce((acc, report) => {
                const existingIndex = acc.findIndex(item => item.product_name === report.product.product_name);
                if (existingIndex !== -1) {
                    acc[existingIndex].quantity_sold += report.quantity_sold;
                } else {
                    acc.push({
                        product_name: report.product.product_name,
                        quantity_sold: report.quantity_sold
                    });
                }
                return acc;
            }, []);

            const labels = aggregatedData.map(item => item.product_name);
            const data = aggregatedData.map(item => item.quantity_sold);

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: data,
                        backgroundColor: 'rgba(159, 245, 129, 0.5)',
                        borderColor: 'rgba(159, 245, 129, 1)',
                        borderWidth: 1,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'ชื่อสินค้า', // Label บนแกน X
                    color: '#333', // สีของข้อความ
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'จำนวนสินค้าที่ขายได้', // Label บนแกน Y
                    color: '#333', // สีของข้อความ
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    stepSize: 5,
                },
            },
        },
    };
    return (
        <>
            <NavbarComponent />
            <div className='container-analysis'>
                <div className="chart-container">
                    <Bar ref={chartRef} data={chartData} options={options} />
                </div>
                <div className='container-choose'>
                    <input type="date" onChange={(e) => { setSelectDate(e.target.value) }} value={selectDate} />
                    <select name="" id="" onChange={handleSelectChange}>
                        <option value="7days">7 วัน</option>
                        <option value="1month">1 เดือน</option>
                        <option value="1year">1 ปี</option>
                    </select>
                </div>
                <div className='analysis-content'>
                    <div className='analysis-content-left'>
                        <label htmlFor="">สินค้าที่ขายได้เยอะที่สุด : {popularProduct}</label>
                        <label htmlFor="">จำนวนสินค้าที่ขายได้ทั้งหมด : {Allquantity} ชิ้น</label>
                    </div>
                    <div className='analysis-content-right'>
                        <label htmlFor="">รายได้ทั้งหมด : {Income} ฿</label>
                        <label htmlFor="">กำไรที่ได้ : {Profit} ฿</label>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnalysisComponent;

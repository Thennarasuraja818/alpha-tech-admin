import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import apiProvider from "../apiProvider/product"
import * as XLSX from 'xlsx';

const ProductReportLayer = () => {
    const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);

    const [formData, setFormData] = useState({
        productId: "",
        customerId: "",
        fromDate: formatDate(tenDaysAgo),
        toDate: formatDate(today)
    });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productList, setProductlist] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [isSearched, setIsSearched] = useState(false);
    // const [pageIndex, setPageIndex] = useState(0);
    // const [pageSize, setPageSize] = useState(5);
    // const [total, setTotal] = useState(0);

    const fetchProducts = async () => {
        try {
            const input = {
                page: 0,
                limit: 2000
            }
            const response = await apiProvider.getAllproductList(input);

            if (response.status) {
                setProductlist(response.response?.data || []);
            } else {
                console.error("failed to fetch product list")
            }
        } catch (error) {
            console.error("error fetching product list :", error);
        }
    }

    const fetchCustomers = async () => {
        try {
            const input = {
                page: 0,
                limit: 2000
            }
            const response = await apiProvider.getCustomerList(input);
            if (response.status) {
                setCustomerList(response.response?.data || [])
            } else {
                console.error("failed to fetch customer list")
            }
        } catch (error) {
            console.error("error fetching customer list :", error)
        }
    }

    const fetchReport = async () => {
        setLoading(true);
        try {
            const input = {
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                productId: formData.productId || undefined,
                customerId: formData.customerId || undefined
            };
            console.log("input :", input);
            const result = await apiProvider.getProductOrderList(input);

            if (result.status && result.response) {
                setReportData(result.response.data || []);
                setIsSearched(true);
            } else {
                setReportData([]);
                setIsSearched(true);
                toast.error("Failed to fetch report data");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error("An error occurred while fetching the report");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, [])



    const handleChange = (name, value) => {
        console.log("value :", value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        fetchReport();
    };

    const handleExportExcel = () => {
        if (reportData.length === 0) {
            toast.info("No data available to export");
            return;
        }

        const dataToExport = reportData.map(item => ({
            "Date": new Date(item.date).toLocaleDateString('en-IN'),
            "Order ID": item.orderId,
            "Customer Name": item.customerName,
            "Product Name": item.productName,
            "Variant Name": item.variantName || '-',
            "Quantity": item.quantity,
            "Unit Price": item.unitPrice,
            "Total Price": item.totalPrice
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Set column widths
        const wscols = [
            { wch: 15 }, // Date
            { wch: 15 }, // Order ID
            { wch: 25 }, // Customer Name
            { wch: 30 }, // Product Name
            { wch: 20 }, // Variant Name
            { wch: 10 }, // Quantity
            { wch: 15 }, // Unit Price
            { wch: 15 }  // Total Price
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Report");

        const fileName = `Product_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success("Excel report downloaded successfully!");
    };

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            borderRadius: '6px',
            borderColor: '#e2e8f0',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#cbd5e1'
            }
        }),
        placeholder: (base) => ({
            ...base,
            color: '#94a3b8'
        })
    };

    const primaryColor = "#1e293b";

    return (
        <div className="card h-100 p-0 radius-12 overflow-hidden border-0 shadow-sm">
            <div className="card-header border-bottom bg-white py-20 px-24">
                <h5 className="mb-0 fw-bold" style={{ color: primaryColor }}>Product Sales Report</h5>
            </div>

            <div className="card-body p-24">
                {/* Improved Report Filters Section */}
                <div className="card border-0 bg-light-gray radius-12 p-24 mb-32" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="d-flex align-items-center gap-2 mb-20">
                        <div className="p-8 radius-8" style={{ backgroundColor: primaryColor }}>
                            <Icon icon="mdi:filter-variant" className="text-white text-xl" />
                        </div>
                        <h6 className="mb-0 fw-bold">Report Filters</h6>
                    </div>

                    <form onSubmit={handleSearch}>
                        <div className="row g-4">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary small mb-8">From Date</label>
                                <input
                                    type="date"
                                    className="form-control border-gray-200 radius-6 py-10"
                                    value={formData.fromDate}
                                    onChange={(e) => handleChange('fromDate', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary small mb-8">To Date</label>
                                <input
                                    type="date"
                                    className="form-control border-gray-200 radius-6 py-10"
                                    value={formData.toDate}
                                    onChange={(e) => handleChange('toDate', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary small mb-8">Product</label>
                                <Select
                                    options={productList.map(p => ({ value: p._id, label: `${p.productName} (${p.productCode})` }))}
                                    value={formData.productId ? {
                                        value: formData.productId,
                                        label: productList.find(p => p._id === formData.productId)?.productName || 'Select Product'
                                    } : null}
                                    onChange={(opt) => handleChange('productId', opt?.value || "")}
                                    isSearchable
                                    isClearable
                                    placeholder="All Products"
                                    styles={customSelectStyles}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-secondary small mb-8">Customer</label>
                                <Select
                                    options={customerList.map(c => ({ value: c._id, label: `${c.name} (${c.email})` }))}
                                    value={formData.customerId ? {
                                        value: formData.customerId,
                                        label: customerList.find(c => c._id === formData.customerId)?.name || 'Select Customer'
                                    } : null}
                                    onChange={(opt) => handleChange('customerId', opt?.value || "")}
                                    isSearchable
                                    isClearable
                                    placeholder="All Customers"
                                    styles={customSelectStyles}
                                />
                            </div>
                            <div className="col-12 mt-24">
                                <button
                                    type="submit"
                                    className="btn px-32 py-12 radius-8 text-white fw-bold d-inline-flex align-items-center gap-2"
                                    style={{ backgroundColor: primaryColor, border: 'none', transition: 'all 0.2s' }}
                                    disabled={loading}
                                >
                                    <Icon icon="ic:baseline-search" className="text-xl" />
                                    {loading ? "Searching..." : "Search Report"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="divider mb-32 border-bottom"></div>

                {/* Actions & Report results */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-20">
                    <h6 className="mb-0 fw-bold">Sales Summary Results</h6>
                    <button
                        className="btn radius-8 text-white d-flex align-items-center gap-2 px-20 py-10"
                        style={{ backgroundColor: primaryColor, border: 'none' }}
                        onClick={handleExportExcel}
                        disabled={reportData.length === 0}
                    >
                        <Icon icon="mdi:file-excel" className="text-xl" />
                        Export Excel
                    </button>
                </div>

                {/* Report Table */}
                <div
                    className="table-responsive scroll-sm border-0 radius-12 shadow-sm"
                    style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'auto' }}
                >
                    <table className="table mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: '1000px' }}>
                        <thead className="position-sticky top-0" style={{ zIndex: 10 }}>
                            <tr>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Date</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Order ID</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Customer Name</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Product Name</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Variant Name</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Quantity</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0 text-end" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Unit Price</th>
                                <th scope="col" className="text-white fw-bold py-20 px-24 border-0 text-end" style={{ backgroundColor: primaryColor, position: 'sticky', top: 0 }}>Total Price</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {isSearched && reportData.length > 0 ? (
                                reportData.map((item, index) => (
                                    <tr key={index} className="border-bottom hover-bg-light" style={{ transition: 'background 0.2s' }}>
                                        <td className="py-16 px-24 text-secondary">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                                        <td className="py-16 px-24 fw-medium">{item.orderId}</td>
                                        <td className="py-16 px-24 text-secondary">{item.customerName}</td>
                                        <td className="py-16 px-24">{item.productName}</td>
                                        <td className="py-16 px-24 text-center">{item.variantName || '-'}</td>
                                        <td className="py-16 px-24 text-center">{item.quantity}</td>
                                        <td className="py-16 px-24 text-end text-secondary">₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="py-16 px-24 text-end fw-bold" style={{ color: primaryColor }}>₹{Number(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-60 text-muted bg-white">
                                        <div className="d-flex flex-column align-items-center opacity-50">
                                            <Icon icon="mdi:database-search-outline" style={{ fontSize: '48px' }} className="mb-12" />
                                            {isSearched ? "No matching records found for the selected timeframe." : "Configure filters and search to generate your report."}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ProductReportLayer;

import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProductReportLayer from "../components/ProductReportLayer";
import usePermission from "../hook/usePermission";
import AccessDeniedLayer from "../components/AccessDeniedLayer";

const ProductReportPage = () => {
    const hasPermission = usePermission("productReport", "view");
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Product Report" header="Product Report" />
                {hasPermission ? <ProductReportLayer /> : <AccessDeniedLayer />}
            </MasterLayout>
        </>
    );
};

export default ProductReportPage;

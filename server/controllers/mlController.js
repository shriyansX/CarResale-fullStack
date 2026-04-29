const getMlApiUrl = () => {
    const configuredUrl = process.env.ML_API_URL?.trim();

    if (!configuredUrl) {
        return "http://127.0.0.1:8000";
    }

    if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
        return configuredUrl;
    }

    return `http://${configuredUrl}`;
};

export const getMlHealth = async (req, res)=>{
    try {
        const response = await fetch(`${getMlApiUrl()}/health`);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(503).json({
            success: false,
            message: "ML backend is not reachable",
            error: error.message,
        });
    }
}

// export const predictPrice = async (req, res)=>{
//     try {
//         const response = await fetch(`${ML_API_URL}/predict`, {
//             method: "POST",
//             headers: {"Content-Type": "application/json"},
//             body: JSON.stringify(req.body),
//         });
//         const data = await response.json();

//         if(!response.ok){
//             return res.status(response.status).json({
//                 success: false,
//                 message: data.detail || "ML prediction failed",
//             });
//         }

//         res.json(data);
//     } catch (error) {
//         res.status(503).json({
//             success: false,
//             message: "ML backend is not reachable",
//             error: error.message,
//         });
//     }
// }
export const predictPrice = async (req, res)=>{
    try {
        const response = await fetch(`${getMlApiUrl()}/predict`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if(!response.ok){
            return res.status(response.status).json({
                success: false,
                message: data.detail || "ML prediction failed",
            });
        }

        return res.json({
            success: true,
            predictedPrice: data.predictedPrice,
            source: "ML",   // ✅ IMPORTANT
        });

    } catch (error) {
        return res.status(503).json({
            success: false,
            message: "ML backend is not reachable",
            error: error.message,
        });
    }
}

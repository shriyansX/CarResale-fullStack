import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
    let token =
        req.headers.authorization ||
        req.headers["x-access-token"] ||
        req.headers["Authorization"] ||
        req.headers["authorization"];

    if(!token){
        return res.status(401).json({success: false, message: "not authorized"})
    }

    if(typeof token === 'string'){
        token = token.trim()
        if(token.toLowerCase().startsWith('bearer ')){
            token = token.slice(7).trim()
        }
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = typeof decoded === 'string' ? decoded : decoded?.id

        if(!userId){
            return res.status(401).json({success: false, message: "not authorized"})
        }
        req.user = await User.findById(userId).select("-password")
        next();
    } catch (error) {
        return res.status(401).json({success: false, message: "not authorized"})
    }
}

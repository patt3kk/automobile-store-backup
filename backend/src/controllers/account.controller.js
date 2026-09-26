const { hashSync, compareSync } = require("bcryptjs");
const AccountModel = require("../models/account");
const jwt = require("jsonwebtoken");
const { config } = require("../config");
const {cloudinary} = require("../utils/cloudinary");
const ProfileModel = require("../models/profile");
const { isEmailValid, isPhoneNumberValid } = require("../utils/validator");
const { APIError } = require("../middlewares/errorApi");


exports.register = async (req, res, next) =>{
    try{
        const {firstname, lastname, username, dateofbirth, stateoforigin, address, number, email, password,} = req.body;
        
        if(!firstname) return res.status(400).json({error: "first name is required"})
        if(!lastname) return res.status(400).json({error: "last name is required"})
        if(!username) return res.status(400).json({error: "user name is required"})
        if(!dateofbirth) return res.status(400).json({error: "date of birth is required"})
        if(!stateoforigin) return res.status(400).json({error: "state of origin is required"})
        if(!address) return res.status(400).json({error: "address is required"})
        if(!number) return res.status(400).json({error: "Phone Number is required"})
        if(!email) return res.status(400).json({error: "email is required"})
        if(!password) return res.status(400).json({error: "password is required"})

        if(!isPhoneNumberValid(number)) return next(APIError.badRequest("Invalid Number"))

        if(!isEmailValid(email)) return next(APIError.badRequest("Invalid email"))

        
        const usernameExist = await AccountModel.findOne({username}).exec();
        if(usernameExist) return res.status(400).json({error: "username already exists"}); 
        console.log(usernameExist)

        const emailExist = await AccountModel.findOne({
            email
        }).exec();
        
        if(emailExist) return res.status(200).json({error: "email already exist"})
        // console.log(req.body);
        
        const hashedPassword = hashSync(password, 10)

    const user ={
        firstname,
        lastname,
        username,  
        dateofbirth,
        stateoforigin,
        address,
        number,
        email,
        password: hashedPassword,
        type: "user"
    }
    // console.log(user)
    
    const newUser = await AccountModel.create({...user})
    if(!newUser) res.status(400).json({error: "Account failed to create"})
    
    res.status(201).json({ success: true, msg:"Account created successfully"})
    // console.log(newUser)
    } catch (error) {
        next(error)
    }
}




exports.adminRegister = async (req, res, next) =>{
    try{
        const {firstname, lastname, username, dateofbirth, stateoforigin, address, number, email, password,} = req.body;
        
        if(!firstname) return res.status(400).json({error: "first name is required"})
        if(!lastname) return res.status(400).json({error: "last name is required"})
        if(!username) return res.status(400).json({error: "user name is required"})
        if(!dateofbirth) return res.status(400).json({error: "date of birth is required"})
        if(!stateoforigin) return res.status(400).json({error: "state of origin is required"})
        if(!address) return res.status(400).json({error: "address is required"})
        if(!number) return res.status(400).json({error: "Phone Number is required"})
        if(!email) return res.status(400).json({error: "email is required"})
        if(!password) return res.status(400).json({error: "password is required"})

        if(!isPhoneNumberValid(number)) return next(APIError.badRequest("Invalid Number"))

        if(!isEmailValid(email)) return next(APIError.badRequest("Invalid email"))

        
        const usernameExist = await AccountModel.findOne({username}).exec();
        if(usernameExist) return res.status(400).json({error: "username already exists"}); 
        console.log(usernameExist)

        const emailExist = await AccountModel.findOne({
            email
        }).exec();
        
        if(emailExist) return res.status(200).json({error: "email already exist"})
        // console.log(req.body);
        
        const hashedPassword = hashSync(password, 10)

    const user ={
        firstname,
        lastname,
        username,  
        dateofbirth,
        stateoforigin,
        address,
        number,
        email,
        password: hashedPassword,
        type: "admin"
    }
    // console.log(user)
    
    const newUser = await AccountModel.create({...user})
    if(!newUser) res.status(400).json({error: "Account failed to create"})
    
    res.status(201).json({ success: true, msg:"Account created successfully"})
    // console.log(newUser)
    } catch (error) {
        next(error)
    }
}










exports.login = async (req, res, next) => {
    try {
        let token = req.headers?.cookie?.split("=")[1];
        const {username, password} = req.body;
        if(!username) return res.status(400).json({error: "username is required"});
        if(!password) return res.status(400).json({error: "password is required"});

        const userExist = await AccountModel.findOne({username});
        if(!userExist) return next(APIError.notFound("User not found"));


        const checkUser = compareSync(password, userExist.password)
        if(!checkUser) return res.status(400).json({error: "Incorrect password"})
        if(userExist.state === "deactivated") return next(APIError.unauthorized("Account has been deactivated"))

        // if(userExist.refreshToken.length > 0)return res.status(403).json({error:"You're already logged in"})
        if (token) return res.status(403).json({error: "You are already logged in"})
        //authentication
         const payload = {
            id: userExist._id.toString(),
            email:userExist.email,
            role: userExist.type
        };
        // console.log(payload)
         const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
         const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
        //  userExist.refreshToken = [...userExist.refreshToken, refreshToken]
        userExist.refreshToken.push(refreshToken)
        userExist.save();
        res.cookie(
            "bflux", accessToken, {
                httpOnly:false,
                secure:true,
                samesite: "none",
                maxAge: 60*60 * 1000
            }
        )

         return res.status(200).json({
            // success: true,
            msg: "login successful",
            user:{
                username: userExist.username,
                email: userExist.email,
                firstname:userExist.firstname,
                lastname:userExist.lastname,
                address:userExist.address,
                stateoforigin:userExist.stateoforigin,
                dateofbirth:userExist.dateofbirth,
            },
            accessToken,
            refreshToken,
         })
    }catch(error){
        next(error)
    }
}







exports.adminLogin = async (req, res, next) => {
    try {
        let token = req.headers?.cookie?.split("=")[1];
        const {username, password} = req.body;
        if(!username) return res.status(400).json({error: "username is required"});
        if(!password) return res.status(400).json({error: "password is required"});

        const userExist = await AccountModel.findOne({username});
        if(!userExist) return next(APIError.notFound("User not found"));


        const checkUser = compareSync(password, userExist.password)
        if(!checkUser) return res.status(400).json({error: "Incorrect password"})
        if(userExist.state === "deactivated") return next(APIError.unauthorized("Account has been deactivated"))

        if (token) return res.status(403).json({error: "You are already logged in"})
        //authentication
         const payload = {
            id: userExist._id.toString(),
            email:userExist.email,
            role: userExist.type
        };
        // console.log(payload)
         const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
         const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
        //  userExist.refreshToken = [...userExist.refreshToken, refreshToken]
        userExist.refreshToken.push(refreshToken)
        userExist.save();
        res.cookie(
            "bflux", accessToken, {
                httpOnly:false,
                secure:true,
                samesite: "none",
                maxAge: 60*60 * 1000
            }
        )

         return res.status(200).json({
            // success: true,
            msg: "login successful",
            user:{
                username: userExist.username,
                email: userExist.email,
                firstname:userExist.firstname,
                lastname:userExist.lastname,
                address:userExist.address,
            },
            accessToken,
            refreshToken,
         })
    }catch(error){
        next(error)
    }
}







// const validateEmail=(email) =>{
//     const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// } 
// if(validateEmail(email)) {
//     console.log("email is vaild");
// }else {
//     console.log("email is not valid");
// }




// exports.updateProfile = async (req, res, next) =>{
//     try{
//         const {fileData} = req.body;
//         //first image upload
//         const profile = {};
//         if(fileData){
            
//         }
//     }catch(error){
// next(error)
//     }
// }










exports.uploadPicture = async (req, res) => {
    try{
        if(!req.userId) return next(APIError.unauthenticated());
        if (!req.body.file) return next(APIError.badRequest("No file uploaded"));

        const user = await AccountModel.findOne({_id:req.userId}).exec();
        if(!user) return next(APIError.notFound("User does not exist"));
        //upload file to cloudinary
        const result = await cloudinary.uploader.upload(req.file);

        //   console.log(result)

        //after uploading, you can save the cloudinary URL to your database or perform other actions
        const profile = {
            imageId: result.public_id,
            imageUrl: result.secure_url,
            user: req.userId,
        }
        const createPro = await ProfileModel.create({...profile});
        if(!createPro) return next(APIError.badRequest("Profile Update failed, try again"));
        if(createPro.error) return next(APIError.badRequest(createPro.error));
        res.status(200).json({success: true, msg:"Profile Updated Successfully"});
    }catch(error){
        next(error)
    }
};

//////////////////////////////////////////////////////////


// exports.updateProfile = async (req, res) =>{

//     const {imageid, imageUrl, facebookUrl, instagramUrl, user,} = req.body;

//     try{
//         const result = await cloudinary.uploader.upload(image,{
//             folder: "profile",
//         })
        
//     }catch(error){
//         return(error)
//     }
// }






exports.updateAccountStatus = async(req, res, next) => {
    try{
        const{id,state}= req.body;
        if(!id) return next(APIError.badRequest("Account id is required"));
        if(!state) return next(APIError.badRequest("Account state is required"));
        const userExist = await AccountModel.findOne({_id:id.toString()});
        if(!userExist) return next(APIError.notFound());
        if(userExist.error) return next(APIError.badRequest(userExist.error));

        userExist.state = state;
        userExist.save();
        res.status(200).json({success: true, msg:"Account state updated"})
    }catch(error){
        next(error)
    }
}




exports.userAccounts = async (req, res, next) => {
    try {
        const users = await AccountModel.find({}).exec();
        if(users.length === 0) return next(APIError.notFound());
        res.status(200).json({success: true, msg: "Found", users})

    } catch(error){
      next(error)      
    }
}



exports.logout = async (req, res, next) => {
    try{
        let token = req.headers?.authorization?.split(" ")[1];
        if(!token) token = req.cookie?.bflux;
        if(!token) token = req.headers?.cookie?.split("=")[1];
        const {refreshToken} = req.body;

        if(!refreshToken) return res.status(400).json({error:"Refresh Token is required"})
        if(!token) return res.status(400).json({error: "Access Token is required"});
        const checkToken = jwt.decode(token)
        if(!checkToken || checkToken.error) return next(APIError.unauthenticated());

        const foundUser = await AccountModel.findOne({refreshToken}).exec();
        //Detected refresh token re-use
        if(!foundUser) {
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET , async (err, decoded) =>{
                if(err) return next(APIError.unauthorized("Invalid Refresh Token"));
                const usedToken = await AccountModel.findOne({_id:jwt.decoded.id}).exec();
                usedToken.refreshToken = [];
                usedToken.save();
            });
            console.log(foundUser)
            return next(APIError.unauthorized("Invalid Refresh Token"))
        }


        const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
        //evaluate jwt
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async(err, decoded) => {
            if(err) {
                foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
            }
            if (err || foundUser._id.toString() !== decoded.id) return next(APIError.unauthenticated("Token expired"));
        });
        foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
        res.clearCookie("bflux");
        res
        .status(200)
        .json({success: true, msg: "You have successfully logged Out"})

    } catch(error){
        next(error)
    }
}




exports.handleRefreshToken = async (req, res, next) => {
    try{
        
        let token = req.headers?.authorization?.split(" ")[1];
        if (!token) token = req.headers?.cookie?.split("=")[1];
        const {refreshToken} = req.body;
        if(!refreshToken) return next(APIError.badRequest("Refresh Token is required"));
        if(!token) return next(APIError.badRequest("Access Token is required"));
        const checkToken = jwt.decode(token, config.ACCESS_TOKEN_SECRET);
        if(!checkToken || checkToken.error) return next(APIError.unauthenticated());

        const foundUser = await AccountModel.findOne({refreshToken}).exec();
        //Detected refresh token re-use
        if(!foundUser) {
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET , async (err, decoded) =>{
                if(err) return next(APIError.unauthorized("Invalid Refresh Token"));
                const usedToken = await AccountModel.findOne({_id:jwt.decoded.id}).exec();
                usedToken.refreshToken = [];
                usedToken.save();
            });
            console.log(foundUser)
            return next(APIError.unauthorized("Invalid Refresh Token"))
        }

        const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
        //evaluate jwt
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if(err){
                foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
            }
            if(err || foundUser.id.toString() !== decoded.id) return next(APIError.unauthenticated("Token Expired"))
        });



        const payload = {
            id: foundUser._id/*.toString()*/,
            email:foundUser.email,
            role: foundUser.type
        };
        // console.log(payload)
         const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
         const newRefreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
         foundUser.refreshToken = [...newRefreshTokenArr, newRefreshToken]
        foundUser.save();
        res.cookie(
            "bflux", accessToken, {
                httpOnly:false,
                secure:true,
                samesite: "none",
                // maxAge: 60*60 * 1000
            }
        )

         return res.status(200).json({
            success: true,
            msg: "login successful",
            accessToken,
            newRefreshToken,
         })

    }catch(error){
        next(error)
    }
}



exports.userCheckToken = async (req, res, next) =>{
    try{
        res.status(200).json({success: true, msg: "token is valid"});
    }catch(error){
        next(error)
    }
}
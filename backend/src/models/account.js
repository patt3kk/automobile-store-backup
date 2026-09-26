// const { Schema, model } = require("mongoose");


// const AccountSchema = new Schema({
//     firstname:{
//         type: String,
//         required: true,
//     },
//     lastname:{
//         type: String,
//         required: true,
//     },
//     username:{
//         type: String,
//         required: true,
//         unique: true,
//         indexed:true,
//     },
//     dateofbirth:{
//         type: Date,
//         required: true,
//     },
//     stateoforigin:{
//         type: String,
//         required: true,
//     },
//     address:{
//         type: String,
//         required: true,
//     },
//     email:{
//         type: String,
//         required: true,
//         unique: true,
//         indexed: true,
//     },
//     number:{
//         type: String,
//         required: true,
//         unique: true,
//     },
//     password:{
//         type: String,
//         required: true,
//     },
//     refreshToken:{
//         type:[],
//     },
//     type:{
//         type:String,
//         required: true,
//         enum: ["admin", "user"],
//         indexed: true,
//     },
//     state:{
//         typr: String,
//         required: true,
//         default: "active",
//         enum:['active', 'suspended', 'deactivated'],
//     }
// },
//     {timestamps:true}
// )
// const AccountModel = model("Account", AccountSchema)
// module.exports = AccountModel;




const { Schema, model } = require("mongoose")

const AccountSchema = new Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
       required:true,
       unique:true,
       indexed:true,
    },
    email:{
        type:String,
       required:true,
       unique:true,
       indexed:true,
    },
    number:{
       type:String,
       required:true,
       unique:true,
       indexed:true,
    },
    dateofbirth:{
        type:Date,
        required:true,
    },
    // origin:{
    //     type:String,
    //     required:true,
    // },
    address:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    refreshToken:{
        type:[]
    },
    type:{
        type:String,
        required:true,
        enum: ["admin", "user"]
    },
    state: {
        type: String,
        required: true,
        enum: ["active", "suspended", "deactivated"],    // active..everything can be accessed, suspended..only login buhh can't ..deactivated..can't login 
        default: "active",
        
    }
},{timestamps: true}
)
const   AccountModel = model("Account", AccountSchema)
module.exports = AccountModel;


//an array is used to provide multiple elements
//enum (enumerator) is used to provide constant data
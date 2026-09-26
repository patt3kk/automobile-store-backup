// const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;

const regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
const phoneRegex = new RegExp("[0-9]{11}");

const isEmailValid = (email) => {
    return regex.test(email);
}




// const numval = new RegExp("[+234]+[0-9]{12,13}");

// if (!numval.startsWith("234")) {
//     numval = "234" + numval;
// }
 
// const formatted = "+" + numval;

// return formatted;






// const numval = new RegExp("[+234]+[0-9]{12,13}");

// const isNumValid = (number) => {
//     return numval.test(number);
// }







// const phoneNumber = ("Please enter a phone number starting with +234:");

// const nigerianPhoneNumberRegExp = /^\+234[0-9]{9,13}$/;

// const isNumberValid = (pnumber) => {
//     return nigerianPhoneNumberRegExp.test(pnumber);
// }



const isPhoneNumberValid = (number)=>{
    if(isNaN(number))return false;
    if (number.charAt(0) !== "0") return false;
    return phoneRegex.test(number)
}





module.exports = {
    isEmailValid,
    isPhoneNumberValid,
}
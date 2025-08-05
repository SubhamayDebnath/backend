// email validation
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// cookie option
const isProduction = process.env.NODE_ENV === 'production';
const cookieOption = {
    httpOnly: true,
    secure: isProduction, 
}

export { isValidEmail, cookieOption };
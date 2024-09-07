const User = require("../Schema/user");
const { comparePass, hashPassword } = require("../utils/hashPassword");
const { createJwt } = require("../utils/jwt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();

const SignUp = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    user_name,
    phone_number,
    password,
    confirm_password,
    company_name,
    company_address,
    occupation,
    country,
    partners,
    start_date,
    update_date,
    end_date,
    stock_in,
    stock_out,
    pending_dues,
    last_stock_id,
    invoice_no,
  } = req.body;

  try {
    const ExistingEmail = await User.findOne({ email });
    const ExistingPhone = await User.findOne({ phone_number });
    const ExistingUserName = await User.findOne({ user_name });

    if (ExistingEmail) {
      return res.status(400).json({ msg: "Email is already registered!" });
    } else if (ExistingPhone) {
      return res
        .status(400)
        .json({ msg: "Phone number is already registered!" });
    } else if (ExistingUserName) {
      return res.status(400).json({
        msg: "Username already exists! Please choose another username.",
      });
    } else if (password !== confirm_password) {
      return res.status(400).json({ msg: "Passwords do not match!" });
    }

    const hashedPassword = hashPassword(password);
    const dbUser = {
      first_name,
      last_name,
      email,
      user_name,
      phone_number,
      company_name,
      company_address,
      occupation,
      country,
      password: hashedPassword,
      partners,
      start_date,
      update_date,
      end_date,
      stock_in,
      stock_out,
      pending_dues,
      last_stock_id,
      invoice_no,
    };

    const user = await User.create(dbUser); // Create new user in the database

    if (!user) {
      return res.status(500).json({ msg: "Failed to create an account" });
    }
    res.status(201).json({ msg: "User created in DB" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const LogIn = async (req, res) => {
  const { login_variable, password } = req.body;

  if (!login_variable) {
    return res
      .status(400)
      .json({ msg: "Sorry! please provide valid credentials" });
  }
  if (!password) {
    return res.status(400).json({ msg: "Sorry! please provide a password" });
  }

  let user;
  if (isNaN(login_variable)) {
    user = await User.findOne({ user_name: login_variable });
  } else {
    user = await User.findOne({ phone_number: login_variable });
  }

  if (!user) return res.status(401).json({ msg: "Sorry! user not found" });

  // check if end date is not today or in past
  const today = new Date();
  const endDate = new Date(user.end_date);

  if (endDate <= today) {
    return res
      .status(403)
      .json({ msg: "Sorry! your Trial/Subscription pack is over" });
  }

  const isPassCorrect = comparePass(password, user.password);

  if (!isPassCorrect) {
    return res.status(401).json({ msg: "Sorry! the password is incorrect" });
  } else {
    user = { userID: user._id, email: user.email };
    const accessToken = createJwt(user);

    // Cookie set
    res.cookie("JWT_token", accessToken, {
      httpOnly: true,
      expire: new Date(86400000 + Date.now()),
    });
    return res.status(200).json({ msg: "Successfully logged in", accessToken });
  }
};
const GetUser = async (req, res) => {
  const identifier = req.params.identifier;

  try {
    let user;
    if (isNaN(identifier)) {
      user = await User.findOne({ user_name: identifier });
    } else {
      user = await User.findOne({ phone_number: identifier });
    }
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const { password, confirm_password, ...userData } = user.toObject();
    res.status(200).json(userData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
const Verify = async (req, res) => {
  const { email } = req.body; // Destructure email from the request body
  console.log("email is", email);
  const otp = crypto.randomInt(100000, 999999);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // or 'STARTTLS'
    auth: {
      user: "superb.diamonds@gmail.com",
      pass: process.env.TWO_FACTOR_AUTH, // This should ideally be stored in environment variables for security
    },
  });

  const mailOptions = {
    from: "superb.diamonds@gmail.com",
    to: email,
    subject: "Verify your email address",
    text: `Your OTP for email verification is: ${otp}. Please enter this code to complete your registration with Superb Diamonds.`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .logo {
          color: #0066cc;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .content {
          background-color: #f9f9f9;
          border-radius: 5px;
          padding: 20px;
        }
        .otp {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #0066cc;
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          background-color: #e6f2ff;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="logo">Superb Diamonds</div>
      <div class="content">
        <h2>Email Verification</h2>
        <p>Thank you for signing up with Superb Diamonds. To complete your registration, please use the following One-Time Password (OTP):</p>
        <div class="otp">${otp}</div>
        <p>Enter this OTP on our website to verify your email address.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
      <p>Best regards,<br>The Superb Diamonds Team</p>
    </body>
    </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.status(200).json({
      message: "Verification email sent successfully",
      data: { otp: otp, email: email },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send verification email", error });
  }
};

module.exports = { SignUp, LogIn, GetUser, Verify };

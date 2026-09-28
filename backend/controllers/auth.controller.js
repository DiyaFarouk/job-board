const User = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const signUp = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // validate fields
        if (!email || !name || !password || !role) {
            return res.status(400).json({ message: "Fill in all details" })
        }

        // check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // hash password
        const hashedPassword = bcrypt.hashSync(password, 10)

        // create and save user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        })

        await user.save()

        // generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        // send response
        return res.status(201).json({
            message: "Sign up successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (err) {
        return res.status(500).json({
            message: "Error signing up",
            error: err.message
        })
    }
}

const signIn = async (req,res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({message:"Fill in all the fields"})
        }

        const user = await User.findOne({email});
             if(!user) {
                return res.status(404).json({message:"User not found"})
            }

        const isPasswordValid = await bcrypt.compare(password,user.password);
        if (!isPasswordValid)  {
            return res.status(401).json({message:"Invalid email or password"});
        }  
        const token =jwt.sign({ id:user._id},process.env.JWT_SECRET);

        res.cookie("access_token", token, {
            httpOnly:true,
            path:"/",
        })
        return res.status(200).json({message:"Sign in successful"});
           
        
    } catch (error) {
        return res.status(500).json({message:"Error Signing in",error:err.message})
    }
}

module.exports = { signUp , signIn}
import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/config/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // find user
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // check password
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash || ""
    )

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    )

    // set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user,
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // true in production
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
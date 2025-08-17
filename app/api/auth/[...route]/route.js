import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB, User } from "@/lib/mongodb";

export const runtime = "nodejs";

/**
 * Validate registration/login payloads.
 * @param {any} body
 * @returns {{ valid: boolean, username?: string, password?: string, error?: string }}
 */
function validateCredentials(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON body" };
  }
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!username || !password) {
    return { valid: false, error: "Username and password are required" };
  }
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  return { valid: true, username, password };
}

/**
 * GET /api/auth/me -> return user from JWT
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });
  
  const { verifyToken } = await import("@/lib/auth");
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ user: null }, { status: 200 });
  
  try {
    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    
    return NextResponse.json({ 
      user: { 
        id: user._id.toString(), 
        username: user.username 
      } 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

/**
 * Handle POST requests for /api/auth/register, /api/auth/login, /api/auth/logout
 */
export async function POST(request, { params }) {
  const segments = Array.isArray(params?.route) ? params.route : [];
  const action = segments[0] || "";

  if (action === "logout") {
    const res = NextResponse.json({ message: "Logged out" }, { status: 200 });
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return res;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateCredentials(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { username, password } = validation;

  try {
    await connectDB();

    if (action === "register") {
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        password: hashedPassword
      });

      await user.save();
      console.log(`User registered successfully: ${username}`);

      return NextResponse.json({ message: "Registration successful" }, { status: 201 });
    }

    if (action === "login") {
      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        console.log(`Login failed: User not found for username: ${username}`);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      console.log(`Login attempt for user: ${username}, user found: ${!!user}`);
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Password comparison result: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.log(`Login failed: Password mismatch for username: ${username}`);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Generate JWT token
      const { generateToken } = await import("@/lib/auth");
      const token = generateToken({ 
        id: user._id.toString(), 
        username: user.username 
      });
      console.log(`Login successful for user: ${username}`);

      const res = NextResponse.json(
        { user: { id: user._id.toString(), username: user.username } },
        { status: 200 }
      );

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(`${action} error:`, error);
    return NextResponse.json({ 
      error: `${action === "register" ? "Registration" : "Login"} failed` 
    }, { status: 500 });
  }
}
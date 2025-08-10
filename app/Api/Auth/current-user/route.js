// app/api/auth/current-user/route.js - Fixed version
import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(request) {
  try {
    console.log('🔍 Current user endpoint called');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 Token check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 10) + '...' : 'none'
    });
    
    // If no token, return 401
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'No authentication token provided' }, 
        { status: 401 }
      );
    }
    
    // Validate the session/token
    const user = await validateSession(request);
    
    if (!user) {
      console.log('❌ Session validation failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' }, 
        { status: 401 }
      );
    }
    
    console.log('✅ User validated:', { id: user.id, email: user.email, role: user.role });
    
    // Return user data (exclude sensitive information)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim(),
      // Add any other safe user properties
    };
    
    return NextResponse.json(userData);
    
  } catch (error) {
    console.error('💥 Current user endpoint error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
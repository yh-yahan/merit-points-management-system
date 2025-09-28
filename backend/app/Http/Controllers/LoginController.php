<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Students;
use App\Models\Teachers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Cookie;

class LoginController extends Controller
{
    public function Login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'remember' => 'boolean|required',
        ]);

        // rate limiting for login attempts
        $email = $fields['email'];
        $key = 'login-attempt:' . $email . ':' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response([
                'message' => 'Too many login attempts. Please try again later.'
            ], 429);
        }
        RateLimiter::hit($key, 60);

        $guards = ['admin', 'teacher', 'student'];
        $user = null;
        $guardUsed = null;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->attempt([
                'email' => $fields['email'],
                'password' => $fields['password'],
            ], $request->boolean('remember'))) {
                $user = Auth::guard($guard)->user();
                $guardUsed = $guard;
                break;
            }
        }

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Generate token
        $token = $user->createToken(
            $guardUsed . '_token',
            [$guardUsed],
            now()->addDays($request->boolean('remember') ? 30 : 7)
        )->plainTextToken;

        // set cookie
        $cookieExpiration = now()->addDays($request->boolean('remember') ? 30 : 7)->timestamp;
        $cookie = new Cookie('auth_token', $token, $cookieExpiration, '/', null, true, true, false, 'None', true);

        $response = [
            'user' => $user,
            'role' => $guardUsed,
        ];

        return response($response, 201)->withCookie($cookie);
    }

    function CheckAuth(Request $request)
    {
        $token = $request->cookie('auth_token');

        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken || now()->greaterThan($accessToken->expires_at)) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $user = $accessToken->tokenable;
        $role = $accessToken->abilities[0] ?? 'unknown';

        return response([
            'user' => $user,
            'role' => $role,
        ], 200);
    }

    public function Logout(Request $request)
    {
        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);

        if ($accessToken) {
            $accessToken->delete();
        }

        return response([
            'message' => 'Logged out'
        ], 200)->withCookie(cookie()->forget('auth_token'));
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        if ($accessToken->name !== 'adminToken') {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}

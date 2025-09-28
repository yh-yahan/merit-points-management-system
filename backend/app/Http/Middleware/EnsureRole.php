<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken || !in_array($role, $accessToken->abilities)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}

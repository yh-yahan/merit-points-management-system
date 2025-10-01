<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventDemoEdits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $demoAccounts = [
            'adminEmail@example.com',
            'teacherEmail@example.com',
            'studentEmail@example.com',
        ];

        if ($user && in_array($user->email, $demoAccounts)) {
            return response()->json([
                'message' => 'Demo accounts cannot perform this action.'
            ], 403);
        }

        return $next($request);
    }
}

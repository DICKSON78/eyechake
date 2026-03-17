<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class HybridAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Debug logging
        Log::info('HybridAuth middleware', [
            'has_bearer_token' => $request->bearerToken() ? true : false,
            'auth_check' => Auth::check(),
            'auth_check_web' => Auth::guard('web')->check(),
            'session_id' => session()->getId(),
            'cookies' => $request->cookie('eyechake_session'),
            'session_user_id' => session('user_id')
        ]);
        
        // First try token authentication (for API calls)
        if ($request->bearerToken()) {
            Log::info('Using token authentication');
            // Try to authenticate with the token
            if (Auth::guard('sanctum')->check()) {
                return $next($request);
            }
            // If sanctum guard fails, try api guard
            if (Auth::guard('api')->check()) {
                return $next($request);
            }
            Log::warning('Token provided but authentication failed');
        }
        
        // If no token, try session authentication with web guard
        if (Auth::guard('web')->check()) {
            Log::info('Using session authentication', ['user_id' => Auth::guard('web')->id()]);
            return $next($request);
        }
        
        // Try manual session authentication
        $userId = session('user_id');
        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                Log::info('Using manual session authentication', ['user_id' => $userId]);
                // Log the user in for this request
                Auth::login($user);
                return $next($request);
            }
        }
        
        // Neither token nor session authentication worked
        Log::warning('No authentication method succeeded');
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Http\Resources\UserResource;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Events\Verified;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends ApiController
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
                
            ]);


            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Send email verification notification
            //$user->sendEmailVerificationNotification();

            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->successResponse([
                'user' => new UserResource($user),
                'token' => $token,
                'email_verification_sent' => true
            ], 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب', 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Registration validation error:', $e->errors());
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            \Log::error('Registration error:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return $this->errorResponse('فشل في إنشاء الحساب: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt($validated)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $user = User::where('email', $validated['email'])->firstOrFail();
            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->successResponse([
                'user' => new UserResource($user),
                'token' => $token
            ], 'Login successful');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Login failed', 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return $this->successResponse(null, 'Logout successful');
        } catch (\Exception $e) {
            return $this->errorResponse('Logout failed', 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        try {
            return $this->successResponse(new UserResource($request->user()), 'User retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve user', 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6|confirmed',
            ]);

            $user = $request->user();

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'كلمة المرور الحالية غير صحيحة'
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تغيير كلمة المرور بنجاح'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'البيانات المدخلة غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'فشل في تغيير كلمة المرور'
            ], 500);
        }
    }

    /**
     * Verify email address
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id' => 'required|integer',
                'hash' => 'required|string',
            ]);

            $user = User::findOrFail($validated['id']);

            // Check if the hash matches
            if (!hash_equals((string) $validated['hash'], sha1($user->getEmailForVerification()))) {
                return $this->errorResponse('رابط التحقق غير صحيح', 400);
            }

            // Check if email is already verified
            if ($user->hasVerifiedEmail()) {
                return $this->successResponse([
                    'user' => new UserResource($user),
                    'already_verified' => true
                ], 'البريد الإلكتروني مفعل مسبقاً');
            }

            // Mark email as verified
            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }

            return $this->successResponse([
                'user' => new UserResource($user),
                'verified' => true
            ], 'تم تفعيل البريد الإلكتروني بنجاح');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('فشل في تفعيل البريد الإلكتروني', 500);
        }
    }

    /**
     * Resend email verification
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return $this->errorResponse('المستخدم غير موجود', 401);
            }

            if ($user->hasVerifiedEmail()) {
                return $this->errorResponse('البريد الإلكتروني مفعل مسبقاً', 400);
            }

            $user->sendEmailVerificationNotification();

            return $this->successResponse(null, 'تم إرسال رابط التحقق إلى بريدك الإلكتروني');
        } catch (\Exception $e) {
            \Log::error('Resend verification email error: ' . $e->getMessage());
            return $this->errorResponse('فشل في إرسال رابط التحقق: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Forgot password
     */
    
     
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        
        // Generate a custom reset token
        $token = Str::random(64);
        $email = $request->email;
        
        // Store the token in password_reset_tokens table
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );
        
        // Generate frontend URL (correct format for React frontend)
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($email);
        
        // Send email with reset link using mail template
        try {
            $user = User::where('email', $email)->first();
            
            Mail::to($email)->send(new PasswordResetMail($user, $resetUrl));
            
            return response()->json([
                'success' => true,
                'message' => 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور'
            ]);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ]);
        
        // Find the password reset record
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();
        
        if (!$passwordReset) {
            return response()->json([
                'success' => false,
                'message' => 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية'
            ]);
        }
        
        // Check if token is valid and not expired (60 minutes)
        if (!Hash::check($request->token, $passwordReset->token)) {
            return response()->json([
                'success' => false,
                'message' => 'رمز إعادة التعيين غير صحيح'
            ]);
        }
        
        // Check if token is not expired (60 minutes)
        if (now()->diffInMinutes($passwordReset->created_at) > 60) {
            return response()->json([
                'success' => false,
                'message' => 'رمز إعادة التعيين منتهي الصلاحية'
            ]);
        }
        
        // Find the user and update password
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير موجود'
            ]);
        }
        
        // Update password
        $user->password = Hash::make($request->password);
        $user->setRememberToken(Str::random(60));
        $user->save();
        
        // Delete the password reset record
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح'
        ]);
    }
}

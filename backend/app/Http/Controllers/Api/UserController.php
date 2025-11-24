<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Biography;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends ApiController
{
    /**
     * Display a listing of users
     */
    public function index(): JsonResponse
    {
        try {
            $users = User::paginate(10);
            return $this->successResponse(UserResource::collection($users), 'Users retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve users', 500);
        }
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): JsonResponse
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

            return $this->successResponse(new UserResource($user), 'تم إنشاء الحساب بنجاح', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('فشل في إنشاء الحساب', 500);
        }
    }

    /**
     * Display the specified user
     */
    public function show(User $user): JsonResponse
    {
        try {
            return $this->successResponse(new UserResource($user), 'User retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve user', 500);
        }
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'nickname' => 'sometimes|string|max:255',
                'email' => [
                    'sometimes',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id),
                ],
                'password' => 'sometimes|string|min:6|confirmed',
                'phone' => 'sometimes|string|max:20',
                'state' => 'sometimes|nullable|string|max:255',
                'stage' => 'sometimes|in:primary,middle,secondary',
                'year' => 'sometimes|in:1,2,3,4,5,6',
                'branch' => 'sometimes|nullable|in:science,literature,mathimatics,foreign_languages,technologie,gestion',
                'trial_agreement' => 'sometimes|boolean',
            ]);

            // For middle and primary stages, branch should be null
            if (isset($validated['stage']) && in_array($validated['stage'], ['middle', 'primary'])) {
                $validated['branch'] = null;
            }

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            return $this->successResponse(new UserResource($user), 'تم تحديث البيانات بنجاح');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('فشل في تحديث البيانات', 500);
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            $user->delete();
            return $this->successResponse(null, 'User deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete user', 500);
        }
    }


    // Biography function
    public function biography(): JsonResponse
    {
        $biography = Biography::first();
        if (!$biography) {
            return $this->errorResponse('Biography not found', 404);
        }
        return $this->successResponse($biography, 'Biography retrieved successfully');
    }
}

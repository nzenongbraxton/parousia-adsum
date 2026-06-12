<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, [UserRole::SuperAdmin, UserRole::Admin], true);
    }

    public function rules(): array
    {
        $userRole = $this->user()->role;

        $allowedRoles = match ($userRole) {
            UserRole::SuperAdmin => [UserRole::Admin->value, UserRole::Staff->value],
            UserRole::Admin => [UserRole::Staff->value],
            default => [],
        };

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
        ];
    }
}

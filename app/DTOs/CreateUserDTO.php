<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Enums\UserRole;
use App\Http\Requests\StoreStaffRequest;
use Illuminate\Support\Facades\Hash;

final readonly class CreateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public UserRole $role,
    ) {}

    public static function fromRequest(StoreStaffRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            email: $request->validated('email'),
            password: Hash::make($request->validated('password')),
            role: UserRole::from($request->validated('role')),
        );
    }
}

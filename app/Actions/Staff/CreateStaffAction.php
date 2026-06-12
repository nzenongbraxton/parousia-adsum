<?php

declare(strict_types=1);

namespace App\Actions\Staff;

use App\DTOs\CreateUserDTO;
use App\Models\User;

final readonly class CreateStaffAction
{
    public function execute(User $creator, CreateUserDTO $data): User
    {
        return User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => $data->password,
            'role' => $data->role,
            'company_id' => $creator->company_id,
        ]);
    }
}

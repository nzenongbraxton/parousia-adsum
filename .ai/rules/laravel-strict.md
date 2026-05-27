# Laravel 12 & Inertia.js Strict Development Rules

This document defines the strict coding standards and architectural patterns for the **ParousiaAdsum** Laravel backend. All backend developers and AI agents must adhere to these rules to ensure type safety, maintainability, and clean separation of concerns.

---

## 1. Type Safety & Modern PHP Standards

### Strict Types
Every single PHP file **MUST** declare strict types at the very top of the file:
```php
<?php

declare(strict_types=1);
```

### Type Hinting and Return Types
- All class constants, properties, method arguments, and method return values must have explicit type declarations.
- Use PHP 8.2+ union/intersection types and `mixed` only when absolutely necessary.
- Avoid docblock type annotations unless specifying array shapes or generic collection types for static analysis (e.g., PHPStan/Larastan).

```php
// ❌ BAD
class AttendanceController {
    public function record($request) {
        $userId = $request->user;
        ...
    }
}

//  GOOD
class AttendanceController extends Controller {
    public function record(RecordAttendanceRequest $request): \Inertia\Response {
        $userId = $request->validated('user_id');
        ...
    }
}
```

---

## 2. Slim Controllers, Fat Actions

Controllers must only handle HTTP-level concerns: receiving requests, routing validation, invoking actions/business logic, and returning responses. They **MUST NOT** contain business logic, direct database queries, or extensive data transformation.

### Controller Constraints
- **Maximum 1 Action/Service invocation per controller method.**
- **No inline DB queries, raw SQL, or complex Eloquent builders.**
- **No manual transaction management (`DB::beginTransaction`).**
- **Always return an Inertia response, JSON API response, or Redirect.**

### Action Classes (Domain Logic)
All business logic must reside in dedicated, single-responsibility **Action** classes inside `app/Actions`.
- Actions must do one thing and one thing only.
- Actions should be named with an active verb (e.g., `VerifyCheckInAction`, `ProvisionTenantAction`).
- Actions must expose a single public method, preferably `execute()` or `__invoke()`.
- Inject dependencies via the constructor using PHP constructor property promotion.

#### Example Action:
```php
<?php

declare(strict_types=1);

namespace App\Actions\Attendance;

use App\Models\User;
use App\Models\AttendanceRecord;
use App\DTOs\CheckInData;
use Illuminate\Support\Facades\DB;

final readonly class VerifyAndRecordCheckInAction
{
    public function execute(User $user, CheckInData $data): AttendanceRecord
    {
        return DB::transaction(function () use ($user, $data) {
            // Geofencing & Verification Logic goes here...
            
            return AttendanceRecord::create([
                'user_id' => $user->id,
                'verified_at' => now(),
                'ip_address' => $data->ipAddress,
                'latitude' => $data->latitude,
                'longitude' => $data->longitude,
                'method' => $data->method,
            ]);
        });
    }
}
```

#### Example Slim Controller:
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Attendance\VerifyAndRecordCheckInAction;
use App\Http\Requests\CheckInRequest;
use App\DTOs\CheckInData;
use Inertia\Inertia;
use Inertia\Response;

final class AttendanceController extends Controller
{
    public function store(
        CheckInRequest $request,
        VerifyAndRecordCheckInAction $verifyAndRecordCheckIn
    ): Response {
        $record = $verifyAndRecordCheckIn->execute(
            $request->user(),
            CheckInData::fromRequest($request)
        );

        return Inertia::render('Attendance/Success', [
            'record' => $record->only('id', 'verified_at'),
        ]);
    }
}
```

---

## 3. Request Validation & Data Transfer Objects (DTOs)

- Never use `$request->all()` or `$request->input()` directly in actions or database queries.
- Always use dedicated **Form Request** classes for validation (`php artisan make:request`).
- Map validated request arrays into strongly-typed **Data Transfer Objects (DTOs)** before passing them to Actions or Services. This ensures compile-time check support and strict types across domain borders.

```php
// App/DTOs/CheckInData.php
declare(strict_types=1);

namespace App\DTOs;

use App\Http\Requests\CheckInRequest;

final readonly class CheckInData
{
    public function __construct(
        public float $latitude,
        public float $longitude,
        public string $ipAddress,
        public string $method,
    ) {}

    public static function fromRequest(CheckInRequest $request): self
    {
        return new self(
            latitude: (float) $request->validated('latitude'),
            longitude: (float) $request->validated('longitude'),
            ipAddress: $request->ip(),
            method: $request->validated('method'),
        );
    }
}
```

---

## 4. Inertia.js Integration Rules

When returning data to the React frontend via Inertia:
1. **Never pass entire Eloquent models to the frontend.** Always use **API Resources** or explicit `.only()` arrays to prevent leaking sensitive fields (e.g., `password`, `remember_token`, internal flags).
2. **Handle global shared props** strictly inside `HandleInertiaRequests.php` (e.g., authenticated user, tenant settings, flash messages).
3. **Use strict snake_case for backend data keys** and ensure they map cleanly to frontend camelCase if using a conversion layer, or maintain consistent naming.
4. **Use named route helpers** via Ziggy in Inertia components to maintain route integrity.

---

## 5. Eloquent & Database Strictness

- **Disable lazy loading in development** to catch N+1 query problems early:
  ```php
  // AppServiceProvider.php
  Model::preventLazyLoading(! app()->isProduction());
  ```
- **Strict attribute assignment**: Use explicit `$fillable` arrays or enable strict mass assignment protection via `Model::shouldBeStrict()`.
- **Query Builders**: Encapsulate complex query logic inside Custom Query Builders or Eloquent Scopes instead of inline controller chains.

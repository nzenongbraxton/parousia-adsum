<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class WebhookPayloadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'platform_id' => ['required', 'string'],
            'lat'         => ['required', 'numeric', 'between:-90,90'],
            'lon'         => ['required', 'numeric', 'between:-180,180'],
            'metadata'    => ['sometimes', 'array'],
        ];
    }
}

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
     * Prepare the data for validation based on the platform.
     */
    protected function prepareForValidation(): void
    {
        $platform = $this->route('platform');

        if ($platform === 'telegram') {
            $message = $this->input('message') ?? $this->input('edited_message');

            if ($message && isset($message['location'])) {
                $this->merge([
                    'platform_id' => (string) data_get($message, 'from.id'),
                    'lat'         => data_get($message, 'location.latitude'),
                    'lon'         => data_get($message, 'location.longitude'),
                    'metadata'    => $this->all(),
                ]);
            } elseif ($message && isset($message['from'])) {
                // Merge just the platform_id so the validation explicitly fails on lat/lon, 
                // but we still capture who sent it if needed.
                $this->merge([
                    'platform_id' => (string) data_get($message, 'from.id'),
                ]);
            }
        }
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

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Illuminate\Support\Facades\Log::warning('--- WEBHOOK VALIDATION FAILED ---', $validator->errors()->toArray());
        
        parent::failedValidation($validator);
    }
}

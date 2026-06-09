<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

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
                    'lat' => data_get($message, 'location.latitude'),
                    'lon' => data_get($message, 'location.longitude'),
                    'metadata' => $this->all(),
                ]);
            } elseif ($message && isset($message['from'])) {
                $text = (string) data_get($message, 'text', '');

                if (str_starts_with($text, '/start ')) {
                    // Deep-link kiosk scan: extract the token and bypass GPS validation.
                    $this->merge([
                        'platform_id' => (string) data_get($message, 'from.id'),
                        'kiosk_token' => trim(substr($text, 7)),
                        'metadata' => $this->all(),
                    ]);
                } else {
                    // Any other text message without GPS — validation will fail and be ignored.
                    $this->merge([
                        'platform_id' => (string) data_get($message, 'from.id'),
                    ]);
                }
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isKiosk = $this->has('kiosk_token');

        return [
            'platform_id' => ['required', 'string'],
            'lat' => [Rule::requiredIf(! $isKiosk), 'nullable', 'numeric', 'between:-90,90'],
            'lon' => [Rule::requiredIf(! $isKiosk), 'nullable', 'numeric', 'between:-180,180'],
            'kiosk_token' => ['sometimes', 'string', 'min:16', 'max:128'],
            'metadata' => ['sometimes', 'array'],
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        // Log the failure so we can still debug if needed
        Log::warning('--- WEBHOOK VALIDATION FAILED ---', $validator->errors()->toArray());

        // Return 200 OK so webhook providers (like Telegram) don't endlessly retry
        // messages we intentionally ignore (like text messages without GPS).
        throw new HttpResponseException(
            response()->json([
                'status' => 'ignored',
                'reason' => 'Validation failed (e.g. missing GPS location)',
                'errors' => $validator->errors(),
            ], 200)
        );
    }
}

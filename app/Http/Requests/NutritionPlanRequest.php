<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NutritionPlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'goal' => ['nullable', 'in:bulk,cut,maintain'],
            'use_mock' => ['nullable', 'boolean'],
        ];
    }
}

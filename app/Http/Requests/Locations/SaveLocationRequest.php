<?php

namespace App\Http\Requests\Locations;

use App\Support\LocationOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveLocationRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', Rule::in(LocationOptions::countryCodes())],
            'city' => ['required', 'string', 'max:255'],
            'street_address' => ['required', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:32'],
            'timezone' => ['required', 'string', Rule::in(timezone_identifiers_list())],
            'phone' => ['nullable', 'string', 'max:32'],
        ];
    }
}

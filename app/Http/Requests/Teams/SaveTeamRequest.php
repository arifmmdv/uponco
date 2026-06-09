<?php

namespace App\Http\Requests\Teams;

use App\Enums\BusinessCategory;
use App\Rules\TeamName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTeamRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', new TeamName],
            'timezone' => ['nullable', 'string', Rule::in(timezone_identifiers_list())],
            'business_category' => ['nullable', 'string', Rule::in(BusinessCategory::values())],
        ];
    }
}

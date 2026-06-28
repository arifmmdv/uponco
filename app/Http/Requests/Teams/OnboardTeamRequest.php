<?php

namespace App\Http\Requests\Teams;

use App\Enums\BusinessCategory;
use App\Rules\TeamName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OnboardTeamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->user()?->currentTeam;

        return $team !== null && $this->user()->can('update', $team);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->user()?->currentTeam?->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('teams', 'name')->ignore($teamId), new TeamName],
            'business_category' => ['required', 'string', Rule::in(BusinessCategory::values())],
            'timezone' => ['required', 'string', Rule::in(timezone_identifiers_list())],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'company name',
            'business_category' => 'category',
        ];
    }
}

<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Validator;

class DeleteBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('delete', $this->user()->currentTeam);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $team = $this->user()->currentTeam;

                if ($this->input('name') !== $team->name) {
                    $validator->errors()->add('name', __('The team name does not match.'));
                }
            },
        ];
    }
}

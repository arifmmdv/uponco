<?php

namespace App\Http\Requests\Customers;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveCustomerRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:255'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:255'],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required_without' => __('Enter an email or a phone number so you can contact the customer.'),
            'phone.required_without' => __('Enter a phone number or an email so you can contact the customer.'),
        ];
    }

    /**
     * Get the validated customer attributes.
     *
     * @return array<string, mixed>
     */
    public function customerData(): array
    {
        return $this->validated();
    }
}

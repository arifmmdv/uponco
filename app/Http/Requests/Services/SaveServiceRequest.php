<?php

namespace App\Http\Requests\Services;

use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Models\Service;
use App\Support\ServiceOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $service = $this->route('service');

        if (! $service instanceof Service) {
            return true;
        }

        return $service->category->team_id === $this->user()->currentTeam->id;
    }

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
            'service_category_id' => [
                'required',
                Rule::exists('service_categories', 'id')->where(
                    fn ($query) => $query->where('team_id', $this->user()->currentTeam->id),
                ),
            ],
            'is_active' => ['required', 'boolean'],
            'title' => ['required', 'string', 'max:255'],
            'price_type' => ['required', Rule::enum(PriceType::class)],
            'price' => ['nullable', 'required_if:price_type,fixed', 'numeric', 'min:0', 'max:99999999'],
            'price_min' => ['nullable', 'required_if:price_type,range', 'numeric', 'min:0', 'max:99999999'],
            'price_max' => ['nullable', 'required_if:price_type,range', 'numeric', 'min:0', 'max:99999999', 'gte:price_min'],
            'duration' => ['required', 'integer', 'min:1', 'max:1440'],
            'technical_break' => ['required', 'integer', 'min:0', 'max:1440'],
            'service_type' => ['required', Rule::enum(ServiceType::class)],
            'delivery_type' => ['required', Rule::enum(DeliveryType::class)],
            'online_meeting_provider' => [
                'nullable',
                'required_if:delivery_type,online',
                Rule::in(ServiceOptions::meetingProviderKeys()),
            ],
            'capacity' => ['nullable', 'required_if:service_type,group', 'integer', 'min:1', 'max:10000'],
            'description' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * Get the validated payload normalized for the selected price and type options.
     *
     * @return array<string, mixed>
     */
    public function serviceData(): array
    {
        $data = $this->validated();

        if ($data['price_type'] !== PriceType::Fixed->value) {
            $data['price'] = null;
        }

        if ($data['price_type'] !== PriceType::Range->value) {
            $data['price_min'] = null;
            $data['price_max'] = null;
        }

        if ($data['delivery_type'] !== DeliveryType::Online->value) {
            $data['online_meeting_provider'] = null;
        }

        if ($data['service_type'] !== ServiceType::Group->value) {
            $data['capacity'] = null;
        }

        return $data;
    }
}

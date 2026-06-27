<?php

namespace App\Actions\Fortify;

use App\Actions\Teams\CreateTeam;
use App\Concerns\AccountValidationRules;
use App\Concerns\PasswordValidationRules;
use App\Enums\BusinessCategory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use AccountValidationRules, PasswordValidationRules;

    public function __construct(private CreateTeam $createTeam)
    {
        //
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->accountRules(),
            'password' => $this->passwordRules(),
            'company_name' => ['required', 'string', 'max:255'],
            'business_category' => ['required', 'string', Rule::in(BusinessCategory::values())],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            $this->createTeam->handle(
                $user,
                $input['company_name'],
                isPersonal: true,
                businessCategory: BusinessCategory::from($input['business_category']),
            );

            return $user;
        });
    }
}

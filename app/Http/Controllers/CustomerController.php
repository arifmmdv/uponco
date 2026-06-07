<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customers\SaveCustomerRequest;
use App\Models\Customer;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the team's customers.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('customers/index', [
            'customers' => $team->customers()
                ->orderBy('name')
                ->get()
                ->map(fn (Customer $customer): array => $this->toCustomerArray($customer)),
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(SaveCustomerRequest $request): RedirectResponse
    {
        $request->user()->currentTeam->customers()->create($request->customerData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer created.')]);

        return back();
    }

    /**
     * Update the specified customer.
     */
    public function update(SaveCustomerRequest $request, string $current_team, Customer $customer): RedirectResponse
    {
        $this->authorizeCustomer($request, $customer);

        $customer->update($request->customerData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer updated.')]);

        return back();
    }

    /**
     * Delete the specified customer.
     */
    public function destroy(Request $request, string $current_team, Customer $customer): RedirectResponse
    {
        $this->authorizeCustomer($request, $customer);

        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Customer deleted.')]);

        return back();
    }

    /**
     * Ensure the customer belongs to the user's current team.
     */
    protected function authorizeCustomer(Request $request, Customer $customer): void
    {
        /** @var Team $team */
        $team = $request->user()->currentTeam;

        abort_unless($customer->team_id === $team->id, 403);
    }

    /**
     * Transform a customer into its array representation.
     *
     * @return array<string, mixed>
     */
    protected function toCustomerArray(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ];
    }
}

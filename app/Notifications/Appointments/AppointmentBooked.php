<?php

namespace App\Notifications\Appointments;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentBooked extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Appointment $appointment)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->appointment;
        $team = $appointment->team;
        $timezone = $team->timezone ?: config('app.timezone');

        $start = $appointment->start_at->setTimezone($timezone);
        $end = $appointment->end_at->setTimezone($timezone);

        $location = $appointment->location?->name ?? __('Online');

        return (new MailMessage)
            ->subject(__('Your appointment with :team is confirmed', ['team' => $team->name]))
            ->greeting(__('Hi :name,', ['name' => $appointment->customer->name]))
            ->line(__('Your appointment with :team is booked. Here are the details:', ['team' => $team->name]))
            ->line(__('**Service:** :service', ['service' => $appointment->service->title]))
            ->line(__('**Specialist:** :specialist', ['specialist' => $appointment->specialist->name]))
            ->line(__('**Location:** :location', ['location' => $location]))
            ->line(__('**Date:** :date', ['date' => $start->translatedFormat('l, j F Y')]))
            ->line(__('**Time:** :start–:end', [
                'start' => $start->format('H:i'),
                'end' => $end->format('H:i'),
            ]))
            ->when($appointment->notes, fn (MailMessage $message) => $message->line(
                __('**Notes:** :notes', ['notes' => $appointment->notes]),
            ))
            ->line(__('If you need to make any changes, just reply to this email and we will help you out.'))
            ->salutation(__('See you soon, :team', ['team' => $team->name]));
    }
}
